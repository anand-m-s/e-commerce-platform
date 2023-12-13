const express = require('express');
const router = express.Router();
const adminController = require("../controllers/adminController");
const salesController = require("../controllers/salesController");
const productController = require("../controllers/productController")
const isAuth = require('../middleware/adminAuth')
const { upload } = require('../helpers/multerFunc'); 


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
router.get("/productadd",isAuth,adminController.productAdd);
router.get("/salesreport",isAuth,  salesController.getSalesReport);
router.get('/salesreport/:payment',salesController.getFilterSalesReport);
router.get('/dated-sales-report',  salesController.getDatedReport);
router.get("/coupons",isAuth,adminController.loadCoupon)
router.get('/deletecoupon',adminController.deleteCoupon)
router.get('/editcoupon',isAuth,adminController.loadEditCoupon)



router.post("/useractions",adminController.useraction); 
router.post("/adminlogin",adminController.adminLogin);
router.post("/addcategory",adminController.addcategory);
router.post("/addproduct", upload.array('ProductImage', 5),productController.addproduct);
router.post("/updateproduct",upload.array('ProductImage',5),productController.updateProduct);
router.post("/updatecategory",adminController.updatecategory);
router.post('/updateOrderStatus',adminController.updateOrderStatus);
router.post("/coupon",adminController.addCoupon);
router.post("/editcoupon",adminController.updateCoupon)

  
module.exports = router;
