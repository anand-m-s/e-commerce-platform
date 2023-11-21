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
  Features:[
    {
      Processor:String,
      Ram:String,
      Storage:String,
      Os:String,
      Color:String,
    }
  ],
  Stock:Number,
  Price: Number,
  SalePrice:Number,
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

