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
      default: true, // Set the default value to true (or false if preferred)
    },
  }, {
    timestamps: true, // Add createdAt and updatedAt timestamps
  });  


  const Category = mongoose.model('Category', categorySchema);

  module.exports = Category;