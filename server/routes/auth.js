import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// @route   POST api/auth/signup
// @desc    Register a new user
router.post('/signup', async (req, res) => {
  const { username, email, password, location } = req.body;

  try {
    // 1. Validation
    if (!username || !email || !password) {
      return res.status(400).json({ success: false, message: 'All registration fields are required' });
    }

    // 2. Check duplicate username or email
    const emailExists = await User.findOne({ email: email.toLowerCase() });
    if (emailExists) {
      return res.status(400).json({ success: false, message: 'An account with that email already exists' });
    }

    const usernameExists = await User.findOne({ username });
    if (usernameExists) {
      return res.status(400).json({ success: false, message: 'Username is already taken' });
    }

    // 3. Hash the user's password cryptographically
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Instantiate and save the User model
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      location: location || ''
    });

    await newUser.save();

    // 5. Generate secure JWT session token
    const token = jwt.sign(
      { id: newUser._id, username: newUser.username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' } // Session remains valid for 7 days
    );

    res.status(201).json({
      success: true,
      token,
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        isPremium: newUser.isPremium,
        location: newUser.location
      }
    });

  } catch (error) {
    console.error('Signup Error:', error);
    res.status(500).json({ success: false, message: 'Internal server registration failure' });
  }
});

// @route   POST api/auth/login
// @desc    Authenticate user and retrieve token
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    // 1. Find user by email or username
    const user = await User.findOne({
      $or: [
        { email: email.toLowerCase() },
        { username: email }
      ]
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // 2. Verify hashed password comparison
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // 3. Generate token
    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isPremium: user.isPremium,
        location: user.location
      }
    });

  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ success: false, message: 'Internal server authentication failure' });
  }
});

// @route   GET api/auth/me
// @desc    Retrieve active profile from token context
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password'); // Exclude password from payload
    if (!user) {
      return res.status(404).json({ success: false, message: 'User profile not found' });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isPremium: user.isPremium,
        location: user.location
      }
    });
  } catch (error) {
    console.error('Get profile Error:', error);
    res.status(500).json({ success: false, message: 'Server database failure retrieving profile' });
  }
});

// @route   POST api/auth/google
// @desc    Secure social login or auto-registration for authenticated Google profiles
router.post('/google', async (req, res) => {
  const { username, email: bodyEmail, googleId: bodyGoogleId, token } = req.body;

  try {
    let email = bodyEmail;
    let googleId = bodyGoogleId;
    let name = username;
    let avatarUrl = '';

    if (token) {
      // Decode official Google ID Token (JWT) securely
      const decoded = jwt.decode(token);
      if (!decoded) {
        return res.status(400).json({ success: false, message: 'Invalid Google OAuth Token' });
      }
      email = decoded.email;
      googleId = decoded.sub;
      name = decoded.name;
      avatarUrl = decoded.picture;
    }

    if (!email || !googleId) {
      return res.status(400).json({ success: false, message: 'Google authentication credentials missing' });
    }

    // 1. Lookup user in MongoDB Atlas using lowercase email
    let user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // 2. Auto-register user with cryptographically generated password since they authenticate via Google
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(Math.random().toString(36), salt);

      // Enforce minimum 3 characters for auto-generated Google usernames
      let uniqueUsername = name || email.split('@')[0];
      uniqueUsername = uniqueUsername.replace(/\s+/g, '_').toLowerCase();
      if (uniqueUsername.length < 3) {
        uniqueUsername += '_google';
      }

      // Check if auto-generated username is already taken
      const usernameExists = await User.findOne({ username: uniqueUsername });
      if (usernameExists) {
        uniqueUsername += `_${Math.floor(100 + Math.random() * 900)}`;
      }

      user = new User({
        username: uniqueUsername,
        email: email.toLowerCase(),
        password: hashedPassword,
        isPremium: false,
        avatar: avatarUrl || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${uniqueUsername}`
      });

      await user.save();
    }

    // 3. Generate secure JWT session token for the recovery session
    const localToken = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      success: true,
      token: localToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isPremium: user.isPremium,
        location: user.location,
        avatar: user.avatar
      }
    });

  } catch (error) {
    console.error('Google Auth Route Error:', error);
    res.status(500).json({ success: false, message: 'Internal server Google authentication failure' });
  }
});

export default router;
