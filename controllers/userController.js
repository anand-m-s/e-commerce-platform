const session = require("express-session");
const mongoose = require('mongoose')
const User = require("../model/userModel");
const Product = require("../model/productModel");
const Category = require("../model/category");
const Address = require("../model/address");
const Cart = require("../model/cart");
const Order = require("../model/order");
const WishList = require('../model/wishlist')
const Wallet = require("../model/wallet");
const Coupon = require("../model/coupon")
const bcrypt = require("bcrypt");
const calc = require("../helpers/Calculate");
const {setGlobalMessage,getAndClearGlobalMessages} =require('../helpers/globalFunc');
const { log } = require("debug/src/node");




//register
const register = async (req, res) => {
    try {
        const { Username, Email, Password, phone } = req.body.userData;
        const existingUser = await User.findOne({ $or: [{ email: Email }, { username: Username },{phone:phone}] });
        if (existingUser) {
            // Sending a 409 Conflict status code for user conflict
            return res.status(409).send("User already exists"); 
            // res.redirect(`/signup?error=${encodeURIComponent(errorMessage)}`);            
        } else {
            // Hash the password
            const hashedPassword = await bcrypt.hash(Password, 10);
            const newUser = new User({ username: Username, email: Email, password: hashedPassword, phone })
            const userresult = await newUser.save();
            console.log(userresult);
            res.redirect("/login");
        }
    }
    catch (err) {
        console.log(err);
        res.redirect("/signup")
    }
}

// Login
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (user) {
            const passwordMatch = await bcrypt.compare(password, user.password);
            if (passwordMatch) {
                if(user.Isblocked!==true){
                    req.session.userId = user._id;
                    req.session.username = user.username;
                    res.redirect("/home");
                }else{
                    const errorMessage = "Blocked"
                    res.render("login-user",{title:"login",errorMessage})                                                           
                }
            } else {
                const errorMessage = "Invalid password";
                res.render("login-user", { title: "Login", errorMessage });
            }
        } else {
            const errorMessage = "User not found";
            res.render("login-user", { title: "Login", errorMessage });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
}

const Loadhome = async (req, res) => {
    try {       
        // console.log("inside home load :::::::::");
        console.log("query here::::::::::::::::::",req.query);
        const {ram,storage,minPrice,maxPrice,categoryName}=req.query;  
        let matchCondition = {};
        let categoryId = await Category.findOne({categoryName:categoryName});
        if(categoryId){
            let id =categoryId._id;
            // console.log(id);
            matchCondition.Category = id;
        }
        if (ram) {
          matchCondition['Features.Ram'] = ram;
        }    
        if (storage) {
          matchCondition['Features.Storage'] = storage;
        }    
        if (minPrice || maxPrice) {
          matchCondition.Price = {};
          if (minPrice) {
            matchCondition.Price.$gte = parseFloat(minPrice);
          }
          if (maxPrice) {
            matchCondition.Price.$lte = parseFloat(maxPrice);
          }
        }    
        let filteredProducts = await Product.aggregate([
          { $match: matchCondition },
        ]);                  
        const categories = await Category.find({isListed:true});
        const products = filteredProducts.filter(product => product.Category !== null);
           
        let msg ;
        if(products.length<1){
            msg="No products found!"
        }
         const user = await User.findById(req.session.userId);
     const wishlist = await WishList.findOne({ user: req.session.userId });
     const wishlistProductIds = wishlist ? wishlist.product.map(String) : [];        
            if(user && user.Isblocked){
                req.session.userId=null;
                res.render("login-user", { title: "Login", errorMessage:"Your account is blocked" });
            }else{
             
                res.render("home", { title:"Home",username: req.session.username, products,categories,wishlistProductIds,msg})
            }     
    } catch (error) {
        console.log(error);
    }
}

// const filterByCat = async (req, res) => {
//     try {
//       const categoryId = req.query.categoryId;
//       let query = {};  
//       if (categoryId !== 'all') {
//         query = { Category: categoryId};
//       } 
//     //   const products = await Product.find(query).populate('Category')
//       const products = await Product.find(query).populate({
//         path: 'Category',
//         match: { isListed: true } 
//     });
//     const wishlist = await WishList.findOne({ user: req.session.userId });
//     const wishlistProductIds = wishlist ? wishlist.product.map(String) : [];    
//     //   console.log(products);    
//       res.json({ products,wishlistProductIds });
//     } catch (error) {
//       console.error('Error fetching products by category:', error);
//       res.status(500).json({ error: 'Internal server error' });
//     }
//   };
  
  

  

const signupVerify = async(req,res) =>{
    const {phone,Email}= req.body;
    const existingUser = await User.findOne({ $or: [{ email: Email },{phone:phone}] });
        if (existingUser) {
            // Sending a 409 Conflict status code for user conflict
            return res.status(209).json({status:true});
        }else if(!existingUser){
            return res.status(200).json({status:true});
        }

}




