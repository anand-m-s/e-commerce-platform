const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const adminSchema = new mongoose.Schema({
    isAdmin: {
        type: Boolean,
        default: true, // Set to true since this is an admin schema
    },
    name: String,
    email: {
        type: String,
        unique: true,
    },
    password: String,
    phone: Number,
});
// Add a method to the schema to verify the provided password
adminSchema.methods.authenticate = function (password) {
    // Compare the provided password with the hashed password in the database
    return bcrypt.compareSync(password, this.password);
};
const Admin = mongoose.model('Admin', adminSchema);


module.exports = Admin
