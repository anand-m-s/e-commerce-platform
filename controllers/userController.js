const session = require("express-session");
const User = require("../model/userModel");
const bcrypt = require("bcrypt");
const randomstring = require("randomstring")
const Product = require("../model/productModel");


//register
const register = async (req, res) => {
    try {
        const { Username, Email, Password, phone } = req.body.userData;
        const existingUser = await User.findOne({ $or: [{ email: Email }, { username: Username }] });
        if (existingUser) {
            const errorMessage = "User already exists";
            res.redirect(`/signup?error=${encodeURIComponent(errorMessage)}`);
        } else {
            // Hash the password
            const hashedPassword = await bcrypt.hash(Password, 10);
            const newUser = new User({ username: Username, email: Email, password: hashedPassword, phone })
            const userresult = await newUser.save();
            // console.log(userresult);
            // res.redirect("/login");
        }
    }
    catch (err) {
        console.log(err);
        res.redirect("/signup")
    }
}

//verify otp
const verifyOtp =async (req, res) => {
    try {
      const { phone } = req.body.Phone;
      const phoneNumber = req.body.Phone;
    await User.findOneAndUpdate(
        { phone: phoneNumber.slice(-10) }, // Use slice to get the last 10 digits
        { $set: { Isverified: true } }
        );
        res.status(200).send({ message: 'OTP verification successful' });
    } catch (error) {
      console.error(error);
      res.status(500).send({ error: 'Internal server error' });
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
                if(user.Isverified && user.Isblocked!==true){
                    req.session.userId = user._id;
                    req.session.username = user.username;
                    res.redirect("/home");
                }else{
                    if (user.Isverified!==true){
                        const errorMessage = "User not verified";
                        res.render("login-user", { title: "Login", errorMessage });
                    } else{
                        const errorMessage = "Blocked"
                        res.render("login-user",{title:"login",errorMessage}) 
                    }
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
        const products = await Product.find({})
        if (req.session.userId) {
            const user = await User.findById(req.session.userId);
            if(user && user.Isblocked){
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
        const products = await Product.find({})
        if (req.session.userId) {
            res.redirect("home")
        }
        else {
            res.render("index", { title: "index", products })
        }
    } catch (error) {
        console.log(error);
    }
}

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


const loginlogin = (req, res) => {
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


//display each product product detail page
const displayProduct = async (req, res) => {
    try {
        const productId = req.query.productId;
        console.log(productId);
        if(!productId){
            return res.status(400).json({error: "Product ID is missing in the query parameteres"});
        }
        const products = await Product.findById(productId);
        res.render("productdetails",{products,username: req.session.username});
    } catch (error) {

    }
}


module.exports = {
    register,
    login,
    homelogin,
    indexlogin,
    signuplogin,
    loginlogin,
    logout,
    forgotpassword,
    displayProduct,
    verifyOtp
    

}