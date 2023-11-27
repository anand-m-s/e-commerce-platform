const User = require("../model/userModel");
const Product = require("../model/productModel");
const Cart = require("../model/cart");


const addToCart = async (req, res) => {
    try {
     
        const userId = req.session.userId;
        const users = await User.findById(userId);
        let cart = await Cart.findOne({ user: userId }).populate({
          path: 'products.product',
          populate: {
            path: 'Category',
            model: 'Category'
          }
        });
         // If the cart is not found, create a new one
        if(!cart){
          cart = new Cart ({user:userId,products:[]});
          await cart.save();
        }  
      
        const totalAmount = cart.products.reduce(
          (acc, item) => acc + item.product.Price * item.quantity,
          0
        );
        if (req.xhr) {
          // If it's an AJAX request, send the totalAmount as JSON
          res.json({ username: users.username, cart, totalAmount});
        } else {
          // If it's a regular request, render the addtocart page
          res.render('addtocart', { username: users.username, cart,totalAmount});
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
      console.log(newQuantity);
      if (updatedCart) {
        const updatedProduct = await Product.findById(productId);
        // console.log(updatedProduct);
          // Check if the new quantity exceeds the product stock
      if (newQuantity > updatedProduct.Stock) {
        return res.status(400).json({ error: 'Not enough stock available.' });
      }

        const updatedPrice = updatedProduct.Price * newQuantity;
        const updatedCartItem = updatedCart.products.find(item => item._id.equals(itemId));
        updatedCartItem.product.Price = updatedPrice;
        // Save the changes to the cart
        await updatedCart.save();
        // Populate the cart with product details
        const populatedCart = await Cart.findById(cartId).populate('products.product');
      
        res.status(200).json({
          message: 'Quantity updated successfully.',
          updatedCart,
          updatedPrice: updatedCartItem.product.Price,         
          cart: populatedCart,// Include the populated cart in the response
          
        });
      } else {
        res.status(404).json({ error: 'Cart item not found.' });
      }
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };


  module.exports={
    addToCart,
    removeFromCart,
    updateQuantity,

  }