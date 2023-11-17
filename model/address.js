const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required:true,
  
  },
  addressline: {
    type: String,
    required:true,
  },
  city: {
    type: String,
    required:true,
  },
  state: {
    type: String,
    required:true,
  },
  landmark: String,
  pincode: {
    type: String,
    required:true,
   
  },
  country: {
    type: String,
    required:true,

  },
  phone: {
    type: String,
    required:true,

  },
  altPhone: String
});

const Address = mongoose.model('Address', addressSchema);

module.exports = Address;
