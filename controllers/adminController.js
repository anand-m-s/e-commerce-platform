const session = require("express-session");
const mongoose = require('mongoose');
const Admin = require("../model/adminModel");
const Product = require("../model/productModel");
const User = require("../model/userModel");
const Order = require("../model/order");
const Address = require("../model/address");
const bcrypt = require("bcrypt");
const Category = require("../model/category");
const Path = require("path");
const sharp= require("sharp")
const { upload } = require('../helpers/multerFunc'); 
//Admin Login
const adminLogin = async (req, res) => {
    const { email, password} = req.body;
    try {
        const admin = await Admin.findOne({email});
        if (admin && admin.isAdmin===true ) {    
            const passwordMatch = await bcrypt.compare(password,admin.password);
            if (passwordMatch) {
                req.session.adminId =admin._id;
                req.session.email =admin.email;
                res.redirect("/admin/admindashboard");
            } else {
                const errorMessage = "Invalid password";
                res.render("admin/admin-login", { title: "Login", errorMessage });
            }
        } else {
            const errorMessage = "Admin not found";
            res.render("admin/admin-login",{errorMessage});
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
};

const adminLog = (req, res)=> {
  try {
    if(req.session.adminId){
      res.redirect("/admin/admindashboard")
    }else{
      res.render("admin/admin-login")
    }
    
  } catch (error) {
    console.log(error);
  }
  };

const admindashboard = (req, res) =>{
  try {
    if(req.session.adminId){
        res.render("admin/admin-dashboard",{email:req.session.email})
      }else{
        res.redirect("/admin")
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


const loadcategory = async(req,res)=>{
  try {
      if(req.session.adminId){
      //fetch category data from the database
      const categories = await Category.find();
      res.render('admin/addcategory',{email:req.session.email,categories})
    }else{
      res.redirect("/admin")
  }
    } catch (error) {
      console.log(error);
      res.status(500).send("Error fetching category data");
    } 
}

const addcategory = async(req,res)=>{
  try {
    const {categoryName,categoryDescription,isListed}= req.body;
    const categories = await Category.find();
    const existingCategory = await Category.findOne({categoryName});
    if (existingCategory) { 
      // return res.status(400).send('Category name already exists.');
      return res.render('admin/addcategory', { errorMessage: 'Category name already exists.',categories });
    }else{

      const newCategory = new Category({categoryName,categoryDescription,isListed});
      await newCategory.save();
      res.redirect("/admin/addcategory")
    }
  } catch (error) {
    console.log(error);
    res.status(500).send('Error adding the category.');
  }
}  

const isListedtoggle =async(req,res)=>{
  try {
      const categoryId = req.params.categoryId;
      console.log(req.params);
      const category = await Category.findById(categoryId);
      //toggle the isListed property
      category.isListed =!category.isListed;
      await category.save();
      res.redirect("/admin/addcategory")
      
  } catch (error) {
      console.log(error);
      res.status(500).send('Error toggling category status.');
  }
}

const loadAddProduct = async(req,res)=>{
  try {
    // const categories = await Category.find({})
    const categories = await Category.find({ isListed: true });
    const products = await Product.find({})
    if(req.session.adminId){
        res.render('admin/addproduct',
        {email:req.session.email,
          categories,
          products
        })
    }else{
        res.redirect("/admin")
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

const addproduct = async (req, res) => {
  try {
    upload.array('ProductImage', 5)(req, res, async (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Image upload failed' });
      }
      const { Name, Category, Brand, Description, Price,Storage,RAM,OS,Color,Processor,Stock,SalePrice} = req.body;
      // const files = req.files;
      const files = req.files;
      const imageData = []; // Access uploaded files

      // Create an array of ProductImage objects
      // const ProductImage = files.map((file) => ({
      //   filename: file.filename,
      //   path: file.path
      // }));
      for (const file of files) {
        console.log(file, "File received");
        const randomInteger = Math.floor(Math.random() * 20000001);
        const imageDirectory = Path.join('public','images','uploads');
        const imgFileName = "cropped" + randomInteger + ".jpg";
        const imagePath = Path.join(imageDirectory, imgFileName);
        console.log(imagePath, "Image path");
        const croppedImage = await sharp(file.path)
          .resize(280, 280, {
            fit: "cover",
          })
          .toFile(imagePath);          
        if (croppedImage) {
          imageData.push({filename:imgFileName,path:imagePath});
        }
      }
      const newProduct = new Product({
        Name,
        Category,
        Brand,
        Description,
        Price,
        Features:[{
          Processor:Processor,
          Ram:RAM,
          Storage:Storage,
          Os:OS,
          Color:Color
        }],
        SalePrice,
        Stock,
        ProductImage: imageData, // Update the field name to match your model
      });
      await newProduct.save();
      res.redirect('/admin/addproduct');
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateProduct = async (req, res) => {
  try {
    upload.array('ProductImage', 5)(req, res, async (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Image upload failed' });
      }
      const productId = req.query.id;
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
      const { Name, Category, Brand, Description, Price } = req.body;
      product.Name = Name;
      product.Category = Category;
      product.Brand = Brand;
      product.Description = Description;
      product.Price = Price;
      if (req.files && req.files.length > 0) {
        const productImage = req.files.map(file => ({
          filename: file.filename,
          path: file.path
        }));
        product.ProductImage = productImage;
      }
      await product.save();
      res.redirect(`/admin/addproduct`);
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const usermanage = async (req, res) => {
  const ITEMS_PER_PAGE = 4; // Adjust as needed
  try {
    if (req.session.adminId) {
      const page = req.query.page || 1;

      const users = await User.find({})
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
      const totalUsers = await User.countDocuments({});
      const totalPages = Math.ceil(totalUsers / ITEMS_PER_PAGE);

      res.render('admin/usermanagement', 
      {email: req.session.email,
        users,
        currentPage: page,
        totalPages,
      });
    } else {
      res.redirect('/admin');
    }
  } catch (error) {
    console.log(error);
  }
};


const loadEditCategory = async(req,res)=>{
  try {
    if(req.session.adminId){
      categoryID =req.query.id
      const category = await Category.findById(categoryID)
      res.render("admin/editcategory",{email:req.session.email,category})
    }else[
      res.redirect("/admin")
    ]
    
  } catch (error) {
    console.log(error);
  }
}
// Update a category
const updatecategory = async (req, res) => {
  try {
    const categoryID = req.query.id
    const category = await Category.findById(categoryID);
    
    if (!category) {
      return res.status(404).send("Category not found");
    }
    const {  categoryName, categoryDescription, isListed } = req.body;
    // Update the category fields
    category.categoryName = categoryName;
    category.categoryDescription = categoryDescription;
    category.isListed = isListed === 'on'; // Check the checkbox value
    await category.save();
    res.redirect("/admin/addcategory"); // Redirect to a category list page or another suitable location
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred");
  }
};

const deleteProduct = async (req,res)=>{
  try {
    const productId = req.query.productId;
    console.log(productId);
    if (!productId) {
      // Handle the case where productId is missing in the query
      return res.status(400).json({ error: 'Product ID is missing in the query parameters' });
    }
    await Product.findByIdAndRemove(productId);
    res.redirect("/admin/addproduct")
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const editProduct = async(req,res)=>{
  try {
    const categories = await Category.find({})
    const productId = req.params.productId;
    if(!productId){
      return res.status(400).json({error: "Product ID is missing in the query parameteres"});
    }
    const products = await Product.findById(productId);
    if(req.session.adminId){

      res.render("admin/edit-product",{products,categories,email:req.session.email})   
    }else{
      res.redirect("/admin");
    }
  } catch (error) {
    console.log(error);
    
  }
}

const useraction =async (req,res)=>{
  const userID = req.query.id;
  const action = req.query.action;
  try {
      const user = await User.findById(userID);
      if(!user){
          return res.status(400).send("user not found");
      }
      if (action === "block") {
        user.Isblocked = true;
      } else if (action === "unblock") {
        user.Isblocked = false;
      }      
        await user.save()
        res.redirect("/admin/usermanagement")
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred");
  }
}

const orders = async(req,res)=>{
  try {
    const orders= await Order.find().populate('user');
    res.render("admin/orderlist-admin",{orders,email:req.session.email});
  } catch (error) {
    
  }
}


const orderdetails = async(req,res)=>{
  const orderId = req.query.orderId;
  const order = await Order.findById({_id:orderId})
  .populate({path:"address",model:Address})
    .populate("products.product")
    .populate("user")
  res.render("admin/ordersdetails-admin",{order,email:req.session.email})
}



const updateOrderStatus = async (req, res) => {
  try {
    console.log("inside::::::::orderstatus");
      const {orderId,status } = req.body;
  
      console.log('orderID::::'+orderId);
      console.log("status "+ status);
      // console.log(status,orderId);
      if (!status || !orderId) {
          return res.status(400).json({ error: 'Invalid input parameters' });
      }
      const updatedOrder = await Order.findByIdAndUpdate(
        { _id: orderId},
        { $set: { orderStatus: status } },
        { new: true }
    );
      console.log(updatedOrder);
      if (!updatedOrder) {
          return res.status(404).json({ error: 'Order not found' });
      }
      res.json({ success: true });
  } catch (error) {
      console.error('Error updating order status:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
};



module.exports={
    adminLogin,
    adminLog,
    admindashboard,
    adminlogout,
    addcategory,
    loadcategory,
    isListedtoggle,
    loadAddProduct,
    addproduct,
    usermanage,
    deleteProduct,
    editProduct, 
    useraction,
    updateProduct,
    loadEditCategory,
    updatecategory,
    orders,
    orderdetails,updateOrderStatus
}