const session = require("express-session");
const mongoose = require('mongoose');
const Admin = require("../model/adminModel");
const Product = require("../model/productModel");
const User = require("../model/userModel");
const Order = require("../model/order");
const Address = require("../model/address");
const Category = require("../model/category");
const Coupon = require("../model/coupon")
const bcrypt = require("bcrypt");
const Path = require("path");
const sharp = require("sharp")
const { upload } = require('../helpers/multerFunc');
const { log } = require("debug/src/node");
//Admin Login
const adminLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const admin = await Admin.findOne({ email });
    if (admin && admin.isAdmin === true) {
      const passwordMatch = await bcrypt.compare(password, admin.password);
      if (passwordMatch) {
        req.session.adminId = admin._id;
        req.session.email = admin.email;
        res.redirect("/admin/admindashboard");
      } else {
        const errorMessage = "Invalid password";
        res.render("admin/admin-login", { title: "Login", errorMessage });
      }
    } else {
      const errorMessage = "Admin not found";
      res.render("admin/admin-login", {title:'Login', errorMessage });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

const adminLog = (req, res) => {
  try {
    if (req.session.adminId) {
      res.redirect("/admin/admindashboard")
    } else {
      res.render("admin/admin-login",{title:'Login'})
    }

  } catch (error) {
    console.log(error);
  }
};

const adminlogout = (req, res) => {
  try {
    req.session.adminId = null;
    res.redirect('/admin');
  } catch (err) {
    console.error(err);
  }
};

const loadcategory = async (req, res) => {
  try {
    const itemsPerPage = 5; 
    const page = parseInt(req.query.page) || 1;

    const totalCategories = await Category.countDocuments();
    const totalPages = Math.ceil(totalCategories / itemsPerPage);

    const categories = await Category.find()
      .skip((page - 1) * itemsPerPage)
      .limit(itemsPerPage);

    res.render('admin/addcategory', {
      title: 'Category',
      email: req.session.email,
      categories,
      currentPage: page,
      totalPages,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Error fetching category data");
  }
};


const addcategory = async (req, res) => {
  try {
    const { categoryName, categoryDescription, isListed } = req.body;
    const categories = await Category.find();
    const existingCategory = await Category.findOne({ categoryName });
    if (existingCategory) {
      // return res.status(400).send('Category name already exists.');
      return res.render('admin/addcategory', { title:'Category',errorMessage: 'Category name already exists.', categories });
    } else {

      const newCategory = new Category({ categoryName, categoryDescription, isListed });
      await newCategory.save();
      res.redirect("/admin/addcategory")
    }
  } catch (error) {
    console.log(error);
    res.status(500).send('Error adding the category.');
  }
}

const isListedtoggle = async (req, res) => {
  try {
    const categoryId = req.params.categoryId;
    console.log(req.params);
    const category = await Category.findById(categoryId);
    //toggle the isListed property
    category.isListed = !category.isListed;
    await category.save();
    res.redirect("/admin/addcategory")

  } catch (error) {
    console.log(error);
    res.status(500).send('Error toggling category status.');
  }
}



const loadAddProduct = async (req, res) => {
  try {
    const { page = 1, itemsPerPage = 8 } = req.query;
    const skip = (page - 1) * itemsPerPage;
    const categories = await Category.find({ isListed: true });
    const products = await Product.find({}).populate('Category')
      .skip(skip)
      .limit(itemsPerPage);
    const totalProducts = await Product.countDocuments();
    const totalPages = Math.ceil(totalProducts / itemsPerPage);
    res.render('admin/productlist', { title:'Product',categories, products, email: req.session.email, currentPage: parseInt(page), totalPages });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

const productAdd = async (req, res) => {
  const categories = await Category.find({ isListed: true });
  const products = await Product.find({}).populate('Category')

  res.render("admin/addProducts", {title:'Product',categories, products, email: req.session.email })
}




const usermanage = async (req, res) => {
  const ITEMS_PER_PAGE = 4; 
  try {

    const { page = 1, search = '' } = req.query;
    
    const itemsPerPage = 8;
    const skip = (page - 1) * itemsPerPage;
    
    const searchPattern = new RegExp(search, 'i');
    
    const users = await User.find({
      $or: [
        { username: { $regex: searchPattern } },
        { email: { $regex: searchPattern } },
        { phone: { $regex: searchPattern } },
      ],
    })
      .skip(skip)
      .limit(itemsPerPage);
    
    const totalUsers = await User.countDocuments({
      $or: [
        { username: { $regex: searchPattern } },
        { email: { $regex: searchPattern } },
        { phone: { $regex: searchPattern } },
      ],
    });
    
    const totalPages = Math.ceil(totalUsers / itemsPerPage);
    res.render('admin/usermanagement', { title:'UserManagement',email: req.session.email, users, currentPage: parseInt(page), totalPages, search });

  } catch (error) {
    console.log(error);
  }
};


const loadEditCategory = async (req, res) => {
  try {

    categoryID = req.query.id
    const category = await Category.findById(categoryID)
    res.render("admin/editcategory", { title:'Edit',email: req.session.email, category })


  } catch (error) {
    console.log(error);
  }
}

const updatecategory = async (req, res) => {
  try {
    const categoryID = req.query.id
    const category = await Category.findById(categoryID);

    if (!category) {
      return res.status(404).send("Category not found");
    }
    const { categoryName, categoryDescription, isListed } = req.body;
    // Update the category fields
    category.categoryName = categoryName;
    category.categoryDescription = categoryDescription;
    category.isListed = isListed === 'on'; 
    await category.save();
    res.redirect("/admin/addcategory"); 
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred");
  }
};

const deleteProduct = async (req, res) => {
  try {
    const productId = req.query.productId;
    console.log(productId);
    if (!productId) {
      
      return res.status(400).json({ error: 'Product ID is missing in the query parameters' });
    }
    await Product.findByIdAndRemove(productId);
    res.redirect("/admin/addproduct")
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const editProduct = async (req, res) => {
  try {
    const categories = await Category.find({})
    const productId = req.params.productId;
    if (!productId) {
      return res.status(400).json({ error: "Product ID is missing in the query parameteres" });
    }
    const products = await Product.findById(productId);
    // console.log(products);
    if (req.session.adminId) {

      res.render("admin/edit-product", { title:'Edit',products, categories, email: req.session.email })
    } else {
      res.redirect("/admin");
    }
  } catch (error) {
    console.log(error);

  }
}

const useraction = async (req, res) => {
  const { userId, action } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).send("user not found");
    }
    if (action === "block") {
      user.Isblocked = true;
    } else if (action === "unblock") {
      user.Isblocked = false;
    }
    await user.save();
    res.status(200).json({ success: true, user: user });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred' });
  }
}



const orders = async (req, res) => {
  try {
    const { page = 1, itemsPerPage = 10} = req.query;
    const skip = (page - 1) * itemsPerPage;
    const orders = await Order.find().populate('user')
      .sort({_id:-1})
      .skip(skip)
      .limit(itemsPerPage);
    const totalOrders = await Order.countDocuments();
    const totalPages = Math.ceil(totalOrders / itemsPerPage);
    res.render('admin/orderlist-admin', { title:'Orders',orders, email: req.session.email, currentPage: parseInt(page), totalPages });


  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
}


const orderdetails = async (req, res) => {


  const orderId = req.query.orderId;
  const order = await Order.findById({ _id: orderId })  
    .populate("products.product")
    .populate("user")
  const address = order.address;
  res.render("admin/ordersdetails-admin", { title:'OrderDetails',order,address, email: req.session.email })

}



const updateOrderStatus = async (req, res) => {
  try {
    console.log("inside::::::::orderstatus");
    const { orderId, status } = req.body;

    // console.log('orderID::::'+orderId);
    // console.log("status "+ status);
    // console.log(status,orderId);
    if (!status || !orderId) {
      return res.status(400).json({ error: 'Invalid input parameters' });
    }
    const updatedOrder = await Order.findByIdAndUpdate(
      { _id: orderId },
      { $set: { orderStatus: status } },
      { new: true }
    );
    // console.log(updatedOrder);
    if (!updatedOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


const admindashboard = async (req, res) => {
  try {
    const orderCount = await Order.find({}).count();
    const productCount = await Product.find({}).count();
    const order = await Order.find({})
      .sort({ _id: -1 })
      .limit(10)
      .populate("user");
    const orders = await Order.find({}).populate("user");
    const products = await Product.find();
    const aggregationResult = await Order.aggregate([
      { $match: { orderStatus: "Delivered" } },
      { $group: { _id: null, totalPrice: { $sum: "$totalPrice" } } },
    ]);
    // monthly sale
    const monthlySales = await Order.aggregate([
      {
        $match: {
          orderStatus: "Delivered", // Filter by status
        },
      },
      {
        $group: {
          _id: {
            $month: "$createdAt",
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          _id: 1,
        },
      },
    ]);
    const monthlySalesArray = Array.from({ length: 12 }, (_, index) => {
      const monthData = monthlySales.find((item) => item._id === index + 1);
      return monthData ? monthData.count : 0;
    });
    // monthly sale end
    // yearly sale start
 
        const yearlySales = await Order.aggregate([
          {
            $match: {
              orderStatus: "Delivered", // Filter by status
            },
          },
          {
            $group: {
              _id: {
                $year: "$createdAt",
              },
              count: { $sum: 1 },
            },
          },
          {
            $sort: {
              _id: 1,
            },
          },
        ]);
        const currentYear = new Date().getFullYear();
        const yearlySalesArray = Array.from({ length:5}, (_, index) => {
          const yearData = yearlySales.find((item) => item._id === ( currentYear+ index));
          return yearData ? yearData.count : 0;
        });

    // yearly sale end
    const orderStatus = await Order.aggregate([
      {
        $match: {
          orderStatus: {
            $in: ['Delivered', 'Pending', 'Cancel Order', 'Out of delivery']
          }
        },
      },
      {
        $group: {
          _id: '$orderStatus', // Group by status instead of month
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          '_id': 1,
        },
      },
    ]);
    const orderStatusArray = Array.from({ length: 4 }, (_, index) => {
      const status = ['Delivered', 'Pending', 'Cancel Order', 'Out of delivery'][index];
      const statusData = orderStatus.find((item) => item._id === status);
      return statusData ? statusData.count : 0;
    });

    //  console.log(orderStatusArray);
    //-----------end order status

    //---------product graph---------------
    const productsPerMonth = Array(12).fill(0);
    products.forEach((product) => {
      const creationMonth = product.createdAt.getMonth();
      productsPerMonth[creationMonth]++;
    });
    const totalRevenue =
      aggregationResult.length > 0 ? aggregationResult[0].totalPrice : 0;
    console.log(totalRevenue);


    res.render("admin/admin-dashboard", {
      email: req.session.email,
      title: "Admin dashboard",
      errorMessage: "",
      orderCount,
      productCount,
      order,
      products,
      monthlySalesArray,
      productsPerMonth,
      totalRevenue,
      orders,
      orderStatusArray,
      yearlySalesArray

    })
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "An error occurred" });
  }
};



const loadCoupon = async (req, res) => {
  try {
    const ITEMS_PER_PAGE = 5;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * ITEMS_PER_PAGE;

    let filter = {};
    if (req.query.startDate && req.query.endDate) {
      const startDate = new Date(req.query.startDate);
      const endDate = new Date(req.query.endDate); 
   filter = {
     startDate: { $gte: startDate },
     endDate: { $lte: endDate},
   };
    }
    await Coupon.deleteMany({ endDate: { $lt: new Date() } });
    const totalProducts = await Coupon.countDocuments({});
    const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE);
    const allCoupons = await Coupon.find(filter).skip(skip).limit(ITEMS_PER_PAGE);       
    res.render("admin/coupons", { title: 'Coupons', email: req.session.email, coupon: allCoupons, totalPages, currentPage: page });
  } catch (error) {
    console.log(error);
  }
};



const addCoupon = async (req, res) => {
  try {
      const { startDate, endDate, discountValue, usedusersCount,description, couponCode, purchaseLimit } = req.body;

      const newCoupon = new Coupon({
          startDate,
          endDate,
          discountValue,
          usedusersCount,      
          description,
          couponCode,
          purchaseLimit
      });

      await newCoupon.save();

      res.redirect('/admin/coupons');
  } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error'); 
  }
};

const deleteCoupon = async(req,res)=>{
  try {
    const couponId = req.query.couponId;
    console.log(couponId);
    await Coupon.findByIdAndDelete(couponId);
    res.redirect('/admin/coupons')
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
}


const loadEditCoupon =async(req,res)=>{
  try {
    couponId= req.query.Id;
    console.log(couponId);
    const coupon = await Coupon.findById(couponId);
    res.render("admin/editcoupon",{title:'Coupon Edit',coupon,email:req.session.email});
  } catch (error) {
    console.log(error);
  }
}

const updateCoupon = async(req,res)=>{
  try {    
    couponId = req.query.Id;
    const { startDate, endDate, discountValue,description, couponCode, purchaseLimit } = req.body;
    const coupon = await Coupon.findById(couponId);
    coupon.startDate = startDate;
    coupon.endDate = endDate;
    coupon.discountValue = discountValue;
    coupon.couponCode = couponCode;
    coupon.purchaseLimit = purchaseLimit;
    coupon.description = description;
      
    await coupon.save();
    res.redirect("/admin/coupons");
  } catch (error) {
    console.log(error);
  }
  
}

const loadOffers = async(req,res)=>{
  try {
    const ITEMS_PER_PAGE = 4;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * ITEMS_PER_PAGE;
    const products = await Product.find({}).skip(skip).limit(ITEMS_PER_PAGE);        
    const totalProducts = await Product.countDocuments({});
    const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE);
    const categories = await Category.find()
    // const products = await Product.find({})  
    res.render("admin/offers",{title:'offers',products,email:req.session.email,currentPage:page,totalPages,categories});
  } catch (error) {
    console.log(error);
  }
}

const applyOffer = async (req, res) => {
  try {
      const productId = req.query;
      const { offerPercentage } = req.body;
      console.log(offerPercentage);
      const product = await Product.findOne(productId);
      // console.log(product);  
      product.offerPercentage = 0;
      product.offerPercentage = offerPercentage; 
      product.Price = product.SalePrice - (product.SalePrice * (product.offerPercentage / 100));
      await product.save();
      res.status(200).json({ success: true, message: 'Offer applied successfully.' });
  } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'An error occurred while applying the offer.' });
  }
};




const categoryOffer = async (req, res) => {
  try {
    const { categoryId, offerPercentage } = req.body;
    console.log(categoryId);
    console.log(offerPercentage);
    const category = await Category.findById(categoryId);
    console.log(category);
    if (category) {
      const products = await Product.find({ Category: categoryId });
      for (const product of products) {   
        product.offerPercentage = offerPercentage;
        product.Price = product.SalePrice - (product.SalePrice * (product.offerPercentage / 100));
        await product.save();
      }

      res.status(200).json({ success: true, message: 'Category offer applied successfully.' });
    } else {
      res.status(404).json({ success: false, message: 'Category not found.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'An error occurred while applying the category offer.' });
  }
};













module.exports = {
  adminLogin,
  adminLog,
  admindashboard,
  adminlogout,
  addcategory,
  loadcategory,
  isListedtoggle,
  loadAddProduct,
  productAdd,
  usermanage,
  deleteProduct,
  editProduct,
  useraction,
  loadEditCategory,
  updatecategory,
  orders,
  orderdetails, updateOrderStatus,
  loadCoupon,
  addCoupon,deleteCoupon,loadEditCoupon,updateCoupon,
  loadOffers,applyOffer,categoryOffer
}