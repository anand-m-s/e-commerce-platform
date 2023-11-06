const session = require("express-session");
const User = require("../model/userModel");
const bcrypt = require("bcrypt");
const randomstring = require("randomstring")
const Product = require("../model/productModel");


    //register
    const register = async (req, res) => {
        console.log(req.body);
        const { Username, Email, Password, phone } = req.body.userData;
        const existingUser = await User.findOne({ $or: [{ email : Email }, {username: Username }] });
        console.log(existingUser);
        try {
            if (existingUser) {
                const errorMessage = "User already exists";
                res.redirect(`/signup?error=${encodeURIComponent(errorMessage)}`);
            } else {

                // Hash the password
                console.log(Password);
                const hashedPassword = await bcrypt.hash(Password, 10);
                const newUser = new User({ username : Username, email:  Email, password: hashedPassword, phone })
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
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (user) {
            const passwordMatch = await bcrypt.compare(password, user.password);
            if (passwordMatch) {
                req.session.userId = user._id;
                req.session.username = user.username;
                res.redirect("/home");
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

const homelogin = async(req,res)=>{
    const products = await Product.find({})
    if(req.session.userId){
        res.render("home",{username:req.session.username,products})
    }else{
        res.redirect("/login")
    }
}

const indexlogin = async(req,res)=>{
    const products = await Product.find({})
    if(req.session.userId){
        res.redirect("home")
    }
    else{
        res.render("index", {title : "index",products})
    }
}

const signuplogin = (req,res)=>{
    if(req.session.userId){
        res.redirect("/home")
    }else{
        res.render("signup-user", {title :"signup"})
    }
}

const loginlogin = (req, res) => {
    if (req.session.userId) {
        res.redirect("/home")
    } else {
        res.render("login-user", { title: "login" })
    }
}
// Logout controller
// const logout = (req, res) => {
//     req.session.destroy((err) => {
//         if (err) {
//             console.error(err);
//         }
//         res.redirect('/login');
//     });
// };

const logout = (req, res) => {
    try {
      req.session.userId = null;
      res.redirect('/login');
    } catch (err) {
      console.error(err);
    }
  };
  

//reset password
const forgotpassword = async(req,res)=>{
    try {
        const email = req.body.email;
        const userData =await User.findOne({email:email});
       if(userData){
        const randomString = randomstring.generate();
       }else{
        const errorMessage = "user email is incorrect"
        render("forgotpassword",{errorMessage})
       }
    } catch (error) {
        console.log(error);
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

}