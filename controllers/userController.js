const session = require("express-session");
const mongoose = require('mongoose')
const User = require("../model/userModel");
const bcrypt = require("bcrypt");
const Product = require("../model/productModel");
const Category = require("../model/category");
const Address = require("../model/address");
const Cart = require("../model/cart");
const Order = require("../model/order");
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
   

        // Filter out products where Category is null (not populated)
        const products = filteredproducts.filter(product => product.Category !== null);
       
            const user = await User.findById(req.session.userId);
            if(user && user.Isblocked){
                req.session.userId=null;
                res.render("login-user", { title: "Login", errorMessage:"Your account is blocked" });
            }else{
                // const messages = getAndClearGlobalMessages(req);
                res.render("home", { username: req.session.username, products,categories})
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
              const address = user.address                         
            const totalAmount = cart.products.reduce(
                (acc, item) => acc + item.product.Price * item.quantity,
                0
              );     
              if(totalAmount===0){
                return res.redirect("/addtocart")
              }                   
            res.render("checkOutPage",{user,address,cart,totalAmount,username:req.session.username});
      
        
    } catch (error) {
        
    }
}



  
// const checkOut = async (req, res) => {
//     try {
//       const userId = req.session.userId;
//       const { billingAddress, paymentMethod } = req.body;
//       console.log(paymentMethod);
//       const user = await User.findById(userId);
//       if (!user) {
//         return res.status(404).json({ error: 'User not found' });
//       }
//       const selectedAddress = user.address[billingAddress];  
//       if (!selectedAddress) {
//         return res.status(400).json({ error: 'Billing address not selected' });
//       }
//       const cart = await Cart.findOne({ user: userId }).populate({
//         path: 'products.product',
//       });
//       if (!cart) {
//         return res.status(404).json({ error: 'Cart not found' });
//       }
//       const totalAmount = cart.products.reduce(
//         (acc, item) => acc + item.product.Price * item.quantity,
//         0
//       );
//         if(paymentMethod==='cod'){
//             console.log("inside cod");
//             const newOrder = new Order({
//               user: userId,
//               address: selectedAddress,
//               products: cart.products.map((item) => ({
//                 product: item.product._id,
//                 quantity: item.quantity,
//                 pricePerQnt: item.product.Price,
//               })),
//               totalPrice: totalAmount,
//               paymentMethod,
//               orderStatus: 'Pending',
//             });
//             await newOrder.save();
//                // Update stock for each product in the order
//           for (const item of cart.products) {
//               const productId = item.product._id;
//               const orderedQuantity = item.quantity;
//               // Update product stock by subtracting ordered quantity
//               await Product.findByIdAndUpdate(productId, {
//                 $inc: { Stock: -orderedQuantity },
//               });
//             }
//             // Clear the user's cart after the order is placed
//             cart.products = [];
//             // cart.totalAmount = 0;
//             await cart.save();
//             return res.status(200).json({ success: true, message: 'Order placed successfully' });
//         }
//         // end of cod
//         if(paymentMethod==='Razorpay'){
//             console.log("inside razorpay");
//             console.log('Razorpay');
//               // Convert totalAmount to paise
//                  const amountInPaise = totalAmount*100;
//             const options={      
//                 amount:amountInPaise,
//                 currency:'INR',
//                 receipt:'order_receipt_'+Date.now(),
//                 payment_capture:1
//             }
//             razorpayInstance.orders.create(options,(err,data)=>{
//                     if(err){
//                         console.error('Error creating Razorpay order:', err);
        
//                         return res.status(500).json({status:false ,message:'Razorpay order creation failed'})
//                     }
//                     console.log('Razorpay order created:');
        
//                     return res.status(201).json({order:data})
//                 })
//         }
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ error: 'Internal server error' });
//     }
//   };


//   const updatePayment = async (req, res) => {
//     try {
//         console.log('inside the update payment');
//         const userId = req.session.userId;
//         const { billingAddress, paymentMethod } = req.body;
//         console.log(req.body);
//         const user = await User.findById(userId);
//         const selectedAddress = user.address[billingAddress];
//         console.log(selectedAddress);     
//         const cart = await Cart.findOne({ user: userId }).populate({
//             path: 'products.product',
//         });
//         console.log(cart);
//         if (!cart) {
//             return res.status(404).json({ status: false, message: 'Cart not found' });
//         }
//         const totalAmount = cart.products.reduce(
//             (acc, item) => acc + item.product.Price * item.quantity,
//             0
//           );      
//           const payment_details = req.body.payment_details;
//         const orderData = {
//             user: userId,
//             address: selectedAddress,
//             products: cart.products.map((item) => ({
//                 product: item.product._id,
//                 quantity: item.quantity,
//                 pricePerQnt: item.product.Price,
//               })),
//             paymentMethod,
//             totalPrice: totalAmount, 
//             orderStatus: 'Pending', // Assuming the total is in paise, convert it to rupees
//             payment_id: payment_details.razorpay_payment_id,
//             payment_status: 'paid',
//             order_Id: payment_details.razorpay_payment_id,
//         };

//         console.log(orderData);
        
//         const newOrder = new Order(orderData);
//         await newOrder.save();

