const express = require('express');
const router = express.Router();
const {
  getWallet,
  addMoney,
  deductMoney,
  withdrawMoney,
} = require('../controllers/walletController');
const authMiddleware = require('../middleware/authMiddleware');

// All wallet routes are protected
router.get('/', authMiddleware, getWallet);
router.post('/add', authMiddleware, addMoney);
router.post('/deduct', authMiddleware, deductMoney);
router.post('/withdraw', authMiddleware, withdrawMoney);

module.exports = router;