const indexlogin = async (req, res) => {
    try {             
        if (req.session.userId) {
            res.redirect("home")
        }
        else {
            const filteredproducts = await Product.find({}).populate({
                path: 'Category',
                match: { isListed: true } 
            });
            // Filter out products where Category is null (not populated)
            const products = filteredproducts.filter(product => product.Category !== null);
        //    console.log(products);
            res.render("index", { title: "index", products })
        }
    } catch (error) {
        console.log(error);
    }
};

const signuplogin = (req, res) => {
    try {
        if (req.session.userId) {
            res.redirect("/home")
        } else {
            res.render("signup-user", { title: "signup" })
        }
    } catch (error) {
        console.log(error);
    }
}


const userLogin = (req, res) => {
    try {
        
        if (req.session.userId) {
            res.redirect("/home")
        } else {
            const msg='';
            res.render("login-user",{title:"Login",msg})
        }
    } catch (error) {
        console.log(error);
    }
}

const logout = (req, res) => {
    try {
        req.session.userId = null;
        res.redirect('/login');
    } catch (err) {
        console.error(err);
    }
};

const about = (req,res)=>{
    try {
        res.render("about",{title:"About",username:req.session.username})
    } catch (error) {
        console.log(error);
        
    }
}
const contact = (req,res)=>{
    try {
        res.render("contact",{title:'Contact',username:req.session.username})
    } catch (error) {
        console.log(error);
        
    }
}

//reset password
const loadForgotPassword =(req,res)=>{
    try {
        res.render("forgotpassword",{title:'Forgotpassword'})
        
    } catch (error) {
        console.log(error);
    }
}