//         console.log('Order added successfully');

//             // Update stock for each product in the order
//             for (const item of cart.products) {
//                 const productId = item.product._id;
//                 const orderedQuantity = item.quantity;
//                 // Update product stock by subtracting ordered quantity
//                 await Product.findByIdAndUpdate(productId, {
//                   $inc: { Stock: -orderedQuantity },
//                 });
//               }
//               // Clear the user's cart after the order is placed
//               cart.products = [];
//               // cart.totalAmount = 0;
//               await cart.save();

//         // You can add additional logic or send a response here
//         res.status(200).json({ status: true, message: 'Order placed successfully' });
//     } catch (error) {
//         console.log(error);
//         res.render('users/page-404');
//     }
// };

//   const loadOrderList =async(req,res)=>{
//     try {        
      
//             const userId = req.session.userId;
//             const orders = await Order.find({user:userId}).sort({_id:-1})            
//             res.render("orderlist",{orders,username:req.session.username});
     
//     } catch (error) {
        
//     }
// }

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


const cancelProduct = async (req, res) => {
    try {
        const productId = req.query.productId;
        const orderId = req.query.orderId;            
               // Update the product status to 'cancelled' and set cancelDate
               const cancelledProduct = await Order.findOneAndUpdate(
                { _id: orderId, 'products.product': productId },
                {
                    $set: {
                        'products.$.itemStatus': 'cancelled',
                        'products.$.cancelDate': new Date()
                    }
                },
                { new: true } // Return the updated document
            );
    
            if (!cancelledProduct) {
                console.log('Product not found in the order');
                return res.status(404).json({ success: false, message: 'Product not found in the order' });
            }
        const cancelledProductDetails = cancelledProduct.products.find(
            (product) => product.product.toString() === productId
        );
        if (cancelledProductDetails) {
            const cancelledQuantity = cancelledProductDetails.quantity;
            console.log(`Cancelled Quantity: ${cancelledQuantity}`);
        } else {
            console.log('Product not found in the order');
        }         
        
            // Check if all products in the order are cancelled
            const allProductsCancelled = cancelledProduct.products.every(
                (product) => product.itemStatus === 'cancelled'
            );
                console.log(allProductsCancelled);
            // Update order status based on the cancellation
            if (allProductsCancelled) {
                await Order.findByIdAndUpdate(orderId, { orderStatus: 'Cancel Order' });
            }
          await Product.findByIdAndUpdate(productId, {
            $inc: { Stock: cancelledProductDetails.quantity }
        });
        const updatedOrder = await Order.findById(orderId);
        console.log('Product cancelled successfully');        
        res.status(200).json({ success: true, message: 'Product cancelled successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

const returnProduct = async(req,res)=>{
    try {
        const {orderId,productId,reason}= req.body;
        console.log(reason);   
        const returnedProduct = await Order.findOneAndUpdate(
            {_id:orderId,'products.product':productId},
            {
                $set: {
                    'products.$.itemStatus': 'returned',
                    'products.$.returnReason': reason,                    
                }
            },
            { new: true }
        );
        if (!returnedProduct) {
            console.log('Product not found in the order');
            return res.status(404).json({ success: false, message: 'Product not found in the order' });
        }
        const returnedProductDetails = returnedProduct.products.find(
            (product) => product.product.toString() === productId
        );
        if (returnedProductDetails) {
            const returnQuantity = returnedProductDetails.quantity;
            console.log(`returned Quantity: ${returnQuantity}`);
        } else {
            console.log('Product not found in the order');
        }  
        // Find the original order document by orderId
        const originalOrder = await Order.findById(orderId);

        // Check if all products in the original order are cancelled or returned
        const allProductsCancelledOrReturned = originalOrder.products.every(
            (product) => ['cancelled', 'returned'].includes(product.itemStatus)
        );

        console.log(allProductsCancelledOrReturned);

        // Update order status based on the cancellation or return
        if (allProductsCancelledOrReturned) {
            // Set orderStatus to 'Returned', depending on your requirement
            await Order.findByIdAndUpdate(orderId, { orderStatus: 'Returned' });
        }

        await Product.findByIdAndUpdate(productId, {
            $inc: { Stock: returnedProductDetails.quantity }
        });
        const updatedOrder = await Order.findById(orderId);
        console.log('Product returned successfully');        
        res.status(200).json({ success: true, message: 'Product returned successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });        
    }
}

const searchResults = async(req,res)=>{
    try {
        const search = req.query.query;    
        const products = await Product.find({ Name: { $regex: new RegExp(search, 'i') } });    
        const resultFound = products.length>0;            
        res.render("search",{username:req.session.username,products,resultFound})
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error");    
    }
}

const categoryFilter = async (req, res) => {
    try {
        const categoryId = req.query.id;
        console.log(categoryId);
     
        const filteredProducts = await Product.find({ Category: categoryId });
        console.log(filteredProducts);
        const categories = await Category.find({ isListed: true });
        res.json(filteredProducts);
    } catch (error) {
        console.log(error);
    }
  };
  




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
    cancelProduct,
    addressCheckout,
    returnProduct,
    searchResults,
    categoryFilter 
}