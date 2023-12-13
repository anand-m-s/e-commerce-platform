const mongoose= require('mongoose');
const orderSchema= new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  address:{
    type:Object,
    require:true,
},
  products: [{
    product: {
      type: mongoose.Types.ObjectId,
      ref: 'Product',
      require: true
    },
    quantity: {
      type: Number,
      require:true
    },
    pricePerQnt:{
      type:Number,
      require:true
    },
    itemStatus:{
      type:String,
      default:'confirm'
    },
    returnReason:{
      type:String
    },
    cancelDate:{
      type:Date
    },
    discountPrice:{
      type:Number,
    }
  }],
  totalPrice:{
    type:Number,
    require:true,
  },
  orderDate:{
    type:Date,
    default:Date.now
  },                          
  shippedDate:{
    type:Date,
  },
  deliveredDate:{
    type:Date,
  },

  paymentMethod:{
    type:String,
    enum:['cod','Razorpay'],
    require:true
  },
  orderStatus:{
    type:String,
    enum: ['Delivered', 'Pending', 'Cancel Order', 'Out of delivery'],
    require:true
  },

},{timestamps:true});
const Order=mongoose.model('Order',orderSchema);

module.exports=Order;