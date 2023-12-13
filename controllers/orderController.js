const Order = require("../model/order");
const Wallet = require("../model/wallet");
const Product = require("../model/productModel");




const cancelProduct = async (req, res) => {
    try {
        const productId = req.query.productId;
        const orderId = req.query.orderId;      
        const userId = req.session.userId      
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
            // console.log(cancelledProduct+"////////////////////");    
            if (!cancelledProduct) {
                console.log('Product not found in the order');
                return res.status(404).json({ success: false, message: 'Product not found in the order' });
            }
        const cancelledProductDetails = cancelledProduct.products.find(
            (product) => product.product.toString() === productId
        );
        // console.log("cancelled product details::::::::::"+cancelledProductDetails);
        // During product cancellation (if necessary)
                const userWallet = await Wallet.findOne({ user: userId });
         
                if (!userWallet) {
                    // Create a new wallet for the user with an initial balance of 0
                    const newWallet = new Wallet({
                        user: userId,
                        balance: 0
                    });
                    await newWallet.save();
               
                }

        if (cancelledProduct.paymentMethod === 'Razorpay') {        
          
            const refundedAmount = (cancelledProductDetails.pricePerQnt * cancelledProductDetails.quantity)-cancelledProductDetails.discountPrice;
          
                userWallet.transactions.push({
                    amount: refundedAmount,
                    type: 'credit'
                });
            
            userWallet.balance += refundedAmount;
            await userWallet.save();
            console.log(userWallet);
        }

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

const successPage = (req,res)=>{
    try {
        
        res.render("successpage");
    } catch (error) {
        
    }
}

module.exports ={
    successPage,
    cancelProduct,
    returnProduct
}

