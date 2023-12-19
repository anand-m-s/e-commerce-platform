const mongoose = require('mongoose');
const bcrypt = require("bcrypt")

const userSchema = new mongoose.Schema({
    username: String,
    email: {
        type: String,
        unique: true,
    },
    password: String,
    phone: String,
    Isblocked: {
        type: Boolean,
        default: false
    },
    cart: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cart',
      },
    address:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Address', 
    },],
    referralCode: {
        type: String,
        default: RandomReferralCode,
        unique: true, 
    },
    userReferred: [{
        type: String,
        unique: true,
    }],
}, {
    timestamps: true,
  });  

userSchema.methods.authenticate = function (password) {
    
    return bcrypt.compareSync(password, this.password);
};

function RandomReferralCode() {

    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const codeLength = 6;
    let referralCode = '';
    for (let i = 0; i < codeLength; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        referralCode += characters.charAt(randomIndex);
    }
    return referralCode;
    }

const User = mongoose.model('User', userSchema);

module.exports = User;