import mongoose from 'mongoose';

const donationSchema = new mongoose.Schema({
  razorpayPaymentId: {
    type: String,
    required: true,
    unique: true
  },
  razorpayOrderId: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: [1, 'Donation must be at least ₹1']
  },
  name: {
    type: String,
    default: 'Anonymous'
  },
  comment: {
    type: String,
    default: ''
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Can be anonymous donations without active login
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Donation = mongoose.model('Donation', donationSchema);
export default Donation;
