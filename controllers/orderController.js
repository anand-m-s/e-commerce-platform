const Order = require("../model/order");
const Wallet = require("../model/wallet");
const Product = require("../model/productModel");


const cancelProduct = async (req, res) => {
    try {
        const productId = req.query.productId;
        const orderId = req.query.orderId;      
        const userId = req.session.userId            
               const cancelledProduct = await Order.findOneAndUpdate(
                { _id: orderId, 'products.product': productId },
                {
                    $set: {
                        'products.$.itemStatus': 'cancelled',
                        'products.$.cancelDate': new Date()
                    }
                },
                { new: true }
            );    
            // console.log(cancelledProduct+"::::::::::::::::::::::::");    
            if (!cancelledProduct) {
                console.log('Product not found in the order');
                return res.status(404).json({ success: false, message: 'Product not found in the order' });
            }
        const cancelledProductDetails = cancelledProduct.products.find(
            (product) => product.product.toString() === productId
        );
        // console.log("cancelled product details::::::::::"+cancelledProductDetails);
                const userWallet = await Wallet.findOne({ user: userId });
         
                if (!userWallet) {                    
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
        
       
            const allProductsCancelled = cancelledProduct.products.every(
                (product) => product.itemStatus === 'cancelled'
            );
                console.log(allProductsCancelled);
         
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

const returnRequest = async(req,res)=>{
    try {
        const {orderId,productId,reason}= req.body;
        const userId = req.session.userId
        console.log(reason);   
        const returnedProduct = await Order.findOneAndUpdate(
            {_id:orderId,'products.product':productId},
            {
                $set: {
                    'products.$.itemStatus': 'Return requested',
                    'products.$.returnReason': reason,                    
                }
            },
            { new: true }
        );
        // if (!returnedProduct) {
        //     console.log('Product not found in the order');
        //     return res.status(404).json({ success: false, message: 'Product not found in the order' });
        // }
        // const returnedProductDetails = returnedProduct.products.find(
        //     (product) => product.product.toString() === productId
        // );

        // const userWallet = await Wallet.findOne({ user: userId });
         
        // if (!userWallet) {                    
        //     const newWallet = new Wallet({
        //         user: userId,
        //         balance: 0
        //     });
        //     await newWallet.save();       
        // }       
        //     const refundedAmount = (returnedProductDetails.pricePerQnt * returnedProductDetails.quantity)-returnedProductDetails.discountPrice;
        
        //         userWallet.transactions.push({
        //             amount: refundedAmount,
        //             type: 'credit'
        //         });
            
        //     userWallet.balance += refundedAmount;
        //     await userWallet.save();
        //     console.log(userWallet);
        // if (returnedProductDetails) {
        //     const returnQuantity = returnedProductDetails.quantity;
        //     console.log(`returned Quantity: ${returnQuantity}`);
        // } else {
        //     console.log('Product not found in the order');
        // }  
        // const originalOrder = await Order.findById(orderId);   
        // const allProductsCancelledOrReturned = originalOrder.products.every(
        //     (product) => ['cancelled', 'returned'].includes(product.itemStatus)
        // );
        // console.log(allProductsCancelledOrReturned);
        // if (allProductsCancelledOrReturned) {
   
        //     await Order.findByIdAndUpdate(orderId, { orderStatus: 'Returned' });
        // }
        // await Product.findByIdAndUpdate(productId, {
        //     $inc: { Stock: returnedProductDetails.quantity }
        // });
        // const updatedOrder = await Order.findById(orderId);
        // console.log('Product returned successfully');        
        res.status(200).json({ success: true, message: 'Return request sended' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });        
    }
}

const successPage = (req,res)=>{
    try {
        
        res.render("successpage",{title:'Success'});
    } catch (error) {
        
    }
}

const returnApprove =async(req,res)=>{
    try {
        const {orderId,productId}= req.body; 
        const returnedProduct = await Order.findOneAndUpdate(
            {_id:orderId,'products.product':productId},
            {
                $set: {
                    'products.$.itemStatus': 'returned',                                     
                }
            },
            { new: true }
        );
        // console.log(returnedProduct);
        const userId = returnedProduct.user;
        // console.log(userId);
        if (!returnedProduct) {
            console.log('Product not found in the order');
            return res.status(404).json({ success: false, message: 'Product not found in the order' });
        }
        const returnedProductDetails = returnedProduct.products.find(
            (product) => product.product.toString() === productId
        );

        const userWallet = await Wallet.findOne({ user: userId });
         
        if (!userWallet) {                    
            const newWallet = new Wallet({
                user: userId,
                balance: 0
            });
            await newWallet.save();       
        }       
            const refundedAmount = (returnedProductDetails.pricePerQnt * returnedProductDetails.quantity)-returnedProductDetails.discountPrice;
        
                userWallet.transactions.push({
                    amount: refundedAmount,
                    type: 'credit'
                });
            
            userWallet.balance += refundedAmount;
            await userWallet.save();
            // console.log(userWallet);
        if (returnedProductDetails) {
            const returnQuantity = returnedProductDetails.quantity;
            console.log(`returned Quantity: ${returnQuantity}`);
        } else {
            console.log('Product not found in the order');
        }  
        const originalOrder = await Order.findById(orderId);   
        const allProductsCancelledOrReturned = originalOrder.products.every(
            (product) => ['cancelled', 'returned'].includes(product.itemStatus)
        );
        console.log(allProductsCancelledOrReturned);
        if (allProductsCancelledOrReturned) {
   
            await Order.findByIdAndUpdate(orderId, { orderStatus: 'Returned' });
        }
        await Product.findByIdAndUpdate(productId, {
            $inc: { Stock: returnedProductDetails.quantity }
        });
        const updatedOrder = await Order.findById(orderId);
        console.log('Product returned successfully');        
        res.status(200).json({ success: true, message: 'Return request sended' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });        
    }
}

module.exports ={
    successPage,
    cancelProduct,
    returnRequest,
    returnApprove
}

