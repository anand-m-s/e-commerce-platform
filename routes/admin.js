const express = require('express');
const router = express.Router();
const adminController = require("../controllers/adminController");


router.get('/',adminController.adminLog)
router.get('/admindashboard',adminController.admindashboard)
router.get("/adminlogout",adminController.adminlogout)
router.get("/addcategory",adminController.loadcategory)
router.get("/categoryIsListed/:categoryId",adminController.isListedtoggle)
router.get("/addproduct",adminController.loadAddProduct)
router.get("/usermanagement",adminController.usermanage)
router.get("/useractions",adminController.useraction);
router.get('/editproduct/:productId', adminController.editProduct);
router.get("/deleteproduct",adminController.deleteProduct);
router.get('/editcategory', adminController.loadEditCategory);
router.get("/orders",adminController.orders);
router.get("/ordersdetails",adminController.orderdetails);


router.post("/adminlogin",adminController.adminLogin);
router.post("/addcategory",adminController.addcategory);
router.post("/addproduct",adminController.addproduct);
router.post("/updateproduct",adminController.updateProduct);
router.post("/updatecategory",adminController.updatecategory);
router.post('/updateOrderStatus',adminController.updateOrderStatus);
  

module.exports = router;
