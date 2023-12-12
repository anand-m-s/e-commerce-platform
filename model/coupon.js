const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  discountValue: {
    type: Number,
    required: true,
  },
  usedUsersCount: {
    type: Number,
    default: 0,
  },
  usersLimit: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  couponCode: {
    type: String,
    required: true,
  },
  purchaseLimit: {
    type: Number,
  },
  usedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
});

module.exports = mongoose.model('Coupon', couponSchema);
