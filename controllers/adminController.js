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
const sharp = require("sharp")
const { upload } = require('../helpers/multerFunc');
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
      res.render("admin/admin-login", { errorMessage });
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
      res.render("admin/admin-login")
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
    //fetch category data from the database
    const categories = await Category.find();
    res.render('admin/addcategory', { email: req.session.email, categories })
  } catch (error) {
    console.log(error);
    res.status(500).send("Error fetching category data");
  }
}

const addcategory = async (req, res) => {
  try {
    const { categoryName, categoryDescription, isListed } = req.body;
    const categories = await Category.find();
    const existingCategory = await Category.findOne({ categoryName });
    if (existingCategory) {
      // return res.status(400).send('Category name already exists.');
      return res.render('admin/addcategory', { errorMessage: 'Category name already exists.', categories });
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

// const loadAddProduct = async(req,res)=>{
//   try {
//     // const categories = await Category.find({})
//     const categories = await Category.find({ isListed: true });
//     const products = await Product.find({})
//     if(req.session.adminId){
//         res.render('admin/addproduct',
//         {email:req.session.email,
//           categories,
//           products
//         })
//     }else{
//         res.redirect("/admin")
//     }
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// }

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
    res.render('admin/productlist', { categories, products, email: req.session.email, currentPage: parseInt(page), totalPages });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

const productAdd = async (req, res) => {
  const categories = await Category.find({ isListed: true });
  const products = await Product.find({}).populate('Category')

  res.render("admin/addProducts", { categories, products, email: req.session.email })
}

// const addproduct = async (req, res) => {
//   try {
//     console.log(req.files);
//     const { Name, Category, Brand, Description, Price, Storage, RAM, OS, Color, Processor, Stock, SalePrice } = req.body;
//     console.log(req.body);
//     const files = req.files;
//     // Create an array of ProductImage objects
//     const ProductImage = files.map((file) => ({
//       filename: file.filename,
//       path: file.path
//     }));

//     const newProduct = new Product({
//       Name,
//       Category,
//       Brand,
//       Description,
//       Price,
//       Features: [{
//         Processor: Processor,
//         Ram: RAM,
//         Storage: Storage,
//         Os: OS,
//         Color: Color
//       }],
//       SalePrice,
//       Stock,
//       ProductImage: ProductImage, // Update the field name to match your model
//     });
//     await newProduct.save();
//     res.status(200).json({ message: 'Product added successfully' });
//     // res.redirect('/admin/addproduct');

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };

// const updateProduct = async (req, res) => {
//   try {
//       const productId = req.query.id;
//       const product = await Product.findById(productId);
//       if (!product) {
//         return res.status(404).json({ error: 'Product not found' });
//       }
//       const { Name, Category, Brand, Description, Price, Storage, Ram, Os, Color, Processor, Stock, SalePrice } = req.body;

//       // Update individual properties
//       product.Name = Name;
//       product.Category = Category;
//       product.Brand = Brand;
//       product.Description = Description;
//       product.Price = Price;
//       product.SalePrice = SalePrice;
//       product.Stock = Stock;

//       // Update Features field
//       product.Features = [{
//         Processor: Processor,
//         Ram: Ram,
//         Storage: Storage,
//         Os: Os,
//         Color: Color
//       }];
//       if (req.files && req.files.length > 0) {
//         const productImage = req.files.map(file => ({
//           filename: file.filename,
//           path: file.path
//         }));
//         product.ProductImage = productImage;
//       }

//       await product.save();
//       res.redirect(`/admin/addproduct`);
    
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };


const usermanage = async (req, res) => {
  const ITEMS_PER_PAGE = 4; // Adjust as needed
  try {

    const { page = 1, search = '' } = req.query;
    // Set the number of items per page and calculate skip value
    const itemsPerPage = 4;
    const skip = (page - 1) * itemsPerPage;
    // Construct a regex pattern for case-insensitive search
    const searchPattern = new RegExp(search, 'i');
    // Fetch users based on the search pattern
    const users = await User.find({
      $or: [
        { username: { $regex: searchPattern } },
        { email: { $regex: searchPattern } },
        { phone: { $regex: searchPattern } },
      ],
    })
      .skip(skip)
      .limit(itemsPerPage);
    // Count the total number of users for pagination
    const totalUsers = await User.countDocuments({
      $or: [
        { username: { $regex: searchPattern } },
        { email: { $regex: searchPattern } },
        { phone: { $regex: searchPattern } },
      ],
    });
    // Calculate total pages
    const totalPages = Math.ceil(totalUsers / itemsPerPage);
    res.render('admin/usermanagement', { email: req.session.email, users, currentPage: parseInt(page), totalPages, search });

  } catch (error) {
    console.log(error);
  }
};


const loadEditCategory = async (req, res) => {
  try {

    categoryID = req.query.id
    const category = await Category.findById(categoryID)
    res.render("admin/editcategory", { email: req.session.email, category })


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
    const { categoryName, categoryDescription, isListed } = req.body;
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

const deleteProduct = async (req, res) => {
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

      res.render("admin/edit-product", { products, categories, email: req.session.email })
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

    const { page = 1, itemsPerPage = 7 } = req.query;
    const skip = (page - 1) * itemsPerPage;

    const orders = await Order.find().populate('user')
      .skip(skip)
      .limit(itemsPerPage);

    const totalOrders = await Order.countDocuments();
    const totalPages = Math.ceil(totalOrders / itemsPerPage);

    res.render('admin/orderlist-admin', { orders, email: req.session.email, currentPage: parseInt(page), totalPages });


  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
}


const orderdetails = async (req, res) => {


  const orderId = req.query.orderId;
  const order = await Order.findById({ _id: orderId })
    .populate({ path: "address", model: Address })
    .populate("products.product")
    .populate("user")
  res.render("admin/ordersdetails-admin", { order, email: req.session.email })

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

    })
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "An error occurred" });
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
  // addproduct,
  // updateProduct,
}