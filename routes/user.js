const express = require('express');
const router = express.Router();
const userController = require("../controllers/userController")
const cartController = require("../controllers/cartController")
const paymentController = require('../controllers/paymentController')
const orderController = require('../controllers/orderController')
const isAuth = require('../middleware/isAuth')
const {setErrorMessage,locals} = require('../middleware/globalFunc');
router.use(setErrorMessage);
router.use(locals);

router.get('/',userController.indexlogin);
router.get('/signup',userController.signuplogin);
router.get("/login",userController.userLogin);
router.get("/about",userController.about);
router.get("/contact",userController.contact);
router.get("/logout",userController.logout);
router.get("/products",userController.displayProduct);
router.get("/forgotpassword",userController.loadForgotPassword);
router.get('/home',isAuth,userController.homelogin);
router.get("/userprofile",isAuth,userController.loadUserProfile);
router.get("/userAddressEdit",isAuth,userController.editUserAddress);
router.get('/userAddressDelete',isAuth,userController.deleteAddress);
router.get("/userprofileedit",isAuth,userController.userProfileEdit);
router.get("/addtocart",isAuth,cartController.addToCart);
router.get("/checkout",isAuth,userController.loadCheckOutPage);
router.get("/orderlist",isAuth,userController.loadOrderList);
router.get("/orderdetails",isAuth,userController.OrderDetails);
router.get("/search",isAuth,userController.searchResults)
router.get("/categoryfilter",isAuth,userController.categoryFilter)
router.get("/success",isAuth,orderController.successPage)
router.get("/wallet",isAuth,userController.loadWallet)


router.post("/addproductstocart",userController.addProductsToCart);
router.post('/passwordreset', userController.forgotReset);
router.post('/resetpassword',userController.resetpassword);
router.post("/login",userController.login);
router.post("/signup",userController.register);
router.post("/addaddress",userController.addaddress);
router.post("/addresscheckout",userController.addressCheckout);
router.post("/updateaddress",userController.updateAddress);
router.post("/updateuser",userController.updateUser);
router.post('/removeFromCart',cartController.removeFromCart);
router.post('/updateQuantity',cartController.updateQuantity);
router.post("/signupVerify",userController.signupVerify);
router.post('/checkout',paymentController.checkOut);
router.post('/updatePayment',paymentController.updatePayment);
router.post('/cancelproduct',orderController.cancelProduct);
router.post("/return",orderController.returnProduct);
router.post("/apply-coupon",userController.applyCoupon);
  

module.exports = router;
