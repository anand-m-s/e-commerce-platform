const express = require('express');
const router = express.Router();
const adminController = require("../controllers/adminController")

router.get('/',adminController.adminLog)
router.get('/admindashboard',adminController.admindashboard)
router.get("/adminlogout",adminController.adminlogout)
router.get("/addcategory",adminController.loadcategory)
router.get("/categoryIsListed/:categoryId",adminController.isListedtoggle)
router.get("/addproduct",adminController.loadAddProduct)


router.post("/adminlogin",adminController.adminLogin)
router.post("/addcategory",adminController.addcategory)
router.post("/addproduct",adminController.addproduct);
  

module.exports = router;
