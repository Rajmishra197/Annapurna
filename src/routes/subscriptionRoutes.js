const express = require('express');
const router = express.Router();
const {
  createSubscription,
  getSubscription,
  pauseSubscription,
  resumeSubscription,
  skipDay,
  cancelSubscription,
} = require('../controllers/subscriptionController');
const authMiddleware = require('../middleware/authMiddleware');

// All subscription routes are protected
router.post('/create', authMiddleware, createSubscription);
router.get('/active', authMiddleware, getSubscription);
router.put('/pause', authMiddleware, pauseSubscription);
router.put('/resume', authMiddleware, resumeSubscription);
router.post('/skip', authMiddleware, skipDay);
router.put('/cancel', authMiddleware, cancelSubscription);

module.exports = router;