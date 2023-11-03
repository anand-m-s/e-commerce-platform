const session = require("express-session");
const Admin = require("../model/adminModel");
const bcrypt = require("bcrypt");
const Category = require("../model/category");
const Product = require("../model/productModel");
const multerFunc = require("../helpers/multerFunc")
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
    if(req.session.adminId){
      res.redirect("/admin/admindashboard")
    }else{
      res.render("admin/admin-login")
    }
  };

const admindashboard = (req, res) =>{
    if(req.session.adminId){
      res.render("admin/admin-dashboard",{email:req.session.email})
    }else{
      res.redirect("/admin")
    }
  };

const adminlogout = (req,res)=>{
    req.session.destroy((err) => {
      if (err) {
          console.error(err);
      }
      res.redirect('/admin');
  });
  }

const loadcategory = async(req,res)=>{
  if(req.session.adminId){
    try {
      //fetch category data from the database
      const categories = await Category.find();
      res.render('admin/addcategory',{email:req.session.email,categories})
    } catch (error) {
      console.log(error);
      res.status(500).send("Error fetching category data");
    }

  }else{
      res.redirect("/admin")
  }
}

const addcategory = async(req,res)=>{
  try {
    const {categoryName,categoryDescription,isListed}= req.body;
    const existingCategory = await Category.findOne({categoryName});
    if (existingCategory) {
      return res.status(400).send('Category name already exists.');
    }
    const newCategory = new Category({categoryName,categoryDescription,isListed});
    await newCategory.save();
    res.redirect("/admin/addcategory")
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
    const categories = await Category.find({})
    if(req.session.adminId){
        res.render('admin/addproduct',{email:req.session.email,categories})
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
    multerFunc.Multer.single('ProductImage')(req, res, async (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Image upload failed' });
      }
      const { Name, Category, Brand, Description, Price } = req.body;
      // const existingCategory = await Category.findById(Category);
      // const existingCategory = await Category.findOne({ categoryName: Category });
      // if (!existingCategory) {
      //   return res.status(400).json({ error: 'Selected category does not exist.' });
      // }
      // Get the uploaded image details
      const { filename, path } = req.file;
      // Create and save the product with the image information
      const newProduct = new Product({
        Name,
        Category,
        Brand,
        Description,
        Price,
        ProductImage: {
          filename,
          path,
        },
      });
       await newProduct.save();
      res.redirect('/admin/addproduct');
    });
  } catch (error) {
    console.error(error);
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
    addproduct
}