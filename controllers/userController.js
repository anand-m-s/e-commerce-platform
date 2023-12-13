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

const homelogin = async (req, res) => {
    try {
        // const products = await Product.find({})
        const filteredproducts = await Product.find({}).populate({
            path: 'Category',
            match: { isListed: true } // Filters the populated Category
        });
        const categories = await Category.find({isListed:true});
   


        const products = filteredproducts.filter(product => product.Category !== null);
     
         const user = await User.findById(req.session.userId);
    // const wishListItems =  await WishList.find({ user: req.session.userId }).populate('product');
    // const wishlistProductIds = wishListItems.map(item => item.product._id);
     // Get the wishlist products for the current user
     const wishlist = await WishList.findOne({ user: req.session.userId });

     // Extract product IDs from the wishlist (assuming the product field in the wishlist contains product IDs)
     const wishlistProductIds = wishlist ? wishlist.product.map(String) : [];
   
     
            if(user && user.Isblocked){
                req.session.userId=null;
                res.render("login-user", { title: "Login", errorMessage:"Your account is blocked" });
            }else{
             
                res.render("home", { username: req.session.username, products,categories,wishlistProductIds})
            }     
    } catch (error) {
        console.log(error);
    }
}


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
                match: { isListed: true } // Filters the populated Category
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
            res.render("login-user",{msg})
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
        res.render("about")
    } catch (error) {
        console.log(error);
        
    }
}
const contact = (req,res)=>{
    try {
        res.render("contact")
    } catch (error) {
        console.log(error);
        
    }
}

//reset password
const loadForgotPassword =(req,res)=>{
    try {
        res.render("forgotpassword")
        
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
      // Extract the phone number from the user object
      const phoneNumber = user.phone;  
      // You can also perform additional checks or validations here  
      // Send the phone number as a response
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
        res.render("login-user",{msg});
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
            res.render("productdetails",{products,username:req.session.username});
        }else{
            res.render("productdetails",{products})
        }
    } catch (error) {
        console.log(error);
        res.status(500).send("An error occurred");
    }
}

const loadUserProfile = async(req,res)=>{
    try {               
            const users = await User.findById(req.session.userId).populate('address');
            const address = users.address;  // Assuming you want the latest added address            
            res.render("user-profile",{username:req.session.username,users,address});      
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

        const users = await User.findById(req.session.userId); // Assuming you have the user ID in req.userId
        users.address.push(savedAddress._id); // Add the new address's ID to the user's address array
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

        const users = await User.findById(req.session.userId); // Assuming you have the user ID in req.userId
        users.address.push(savedAddress._id); // Add the new address's ID to the user's address array
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
        res.render("editUserAddress", { users, address });
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
        res.render("userdetails",{users}); 
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
              const coupons= await Coupon.find({})                 
              const address = user.address                         
            const totalAmount = cart.products.reduce(
                (acc, item) => acc + item.product.Price * item.quantity,
                0
              );     
              if(totalAmount===0){
                return res.redirect("/addtocart")
              }                   
            res.render("checkOutPage",{user,address,cart,totalAmount,username:req.session.username,coupons});
      
        
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
   
        const orderId = req.query.orderId;
        const order = await Order.findById({_id:orderId}).populate({path:"products.product"});
        const address = await Address.findById({_id:order.address});              
        res.render("orderdetails",{order,address,username:req.session.username});
 
}

const searchResults = async(req,res)=>{
    try {
        const search = req.query.query;    
        const products = await Product.find({ Name: { $regex: new RegExp(search, 'i') } });    
        const resultFound = products.length>0;    
        const wishlist = await WishList.findOne({ user: req.session.userId });

        // Extract product IDs from the wishlist (assuming the product field in the wishlist contains product IDs)
        const wishlistProductIds = wishlist ? wishlist.product.map(String) : [];        
        res.render("search",{username:req.session.username,products,resultFound,wishlistProductIds})
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
            // Create a new wallet for the user with an initial balance of 0
            const newWallet = new Wallet({
                user: userId,
                balance: 0
            });
            await newWallet.save();       
        }
        res.render("wallet",{username:req.session.username,userWallet})
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
       // Check if the total is greater than the purchaseLimit
        if (coupon.purchaseLimit && total <= coupon.purchaseLimit) {
            return res.status(202).json({ error: `Minimum spend must be above ${coupon.purchaseLimit}`});
        }  
      const discountAmount = (coupon.discountValue / 100) * total;
      const totalAmount = total - discountAmount;
      // Update the user and coupon records to reflect the usage 
    //   coupon.usedBy.push(userId);
    //   coupon.usedUsersCount++; 
    //   coupon.usersLimit--;
    //   await coupon.save();
  
      // Return the updated total amount and any other relevant information
      res.json({ totalAmount, message: 'Coupon applied successfully' });
    } catch (error) {
      console.error('Error applying coupon:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  const loadWishList = async (req, res) => {
    try {
      const userId = req.session.userId;
      // Fetch wishlist items for the current user
      const wishListItems = await WishList.find({ user: userId }).populate('product');
      res.render('wishlist', { wishListItems,username:req.session.username});
    } catch (error) {
      console.log(error);
      // Handle errors appropriately
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
    homelogin,
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