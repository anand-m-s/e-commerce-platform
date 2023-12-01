const express = require('express');
const router = express.Router();
const adminController = require("../controllers/adminController");
const isAuth = require('../middleware/adminAuth')


router.get('/',adminController.adminLog)
router.get("/adminlogout",adminController.adminlogout)
router.get('/admindashboard',isAuth,adminController.admindashboard)
router.get("/addcategory",isAuth,adminController.loadcategory)
router.get("/categoryIsListed/:categoryId",adminController.isListedtoggle)
router.get("/addproduct",isAuth,adminController.loadAddProduct)
router.get("/usermanagement",isAuth,adminController.usermanage)
router.get('/editproduct/:productId', adminController.editProduct);
router.get("/deleteproduct",adminController.deleteProduct);
router.get('/editcategory', adminController.loadEditCategory);
router.get("/orders",isAuth,adminController.orders);
router.get("/ordersdetails",adminController.orderdetails);


router.post("/useractions",adminController.useraction);
router.post("/adminlogin",adminController.adminLogin);
router.post("/addcategory",adminController.addcategory);
router.post("/addproduct",adminController.addproduct);
router.post("/updateproduct",adminController.updateProduct);
router.post("/updatecategory",adminController.updatecategory);
router.post('/updateOrderStatus',adminController.updateOrderStatus);
  

module.exports = router;
