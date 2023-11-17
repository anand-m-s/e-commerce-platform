const session = require("express-session");
const User = require("../model/userModel");
const bcrypt = require("bcrypt");
const randomstring = require("randomstring")
const Product = require("../model/productModel");
const Category = require("../model/category");
const Address = require("../model/address");
const Cart = require("../model/cart");
const calc = require("../helpers/Calculate");




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
        // Filter out products where Category is null (not populated)
        const products = filteredproducts.filter(product => product.Category !== null);
        if (req.session.userId) {
            const user = await User.findById(req.session.userId);
            if(user && user.Isblocked){
                req.session.userId=null;
                res.render("login-user", { title: "Login", errorMessage:"Your account is blocked" });
            }else{
                res.render("home", { username: req.session.username, products })
            }
        } else {
            res.redirect("/login")
        }
    } catch (error) {
        console.log(error);
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
            res.render("login-user", { title: "login" })
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
const forgotpassword = async (req, res) => {
    try {
        const email = req.body.email;
        const userData = await User.findOne({ email: email });
        if (userData) {
            const randomString = randomstring.generate();
        } else {
            const errorMessage = "user email is incorrect"
            render("forgotpassword", { errorMessage })
        }
    } catch (error) {
        console.log(error);
    }
}

const displayProduct = async(req,res)=>{
    try {   
        const user = await User.findById(req.session.userId);
        if(user && user.Isblocked){
            const errorMessage = "Your account is blocked";
            req.session.userId =null;
            res.render("login-user",{title:"login",errorMessage});
        }
        const productId = req.query.productId;
        const products = await Product.findById(productId);
        if(!products){
            res.status(404).json({ error: "Product not found" });
        }
        res.render("productdetails",{products,username:req.session.username});
    } catch (error) {
        console.log(error);
        res.status(500).send("An error occurred");
    }
}

const loadUserProfile = async(req,res)=>{
    try {
        if(req.session.userId){
            // const users = await User.findById(req.session.userId);
            const users = await User.findById(req.session.userId).populate('address');
            const address = users.address;  // Assuming you want the latest added address            
            res.render("user-profile",{username:req.session.username,users,address});
        }else{
            res.redirect("/login");
        }
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
        
        const user = req.session.userId;
        const users = await User.findById(user);
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
        const product = await Product.findById(productId);
        let userCart = await Cart.findOne({user:userId});
        if (!userCart) {
            // If the cart doesn't exist, create a new one
            userCart = new Cart({ user: userId, products: [] });
          }
        const existingProduct =userCart.products.find(
            (cartProduct)=> cartProduct.product.toString()===productId
        );
        if(existingProduct){
            existingProduct.quantity+=1;
        }else{

            userCart.products.push({ product: productId, quantity: 1 });
        }
        await userCart.save();
        res.redirect("/home");
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred while adding to the cart');
    }
}

// const addToCart = async (req,res)=>{
//     try {
//         if(req.session.userId){

//             const userId = req.session.userId;
            
//             const users= await User.findById(userId);
//             const cart = await Cart.findOne({user:userId}).populate({
//                 path: 'products.product',
//                 populate: {
//                   path: 'Category', // Assuming 'Category' is the field name in the 'Product' model
//                   model: 'Category' // Replace 'Category' with the actual model name
//                 }
//               });     
//                  // Calculate the total amount
//                     const totalAmount = cart.products.reduce(
//                         (acc, item) => acc + item.product.Price * item.quantity,
//                         0
//                     );                        
//             res.render("addtocart",{username:users.username,cart,totalAmount});
//         }else{
//             res.redirect("/login");
//         }
//     } catch (error) {
//         console.log(error);
//     }
// }

const addToCart = async (req, res) => {
    try {
      if (req.session.userId) {
        const userId = req.session.userId;
        const users = await User.findById(userId);
        const cart = await Cart.findOne({ user: userId }).populate({
          path: 'products.product',
          populate: {
            path: 'Category',
            model: 'Category'
          }
        });
  
        const totalAmount = cart.products.reduce(
          (acc, item) => acc + item.product.Price * item.quantity,
          0
        );
  
        if (req.xhr) {
          // If it's an AJAX request, send the totalAmount as JSON
          res.json({ username: users.username, cart, totalAmount });
        } else {
          // If it's a regular request, render the addtocart page
          res.render('addtocart', { username: users.username, cart, totalAmount });
        }
      } else {
        res.redirect('/login');
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };
  

const removeFromCart = async (req, res) => {
    try {
      const cartItemId = req.query.itemId;
      const productIdToRemove = req.query.productId;
      // Use your Cart model to remove the specific product from the array
      const updatedCart = await Cart.findByIdAndUpdate(
        cartItemId,
        {
          $pull: {
            products: {
              _id: productIdToRemove // Assuming productIdToRemove is the ID of the product to remove
            }
          }
        },
        { new: true }
      ).populate('products.product');
    //   console.log(updatedCart.products[0].product);
     
      
      const totalAmount = updatedCart.products.reduce(
        (acc, item) => acc + item.product.Price * item.quantity,
        0
      );
      if (updatedCart) {
        res.json({ message: 'Product removed from the cart successfully.', updatedCart,totalAmount  });
      } else {
        res.status(404).json({ error: 'Cart not found or product not removed.' });
      }
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };

const updateQuantity = async (req, res) => {
    const { itemId, newQuantity, productId, cartId } = req.body;
    try {
      // Update the quantity in the database
      const updatedCart = await Cart.findOneAndUpdate(
        { 'products._id': itemId },
        { $set: { 'products.$.quantity': newQuantity } },
        { new: true }
      );
      if (updatedCart) {
        const updatedProduct = await Product.findById(productId);
        const updatedPrice = updatedProduct.Price * newQuantity;
        const updatedCartItem = updatedCart.products.find(item => item._id.equals(itemId));
        updatedCartItem.product.Price = updatedPrice;
        // Save the changes to the cart
        await updatedCart.save();
        // Populate the cart with product details
        const populatedCart = await Cart.findById(cartId).populate('products.product');
        // Include the cart and totalAmount in the response
        res.status(200).json({
          message: 'Quantity updated successfully.',
          updatedCart,
          updatedPrice: updatedCartItem.product.Price,
         
          cart: populatedCart, // Include the populated cart in the response
        });
      } else {
        res.status(404).json({ error: 'Cart item not found.' });
      }
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
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
    forgotpassword,
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
    addToCart,
    addProductsToCart,
    removeFromCart,
    updateQuantity
 
}