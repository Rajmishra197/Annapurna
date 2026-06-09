const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ['sabzi', 'dal', 'rice', 'roti', 'extras'],
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  emoji: {
    type: String,
    default: '🍱',
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
  isSeasonal: {
    type: Boolean,
    default: false,
  },
  tags: [{
    type: String,
    enum: [
      'high-protein',
      'low-oil',
      'spicy',
      'non-spicy',
      'healthy',
      'gym-meal',
      'diabetic-friendly',
    ],
  }],
}, {
  timestamps: true,
});

module.exports = mongoose.model('MenuItem', menuItemSchema);