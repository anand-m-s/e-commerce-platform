const express = require('express');
const router = express.Router();
const userController = require("../controllers/userController")
const setErrorMessage = require('../middleware/errormsg');

router.use(setErrorMessage);

router.get('/',userController.indexlogin);
router.get("/login",userController.loginlogin);
router.get('/home',userController.homelogin);
router.get('/signup',userController.signuplogin);
router.get("/logout",userController.logout);
router.get("/forgotpassword",(req,res)=>{
    res.render("forgotpassword");
})
router.get("/about",(req,res)=>{
    res.render("about")
})
router.get("/contact",(req,res)=>{
    res.render("contact")
})
router.get("/products",userController.displayProduct)
router.post("/login",userController.login);
router.post("/signup",userController.register);
router.post("/forgotpassword",userController.forgotpassword)
router.post('/verify-otp',userController.verifyOtp);

module.exports = router;
