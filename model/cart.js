const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  products: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    quantity: {
      type: Number,
      default: 1,
    },
    couponApplied: {
      type: Boolean,
      default: false
    },
  }],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, { timestamps: true });

const Cart = mongoose.model('Cart', cartItemSchema);

module.exports = Cart;