const forgotReset =  async (req, res) => {
    try {
        console.log('Request received at /passwordreset');
      const { email } = req.body;
      // Find the user by email
      const user = await User.findOne({ email });        
      if (!user) {
        
        return res.status(202).json({ error: 'User not found' });
      }  
     
      const phoneNumber = user.phone;  
      
      
      res.status(200).json({ phoneNumber });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

const resetpassword = async (req, res) => {
    console.log("inside reset password");
    const { email, newPassword } = req.body;    
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();
        console.log("Password reset successful");
        const msg ='Password reset successful';
        res.render("login-user",{title:'Login',msg});
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


const displayProduct = async(req,res)=>{
    try {   
        const productId = req.query.productId;
        const products = await Product.findById(productId);
        if(!products){
            res.status(404).json({ error: "Product not found" });
        }
        if(req.session.userId){
            const user = await User.findById(req.session.userId);
            if(user && user.Isblocked){
                const errorMessage = "Your account is blocked";
                req.session.userId =null;
                res.render("login-user",{title:"login",errorMessage});
            }
            res.render("productdetails",{title:'Product',products,username:req.session.username});
        }else{
            res.render("productdetails",{title:'Product',products})
        }
    } catch (error) {
        console.log(error);
        res.status(500).send("An error occurred");
    }
}

const loadUserProfile = async(req,res)=>{
    try {               
            const users = await User.findById(req.session.userId).populate('address');
            const address = users.address;  
            res.render("user-profile",{title:"UserProfile",username:req.session.username,users,address});      
    } catch (error) {
        console.log(error);
        res.status(500).send("An error occurred");
    }
}

const addaddress =async(req,res)=>{
    try {
        const{fullName,addressline,city,state,landmark,pincode,country,phone,altphone}=req.body;
        const newaddress = new Address({
            fullName,
            addressline,
            city,
            state,
            landmark,
            pincode,
            country,
            phone,
            altphone
        });
         const savedAddress = await newaddress.save();

        const users = await User.findById(req.session.userId); 
        users.address.push(savedAddress._id); 
        await users.save();     
        res.redirect("/userprofile")
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal server error' });
    }

}
const addressCheckout =async(req,res)=>{
    try {
        const{fullName,addressline,city,state,landmark,pincode,country,phone,altphone}=req.body;
        const newaddress = new Address({
            fullName,
            addressline,
            city,
            state,
            landmark,
            pincode,
            country,
            phone,
            altphone
        });
         const savedAddress = await newaddress.save();

        const users = await User.findById(req.session.userId); 
        users.address.push(savedAddress._id); 
        await users.save();     
        res.redirect("/checkout")
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal server error' });
    }

}
// loading edituseraddress page
const editUserAddress = async (req, res) => {
    try {
        const addressId = req.query.id; 
        const users = await User.findById(req.session.userId);
        const address = await Address.findById(addressId);
        if (!users || !address) {
            return res.status(404).send("Address not found");
        }
        res.render("editUserAddress", { title:'Address',users, address });
    } catch (error) {
        console.error(error);
        res.status(500).send("An error occurred");
    }
};
// updating user address
const updateAddress = async(req,res)=>{
    try {
        const addressId = req.body.addressId; // Use req.body to get the addressId from the hidden input field
        const address = await Address.findById(addressId);
        if (!address) {
            return res.status(404).send("Address not found");
        }
        const{fullName,addressline,city,state,landmark,pincode,country,phone,altphone}=req.body;
        address.fullName=fullName;
        address.addressline=addressline;
        address.city=city;
        address.state=state;
        address.landmark=landmark;
        address.pincode=pincode;
        address.country=country;
        address.phone=phone;
        address.altPhone=altphone;
        
        await address.save();
        res.redirect("/userprofile")        
    } catch (error) {
        console.error(error);
        res.status(500).send("An error occurred");
        
    }
}

const deleteAddress = async (req, res) => {
    try {
        const addressId = req.query.id;        
        const result = await Address.findByIdAndDelete(addressId);
    
        if (!result) {
          return res.status(404).json({ error: "Address not found" });
        }
    
        res.json({ message: "Address deleted successfully" });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: "An error occurred" });
      }
    };

const userProfileEdit = async(req,res)=>{
    try {
        
        const userID = req.session.userId;
        const users = await User.findById(userID);
        res.render("userdetails",{title:'userprofile',users}); 
    } catch (error) {
        console.log(error);
    }
    
}

const updateUser = async(req,res)=>{
    try {
        const user = req.session.userId;
        const users = await User.findById(user);
        const{username,email}=req.body;
        users.username=username;
        users.email=email;
        users.save();
        res.redirect("/userprofile");
    } catch (error) {
        console.log(error);
    }
}

const addProductsToCart = async(req,res)=>{
    try {        
        const productId = req.query.productId;
        const userId = req.session.userId
        // const user = await User.findById(req.session.userId);
  
     
        let userCart = await Cart.findOne({user:userId});
        if (!userCart) {
            // If the cart doesn't exist, create a new one
            userCart = new Cart({ user: userId, products: [] });
          }
        const existingProduct =userCart.products.find(
            (cartProduct)=> cartProduct.product.toString()===productId
        );
        if(existingProduct){
            // existingProduct.quantity+=1;
            return res.status(208).json({sucess:true});
        }else{

            userCart.products.push({ product: productId, quantity: 1 });
        }
        await userCart.save();    
        return res.status(200).json({sucess:true,message:"Product added to the cart"})    
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'An error occurred while adding to the cart' });
    }
}

  const loadCheckOutPage = async(req,res)=>{
    try {
       
            const userId = req.session.userId
            const user = await User.findById(userId)
              .populate('address');
            const cart = await Cart.findOne({ user: userId }).populate({
                path: 'products.product',
                populate: {
                  path: 'Category',
                  model: 'Category'
                }
              });         
              const allCoupons= await Coupon.find({})   
              const currentDate = new Date();
              const coupons = allCoupons.filter(coupon => coupon.endDate >= currentDate);              
              const address = user.address                         
            const totalAmount = cart.products.reduce(
                (acc, item) => acc + item.product.Price * item.quantity,
                0
              );     
              if(totalAmount===0){
                return res.redirect("/addtocart")
              }                   
            res.render("checkOutPage",{title:'Checkout',user,address,cart,totalAmount,username:req.session.username,coupons});
      
        
    } catch (error) {
        console.log(error);        
    }
}




