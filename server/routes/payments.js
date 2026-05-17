import express from 'express';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import Donation from '../models/Donation.js';
import User from '../models/User.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Initialize Razorpay SDK instance securely with environment variables
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_SqKxfpwEp3ZMCm',
  key_secret: process.env.RAZORPAY_KEY_SECRET || '2Bm39LK2Owgu4ybpBnHWilYJ'
});

// @route   POST api/payments/order
// @desc    Initialize a secure Razorpay order (Requires JWT Authentication)
router.post('/order', auth, async (req, res) => {
  const { amount } = req.body;

  try {
    if (!amount || parseFloat(amount) <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid support donation amount' });
    }

    const options = {
      amount: Math.round(parseFloat(amount) * 100), // Razorpay accepts amounts in lowest subunit (Paise for INR)
      currency: 'INR',
      receipt: `bhejiyo_receipt_${Date.now()}`
    };

    const order = await razorpay.orders.create(options);
    
    res.status(200).json({
      success: true,
      order_id: order.id,
      amount: order.amount,
      key_id: process.env.RAZORPAY_KEY_ID
    });

  } catch (error) {
    console.error('Razorpay Order Creation Error:', error);
    res.status(500).json({ success: false, message: 'Failed to initialize secure checkout transaction' });
  }
});

// @route   POST api/payments/verify
// @desc    Cryptographically verify payment signature, log donation receipt, and upgrade user profile status (Requires JWT Authentication)
router.post('/verify', auth, async (req, res) => {
  const { 
    razorpay_order_id, 
    razorpay_payment_id, 
    razorpay_signature,
    amount, 
    name, 
    comment,
    userId 
  } = req.body;

  try {
    // 1. Input parameters validation
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !amount) {
      return res.status(400).json({ success: false, message: 'Verification transaction hashes are missing' });
    }

    // 2. Cryptographically construct expected signature using Merchant Key Secret
    const signatureBody = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '2Bm39LK2Owgu4ybpBnHWilYJ')
      .update(signatureBody)
      .digest('hex');

    // 3. Match signatures securely
    const isSignatureValid = crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'utf-8'),
      Buffer.from(razorpay_signature, 'utf-8')
    );

    if (!isSignatureValid) {
      return res.status(400).json({ success: false, message: 'Cryptographic receipt signature mismatch! Transaction discarded.' });
    }

    // 4. Record successful donation receipt inside MongoDB
    const newDonation = new Donation({
      razorpayPaymentId: razorpay_payment_id,
      razorpayOrderId: razorpay_order_id,
      amount: parseFloat(amount),
      name: name || req.user.username || 'Registered Member',
      comment: comment || '',
      user: req.user.id // Taken securely from authenticated JWT session context
    });

    await newDonation.save();

    // 5. Securely upgrade the authenticated user's state to Gold Pass (isPremium: true)
    let premiumStatusActivated = false;
    if (req.user.id) {
      const user = await User.findByIdAndUpdate(
        req.user.id,
        { isPremium: true },
        { new: true }
      );
      if (user) {
        premiumStatusActivated = true;
      }
    }

    res.status(200).json({ 
      success: true, 
      message: 'Transaction successfully verified and logged!',
      premiumStatusActivated,
      donationId: newDonation._id
    });

  } catch (error) {
    console.error('Signature Verification Error:', error);
    res.status(500).json({ success: false, message: 'Internal server payment verification failure' });
  }
});

// @route   GET api/payments/donations
// desc     Retrieve the list of recent server donations from MongoDB
router.get('/donations', async (req, res) => {
  try {
    const donations = await Donation.find().sort({ createdAt: -1 }).limit(10);
    res.status(200).json({ success: true, donations });
  } catch (error) {
    console.error('Fetch Donations Error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve donations from MongoDB cloud' });
  }
});

export default router;
