const Subscription = require('../models/Subscription');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

// Create subscription
const createSubscription = async (req, res) => {
  try {
    const {
      planType,
      duration,
      selectedItems,
      dailyCost,
      deliveryTime,
    } = req.body;

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Calculate total cost
    const days = duration === 'weekly' ? 7 : 30;
    const totalCost = dailyCost * days;

    // Check wallet balance
    if (user.walletBalance < totalCost) {
      return res.status(400).json({
        success: false,
        message: `Insufficient wallet balance. Need ₹${totalCost} but have ₹${user.walletBalance}`,
      });
    }

    // Calculate dates
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days);

    // Cancel any existing active subscription
    await Subscription.updateMany(
      { userId: req.userId, status: 'active' },
      { status: 'cancelled' }
    );

    // Create new subscription
   // Create new subscription
const subscription = await Subscription.create({
  userId: req.userId,
  planType,
  duration,
  selectedItems,
  dailyCost,
  totalCost,
  deliveryTime,
  startDate,
  endDate,
});

// Deduct total cost from wallet
user.walletBalance -= totalCost;
await user.save();

// Create transaction record
await Transaction.create({
  userId: req.userId,
  type: 'debit',
  amount: totalCost,
  description: `${duration} ${planType} subscription`,
  balanceAfter: user.walletBalance,
});

    return res.status(201).json({
      success: true,
      message: 'Subscription created successfully',
      subscription,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// Get active subscription
const getSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      userId: req.userId,
      status: 'active',
    }).populate('selectedItems.itemId');

    if (!subscription) {
      return res.status(200).json({
        success: true,
        message: 'No active subscription',
        subscription: null,
      });
    }

    return res.status(200).json({
      success: true,
      subscription,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// Pause subscription
const pauseSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findOneAndUpdate(
      { userId: req.userId, status: 'active' },
      { status: 'paused' },
      { new: true }
    );

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'No active subscription found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Subscription paused successfully',
      subscription,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// Resume subscription
const resumeSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findOneAndUpdate(
      { userId: req.userId, status: 'paused' },
      { status: 'active' },
      { new: true }
    );

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'No paused subscription found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Subscription resumed successfully',
      subscription,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// Skip a day
const skipDay = async (req, res) => {
  try {
    const { date } = req.body;

    const subscription = await Subscription.findOne({
      userId: req.userId,
      status: 'active',
    });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'No active subscription found',
      });
    }

    // Add skipped day
    subscription.skippedDays.push(new Date(date));
    await subscription.save();

    // Refund daily cost to wallet
    const user = await User.findById(req.userId);
    user.walletBalance += subscription.dailyCost;
    await user.save();

    // Create refund transaction
    await Transaction.create({
      userId: req.userId,
      type: 'credit',
      amount: subscription.dailyCost,
      description: `Meal skip refund for ${date}`,
      balanceAfter: user.walletBalance,
    });

    return res.status(200).json({
      success: true,
      message: 'Day skipped and amount refunded',
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

// Cancel subscription
const cancelSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findOneAndUpdate(
      { userId: req.userId, status: 'active' },
      { status: 'cancelled' },
      { new: true }
    );

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'No active subscription found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Subscription cancelled successfully',
      subscription,
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
  createSubscription,
  getSubscription,
  pauseSubscription,
  resumeSubscription,
  skipDay,
  cancelSubscription,
};