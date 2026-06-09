const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  planType: {
    type: String,
    enum: ['breakfast', 'lunch', 'dinner', 'fullday'],
    required: true,
  },
  duration: {
    type: String,
    enum: ['weekly', 'monthly'],
    required: true,
  },
  selectedItems: [{
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MenuItem',
    },
    name: String,
    price: Number,
  }],
  dailyCost: {
    type: Number,
    required: true,
  },
  totalCost: {
    type: Number,
    required: true,
  },
  deliveryTime: {
    type: String,
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'paused', 'expired', 'cancelled'],
    default: 'active',
  },
  skippedDays: [{
    type: Date,
  }],
}, {
  timestamps: true,
});

module.exports = mongoose.model('Subscription', subscriptionSchema);