const loadOrderList = async (req, res) => {
    try {
        const userId = req.session.userId;

        // Pagination logic
        const page = parseInt(req.query.page) || 1; // default to page 1 if not specified
        const perPage = 10; // adjust as needed
        const totalOrders = await Order.countDocuments({ user: userId });
        const totalPages = Math.ceil(totalOrders / perPage);
        const skip = (page - 1) * perPage;

        const orders = await Order.find({ user: userId })
            .sort({ _id: -1 })
            .skip(skip)
            .limit(perPage);

        res.render("orderlist", {
            title:'Orderlist',
            orders,
            username: req.session.username,
            currentPage: page,
            totalPages: totalPages,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const OrderDetails= async(req,res)=>{
    try {
        
        const orderId = req.query.orderId;
        const order = await Order.findById({_id:orderId}).populate({path:"products.product"});
        const address = order.address             
        res.render("orderdetails",{title:"orderDetails",order,address,username:req.session.username});
    } catch (error) {
    console.log(error);        
    }

   
}

const searchResults = async(req,res)=>{
    try {
        const search = req.query.query;    
        const products = await Product.find({ Name: { $regex: new RegExp(search, 'i') } });    
        const resultFound = products.length>0;    
        const wishlist = await WishList.findOne({ user: req.session.userId });
        const wishlistProductIds = wishlist ? wishlist.product.map(String) : [];        
        res.render("search",{title:'Search',username:req.session.username,products,resultFound,wishlistProductIds})
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error");    
    }
}

const categoryFilter = async (req, res) => {
    try {
        const categoryId = req.query.id;              
        const filteredProducts = await Product.find({ Category: categoryId });
        res.json(filteredProducts);
    } catch (error) {
        console.log(error);
    }
  };

const loadWallet = async(req,res)=>{
    try {
        const userId = req.session.userId;
        const userWallet = await Wallet.findOne({ user: userId });
        if (!userWallet) {            
            const newWallet = new Wallet({
                user: userId,
                balance: 0
            });
            await newWallet.save();       
        }
        res.render("wallet",{title:'Wallet',username:req.session.username,userWallet})
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
    }
}

const applyCoupon= async (req, res) => {
    try {
      const { selectedCouponCode } = req.body;
    //   console.log(selectedCouponCode);
      const coupon = await Coupon.findOne({ couponCode: selectedCouponCode });  
    //   console.log(coupon);
      if (!coupon) {
        return res.status(404).json({ error: 'Coupon not found' });
      }
      const currentDate = new Date();
      if (currentDate < coupon.startDate || currentDate > coupon.endDate) {
        return res.status(400).json({ error: 'Coupon is not valid at this time' });
      }
      
      
            const userId = req.session.userId; 
      const cart = await Cart.findOne({ user: userId }).populate({
        path: 'products.product',
        populate: {
          path: 'Category',
          model: 'Category'
        }
      });      

      if (coupon.usedBy.includes(userId)) {
        return res.status(201).json({ error: 'Coupon has already been used by this user' });
      }
      const total = cart.products.reduce(
        (acc, item) => acc + item.product.Price * item.quantity,
        0
      );    
       
        if (coupon.purchaseLimit && total <= coupon.purchaseLimit) {
            return res.status(202).json({ error: `Minimum spend must be above ${coupon.purchaseLimit}`});
        }  
      const discountAmount = (coupon.discountValue / 100) * total;
      const totalAmount = total - discountAmount;
      
    //   coupon.usedBy.push(userId);
    //   coupon.usedUsersCount++; 
    //   coupon.usersLimit--;
    //   await coupon.save();
  
      
      res.json({ totalAmount, message: 'Coupon applied successfully' });
    } catch (error) {
      console.error('Error applying coupon:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  const loadWishList = async (req, res) => {
    try {
      const userId = req.session.userId;
      
      const wishListItems = await WishList.find({ user: userId }).populate('product');
      res.render('wishlist', { title:'Wishlist',wishListItems,username:req.session.username});
    } catch (error) {
      console.log(error);
      
      res.status(500).send('Internal Server Error');
    }
  };

  const addToWishList = async (req, res) => {
    try {
      const { productId } = req.body;
      const userId = req.session.userId;
  
    
      const existingWishList = await WishList.findOne({ user: userId });
  
      if (existingWishList && existingWishList.product.includes(productId)) {
        
        existingWishList.product = existingWishList.product.filter(id => id.toString() !== productId);
        await existingWishList.save();
  
        return res.status(201).json({ success: true, message: 'Product removed from the wishlist' });
      }
  
      
      let userWishList = await WishList.findOne({ user: userId });
  
      if (!userWishList) {
       
        userWishList = new WishList({
          user: userId,
          product: [productId],
        });
      } else {
        
        userWishList.product.push(productId);
      }
      await userWishList.save();
      res.status(200).json({ success: true, message: 'Product added to the wishlist successfully' });
    } catch (error) {
      console.error('Error adding/removing product to/from wishlist:', error);
      res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  };

const removeFromWishlist =async (req, res) => {
    try {
      const { productId } = req.body;
      const userId = req.session.userId;
  

      const userWishList = await WishList.findOne({ user: userId });
  
      if (!userWishList) {
        return res.status(404).json({ success: false, message: 'Wishlist not found' });
      }
  

      userWishList.product = userWishList.product.filter(id => id.toString() !== productId);

      await userWishList.save();
  
      res.status(200).json({ success: true, message: 'Product removed from the wishlist successfully' });
    } catch (error) {
      console.error('Error removing product from wishlist:', error);
      res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  }
  
  
  

  




module.exports = {
    register,
    login,
    Loadhome,
    indexlogin,
    signuplogin,
    userLogin,
    logout,
    loadForgotPassword,
    displayProduct,
    about,
    contact,
    loadUserProfile,
    addaddress,
    editUserAddress,
    updateAddress,
    deleteAddress,
    userProfileEdit,
    updateUser,
    addProductsToCart,
    loadCheckOutPage,
    signupVerify,
    loadOrderList,
    OrderDetails,
    forgotReset,
    resetpassword,
    addressCheckout,
    searchResults,
    categoryFilter,
    loadWallet,applyCoupon,
    addToWishList,loadWishList,removeFromWishlist
}