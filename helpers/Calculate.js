const calculateTotalAmount = (products) => {
    let totalAmount = 0;
  
    products.forEach(product => {
      // Access variables from the addToCart function
      totalAmount += product.product.Price * product.quantity;
      console.log(cart.products.Price);
   
    });
    console.log();
  
    return totalAmount;
  };

  module.exports={
    calculateTotalAmount
  }