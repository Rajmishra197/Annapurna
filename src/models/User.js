const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    default: '',
  },
  mobile: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    default: '',
  },
  address: {
    type: String,
    default: '',
  },
  deliveryTime: {
    type: String,
    default: '12PM - 2PM',
  },
  walletBalance: {
    type: Number,
    default: 0,
  },
  referralCode: {
    type: String,
    unique: true,
  },
  referredBy: {
    type: String,
    default: '',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Generate referral code before saving
userSchema.pre('save', async function() {
  if (!this.referralCode) {
    this.referralCode = 'ANNA' +
      Math.random().toString(36).substring(2, 7).toUpperCase();
  }
});

module.exports = mongoose.model('User', userSchema);