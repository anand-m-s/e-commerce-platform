const session = require("express-session");
const Admin = require("../model/adminModel");
const Product = require("../model/productModel");
const User = require("../model/userModel");
const bcrypt = require("bcrypt");
const Category = require("../model/category");
const multerFunc = require("../helpers/multerFunc");
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

// const adminlogout = (req,res)=>{
//     req.session.destroy((err) => {
//       if (err) {
//           console.error(err);
//       }
//       res.redirect('/admin');
//   });
//   }

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
    multerFunc.Multer.single('ProductImage')(req, res, async (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Image upload failed' });
      }
      const { Name, Category, Brand, Description, Price } = req.body;
    
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
      console.log(newProduct.ProductImage.path);
       await newProduct.save();
      res.redirect('/admin/addproduct');
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const usermanage = async(req,res)=>{
  try {
    if(req.session.adminId){
      
      const users = await User.find({})

      res.render("admin/usermanagement",{email:req.session.email,users});
    }else{
      res.redirect("/admin");
    }
  } catch (error) {
    console.log(error);
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
    const productId = req.params.productId;
    console.log(productId);
    if(!productId){
      return res.status(400).json({error: "Product ID is missing in the query parameteres"});
    }
    const products = await Product.findById(productId);
    const categories = await Category.find({})
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

const updateProduct = async(req,res)=>{
  try {
    multerFunc.Multer.single('ProductImage')(req, res, async (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Image upload failed' });
      }
    const productId =req.query.id;
    const product = await Product.findById(productId);

    if(!product){
      return res.status(404).json({ error: 'Product not found' });
    }
    const { Name, Category, Brand, Description, Price } = req.body;
    product.Name = Name;
    product.Category = Category;
    product.Brand = Brand;
    product.Description = Description;
    product.Price = Price;
       // Check if a new product image was uploaded
       if (req.file) {
        const { filename, path } = req.file;
        product.ProductImage.filename = filename;
        product.ProductImage.path = path;
      }
      // Save the updated product
      await product.save();
      // Redirect to a page or route after the update (e.g., the product details page)
      res.redirect(`/admin/addproduct`);
     });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
    
  }
}

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
    updatecategory
}