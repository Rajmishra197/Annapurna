const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Store OTPs temporarily (in production use Redis)
const otpStore = {};

// Generate OTP
const generateOTP = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
};

// Send OTP
const sendOTP = async (req, res) => {
  try {
    const { mobile } = req.body;

    // Validate mobile
    if (!mobile || mobile.length !== 10) {
      return res.status(400).json({
        success: false,
        message: 'Please enter valid 10 digit mobile number',
      });
    }

    // Generate OTP
    const otp = generateOTP();

    // Store OTP with expiry (5 minutes)
    otpStore[mobile] = {
      otp,
      expiry: Date.now() + 5 * 60 * 1000,
    };

    // In production send real SMS here
    // For now just log it
    console.log(`OTP for ${mobile}: ${otp}`);

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully',
      // Remove this in production!
      otp: otp,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// Verify OTP
const verifyOTP = async (req, res) => {
  try {
    const { mobile, otp } = req.body;

    // Check if OTP exists
    if (!otpStore[mobile]) {
      return res.status(400).json({
        success: false,
        message: 'OTP expired or not sent',
      });
    }

    // Check if OTP expired
    if (Date.now() > otpStore[mobile].expiry) {
      delete otpStore[mobile];
      return res.status(400).json({
        success: false,
        message: 'OTP expired. Please request new OTP',
      });
    }

    // Verify OTP
    if (otpStore[mobile].otp !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP',
      });
    }

    // Delete OTP after verification
    delete otpStore[mobile];

    // Find or create user
    let user = await User.findOne({ mobile });

    if (!user) {
      user = await User.create({ mobile });
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        mobile: user.mobile,
        email: user.email,
        address: user.address,
        walletBalance: user.walletBalance,
        referralCode: user.referralCode,
      },
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// Get Profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        mobile: user.mobile,
        email: user.email,
        address: user.address,
        deliveryTime: user.deliveryTime,
        walletBalance: user.walletBalance,
        referralCode: user.referralCode,
      },
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// Update Profile
const updateProfile = async (req, res) => {
  try {
    const { name, email, address, deliveryTime } = req.body;

    const user = await User.findByIdAndUpdate(
      req.userId,
      { name, email, address, deliveryTime },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        mobile: user.mobile,
        email: user.email,
        address: user.address,
        deliveryTime: user.deliveryTime,
        walletBalance: user.walletBalance,
        referralCode: user.referralCode,
      },
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

module.exports = {
  sendOTP,
  verifyOTP,
  getProfile,
  updateProfile,
};