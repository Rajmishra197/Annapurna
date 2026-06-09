const express = require('express');
const router = express.Router();
const {
  sendOTP,
  verifyOTP,
  getProfile,
  updateProfile,
} = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

// Public routes (no auth needed)
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);

// Protected routes (auth needed)
router.get('/profile', authMiddleware, getProfile);
router.put('/profile', authMiddleware, updateProfile);

module.exports = router;