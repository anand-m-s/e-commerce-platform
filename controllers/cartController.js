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
        
        if(!cart){
          cart = new Cart ({user:userId,products:[]});
          await cart.save();
        }  
      
        const totalAmount = cart.products.reduce(
          (acc, item) => acc + item.product.Price * item.quantity,
          0
        );
        if (req.xhr) {
          
          res.json({ username: users.username, cart, totalAmount});
        } else {
          
          res.render('addtocart', { title:'Cart',username: users.username, cart,totalAmount});
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
      
      const updatedCart = await Cart.findByIdAndUpdate(
        cartItemId,
        {
          $pull: {
            products: {
              _id: productIdToRemove 
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
        
        await updatedCart.save();
       
        const populatedCart = await Cart.findById(cartId).populate('products.product');
      
        res.status(200).json({
          message: 'Quantity updated successfully.',
          updatedCart,
          updatedPrice: updatedCartItem.product.Price,         
          cart: populatedCart,
          
        });
      } else {
        res.status(404).json({ error: 'Cart item not found.' });
      }
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };


  const cartTimeStamp = async(req,res)=>{
    try {
      const userId = req.session.userId;
      const cart = await Cart.findOne({user:userId});
      if (!cart) {
        return res.status(404).json({ error: 'Cart not found' });
      }      
      console.log(cart.updatedAt,"::::::updated timestamp:::::::::::::::::");
      res.json({ updatedCartTimestamp: cart.updatedAt });
    } catch (error){
      console.error('Error fetching cart timestamp:', error);
      res.status(500).json({ error: 'Internal server error' });
      
    }
  }


  module.exports={
    addToCart,
    removeFromCart,
    updateQuantity,
    cartTimeStamp
  }