const User = require('../models/User');
const Transaction = require('../models/Transaction');

// Get wallet balance and transactions
const getWallet = async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const transactions = await Transaction.find({
      userId: req.userId,
    }).sort({ createdAt: -1 }).limit(20);

    return res.status(200).json({
      success: true,
      walletBalance: user.walletBalance,
      transactions,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// Add money to wallet
const addMoney = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount < 100) {
      return res.status(400).json({
        success: false,
        message: 'Minimum recharge amount is ₹100',
      });
    }

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Update wallet balance
    user.walletBalance += amount;
    await user.save();

    // Create transaction record
    await Transaction.create({
      userId: req.userId,
      type: 'credit',
      amount,
      description: 'Wallet Recharge',
      balanceAfter: user.walletBalance,
    });

    return res.status(200).json({
      success: true,
      message: 'Wallet recharged successfully',
      walletBalance: user.walletBalance,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// Deduct money from wallet (daily meal deduction)
const deductMoney = async (req, res) => {
  try {
    const { amount, description } = req.body;

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Check sufficient balance
    if (user.walletBalance < amount) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient wallet balance',
        walletBalance: user.walletBalance,
      });
    }

    // Deduct from wallet
    user.walletBalance -= amount;
    await user.save();

    // Create transaction record
    await Transaction.create({
      userId: req.userId,
      type: 'debit',
      amount,
      description: description || 'Meal Deduction',
      balanceAfter: user.walletBalance,
    });

    return res.status(200).json({
      success: true,
      message: 'Amount deducted successfully',
      walletBalance: user.walletBalance,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// Withdraw money from wallet
const withdrawMoney = async (req, res) => {
  try {
    const { amount } = req.body;

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (user.walletBalance < amount) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient wallet balance',
      });
    }

    // Deduct from wallet
    user.walletBalance -= amount;
    await user.save();

    // Create transaction record
    await Transaction.create({
      userId: req.userId,
      type: 'debit',
      amount,
      description: 'Wallet Withdrawal',
      balanceAfter: user.walletBalance,
    });

    return res.status(200).json({
      success: true,
      message: 'Withdrawal successful',
      walletBalance: user.walletBalance,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

module.exports = {
  getWallet,
  addMoney,
  deductMoney,
  withdrawMoney,
};