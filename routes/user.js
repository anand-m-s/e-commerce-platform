const express = require('express');
const router = express.Router();
const userController = require("../controllers/userController")
const setErrorMessage = require('../middleware/errormsg');

router.use(setErrorMessage);
router.get('/',userController.indexlogin);
router.get("/login",userController.userLogin);
router.get('/home',userController.homelogin);
router.get('/signup',userController.signuplogin);
router.get("/logout",userController.logout);
router.get("/forgotpassword",)
router.get("/userprofile",userController.loadUserProfile);
router.get("/userAddressEdit",userController.editUserAddress);
router.get('/userAddressDelete',userController.deleteAddress);
router.get("/userprofileedit",userController.userProfileEdit);
router.get("/addproductstocart",userController.addProductsToCart);
router.get("/addtocart",userController.addToCart);



router.get("/about",userController.about);
router.get("/contact",userController.contact);
router.get("/products",userController.displayProduct);
router.post("/login",userController.login);
router.post("/signup",userController.register);
router.post("/forgotpassword",userController.forgotpassword);
router.post("/addaddress",userController.addaddress);
router.post("/updateaddress",userController.updateAddress);
router.post("/updateuser",userController.updateUser);
router.post('/removeFromCart',userController.removeFromCart);
router.post('/updateQuantity',userController.updateQuantity);

module.exports = router;
