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
router.get("/products",(req,res)=>{
    res.render("productdetails")
})
router.post("/login",userController.login);
router.post("/signup",userController.register);
router.post("/forgotpassword",userController.forgotpassword)

module.exports = router;
