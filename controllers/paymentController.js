
const User = require("../model/userModel");
const Cart = require("../model/cart");
const Order = require("../model/order")
const Product = require('../model/productModel')
const Coupon = require('../model/coupon')
const Address = require('../model/address');
const Razorpay = require('razorpay'); 


const razorpayInstance = new Razorpay({
  key_id: 'rzp_test_S1qqFuHam7RlxX',
  key_secret:'W4yhhQWFboAYuFMOCyhVTHBI'
  
});

const checkOut = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { billingAddress, paymentMethod,totalAmount,selectedCouponCode} = req.body;
    const cart = await Cart.findOne({ user: userId }).populate({
      path: 'products.product',
    });
    console.log(cart);
    let items = cart.products;
    // console.log(items);
    let totalQuantity = items.reduce((acc,item)=> acc+item.quantity,0);
    console.log(totalQuantity);
    let coupon;
    if(selectedCouponCode!==null){
      cart.products.forEach((item) => { 
        item.couponApplied = true;
      });       
      await cart.save();
      coupon = await Coupon.findOne({ couponCode: selectedCouponCode });  
      coupon.usedBy.push(userId);
      coupon.usedUsersCount++; 
      await coupon.save();
       
    }
    const user = await User.findById(userId);  
    const selectedAddress = user.address[billingAddress];  
    const deliveryAddress = await Address.findOne({_id:selectedAddress});   
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }
    const checkAmount = cart.products.reduce(
      (acc, item) => acc + item.product.Price * item.quantity,
      0
    );
      if(paymentMethod==='cod'){
          console.log("inside cod");
          const newOrder = new Order({
            user: userId,
            address: deliveryAddress,
            products: cart.products.map((item) => ({
              product: item.product._id,
              quantity: item.quantity,
              pricePerQnt: item.product.Price,
              discountPrice: item.couponApplied ? ((item.product.Price * item.quantity * coupon.discountValue) / 100) : 0,
            })),
            totalPrice: totalAmount,
            paymentMethod,
            orderStatus: 'Pending',
          });
          await newOrder.save();
             
        for (const item of cart.products) {
            const productId = item.product._id;
            const orderedQuantity = item.quantity;
           
            await Product.findByIdAndUpdate(productId, {
              $inc: { Stock: -orderedQuantity },
            });
          }
          // Clear the user's cart after the order is placed
          cart.products = [];
          // cart.totalAmount = 0;
          await cart.save();
          return res.status(200).json({ success: true, message: 'Order placed successfully' });
      }
      // end of cod
      if(paymentMethod==='Razorpay'){
          console.log("inside razorpay");
          console.log('Razorpay');
            // Convert totalAmount to paise
               const amountInPaise = totalAmount*100;
          const options={      
              amount:amountInPaise,
              currency:'INR',
              receipt:'order_receipt_'+Date.now(),
              payment_capture:1
          }
          razorpayInstance.orders.create(options,(err,data)=>{
                  if(err){
                      console.error('Error creating Razorpay order:', err);
      
                      return res.status(500).json({status:false ,message:'Razorpay order creation failed'})
                  }
                  console.log('Razorpay order created:');
      
                  return res.status(201).json({order:data,selectedCouponCode,totalQuantity,checkAmount})
              })
      }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


const updatePayment = async (req, res) => {
  try {
      console.log('inside the update payment');
      const userId = req.session.userId;
      const { billingAddress, paymentMethod,totalAmount,selectedCouponCode} = req.body;
      let coupon
      if(selectedCouponCode!==null){
        console.log(selectedCouponCode);
         coupon = await Coupon.findOne({ couponCode: selectedCouponCode });  
        console.log("::::::::::"+coupon);        
      }
      console.log(req.body);
      const user = await User.findById(userId);
      const selectedAddress = user.address[billingAddress];
      console.log(selectedAddress);     
      const deliveryAddress = await Address.findOne({_id:selectedAddress});
      console.log(deliveryAddress);       
      const cart = await Cart.findOne({ user: userId }).populate({
          path: 'products.product',
      });

      console.log(cart);
      if (!cart) {
          return res.status(404).json({ status: false, message: 'Cart not found' });
      }
      // const totalAmount = cart.products.reduce(
      //     (acc, item) => acc + item.product.Price * item.quantity,
      //     0
      //   );      
        const payment_details = req.body.payment_details;
      const orderData = {
          user: userId,
          address: deliveryAddress,
          products: cart.products.map((item) => ({
              product: item.product._id,
              quantity: item.quantity,
              pricePerQnt: item.product.Price,
              discountPrice: item.couponApplied ? ((item.product.Price * item.quantity * coupon.discountValue) / 100) : 0,
            })),
          paymentMethod,
          totalPrice: totalAmount, 
          orderStatus: 'Pending',
          payment_id: payment_details.razorpay_payment_id,
          payment_status: 'paid',
          order_Id: payment_details.razorpay_payment_id,
      };

      console.log(orderData);
      
      const newOrder = new Order(orderData);
      await newOrder.save();

      console.log('Order added successfully');

         
          for (const item of cart.products) {
              const productId = item.product._id;
              const orderedQuantity = item.quantity;
             
              await Product.findByIdAndUpdate(productId, {
                $inc: { Stock: -orderedQuantity },
              });
            }
            
            cart.products = [];
            // cart.totalAmount = 0;
            await cart.save();

      
      res.status(200).json({ status: true, message: 'Order placed successfully' });
  } catch (error) {
      console.log(error);
      // res.render('page-404');
  }
};


module.exports={
  updatePayment,
  checkOut
}