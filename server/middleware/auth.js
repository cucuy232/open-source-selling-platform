import jwt from 'jsonwebtoken';

const auth = (req, res, next) => {
  const authHeader = req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Access denied. No session token provided.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Appends decoded { id, username } token body to request object
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Session token has expired or is invalid. Please sign in again.' });
  }
};

export default auth;
