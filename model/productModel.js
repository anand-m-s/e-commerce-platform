const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  Name: {
    type: String,
    required: true,
  },
  Category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category', 
    required: true,
  },
  Brand: {
    type: String,
    required: true,
  },
  Description: {
    type: String,
    required: true,
  },
  Price: Number,
  ProductImage:[
    {
      filename: String,
      path: String,
    },
  ],
  Isdeleted: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Product', productSchema);

