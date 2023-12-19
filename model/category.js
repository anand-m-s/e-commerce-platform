const mongoose = require('mongoose');
//category

const categorySchema = new mongoose.Schema({
    categoryName: {
        type: String,
        required: true,
    },
    categoryDescription: {
        type: String,
    },
    isListed: {
        type: Boolean,
      default: true, 
    },
  }, {
    timestamps: true, 
  });  


  const Category = mongoose.model('Category', categorySchema);

  module.exports = Category;