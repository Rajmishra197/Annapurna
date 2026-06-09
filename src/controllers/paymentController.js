
// Initialize Razorpay
const Razorpay = require('razorpay');
const crypto = require('crypto');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

// Initialize Razorpay lazily
const getRazorpay = () => {
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

// Create order
const createOrder = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount < 100) {
      return res.status(400).json({
        success: false,
        message: 'Minimum amount is ₹100',
      });
    }

    // Create Razorpay order
    const razorpay = getRazorpay();
    const order = await razorpay.orders.create({
      amount: amount * 100, // Convert to paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    });

    return res.status(200).json({
      success: true,
      order,
      key: process.env.RAZORPAY_KEY_ID,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Could not create order',
      error: error.message,
    });
  }
};

// Verify payment and add to wallet
const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      amount,
    } = req.body;

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed',
      });
    }

    // Add money to wallet
    const user = await User.findById(req.userId);
    user.walletBalance += amount;
    await user.save();

    // Create transaction record
    await Transaction.create({
      userId: req.userId,
      type: 'credit',
      amount,
      description: 'Wallet Recharge via Razorpay',
      balanceAfter: user.walletBalance,
      paymentId: razorpay_payment_id,
    });

    return res.status(200).json({
      success: true,
      message: 'Payment successful! Wallet recharged.',
      walletBalance: user.walletBalance,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Payment verification failed',
      error: error.message,
    });
  }
};

module.exports = {
  createOrder,
  verifyPayment,
};