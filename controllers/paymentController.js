const Razorpay = require('razorpay'); 
const razorpayInstance = new Razorpay({
    key_id: 'rzp_test_S1qqFuHam7RlxX',
    key_secret:'W4yhhQWFboAYuFMOCyhVTHB'
});

const Cart = require('../model/cart')
const {  RAZORPAY_SECRET_KEY } = process.env;
const RAZORPAY_ID_KEY = 'rzp_test_S1qqFuHam7RlxX'



// const razorPayOrder = async(req,res)=>{
//     try {
//         console.log('inside raazorpayorder');
//         const userId = req.session.userId;        
//         const cart = await Cart.findOne({ user: userId }).populate({
//             path: 'products.product',
     
//           }); 
//         console.log(cart);
//         const totalAmount = cart.products.reduce(
//             (acc, item) => acc + item.product.Price * item.quantity,
//             0
//           );   
//           console.log(totalAmount);
//         // const amount = req.body.amount*100

//         const options = {
//             amount: totalAmount * 100,  // Convert to paise (Razorpay expects the amount in smallest currency unit)
//             currency: 'INR',
//             receipt: 'razorUser@gmail.com'
//         };


//         razorpayInstance.orders.create(options, 
//             (err, order)=>{
//                 if(!err){
//                     res.status(200).send({
//                         success:true,
//                         msg:'Order Created',
//                         order_id:order.id,
//                         amount:options.amount,
//                         key_id:'rzp_test_S1qqFuHam7RlxX',
//                         product_name:req.body.name,
//                         description:req.body.description,
//                         contact:"8567345632",
//                         name: "Sandeep Sharma",
//                         email: "sandeep@gmail.com"
//                     });
//                 }
//                 else{
//                     res.status(400).send({success:false,msg:'Something went wrong!'});
//                 }
//             }
//         );

//     } catch (error) {
//         console.log(error.message);
//     }
// }


module.exports = {
  razorPayOrder
}