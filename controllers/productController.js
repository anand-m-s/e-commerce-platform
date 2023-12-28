const Product = require('../model/productModel');



const addproduct = async (req, res) => {
    try {
      console.log(req.files);
      const { Name, Category, Brand, Description, Price, Storage, RAM, OS, Color, Processor, Stock, SalePrice } = req.body;
      console.log(req.body);
      const files = req.files;
      
      const ProductImage = files.map((file) => ({
        filename: file.filename,
        path: file.path
      }));
  
      const newProduct = new Product({
        Name,
        Category,
        Brand,
        Description,
        Price,
        Features: [{
          Processor: Processor,
          Ram: RAM,
          Storage: Storage,
          Os: OS,
          Color: Color
        }],
        SalePrice,
        Stock,
        ProductImage: ProductImage, 
      });
      await newProduct.save();
      res.status(200).json({ message: 'Product added successfully' });
      // res.redirect('/admin/addproduct');
  
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };



const updateProduct = async (req, res) => {
    try {
        const productId = req.query.id;
        const product = await Product.findById(productId);
        if (!product) {
          return res.status(404).json({ error: 'Product not found' });
        }
        const { Name, Category, Brand, Description, Price, Storage, Ram, Os, Color, Processor, Stock, SalePrice } = req.body;


        product.Name = Name;
        product.Category = Category;
        product.Brand = Brand;
        product.Description = Description;
        product.Price = Price;
        product.SalePrice = SalePrice;
        product.Stock = Stock;  

        // Update Features field
        product.Features = [{
          Processor: Processor,
          Ram: Ram,
          Storage: Storage,
          Os: Os,
          Color: Color
        }];

        // Handle image deletion based on checkboxes
        let deleteData = [];

        if (req.body.deletecheckbox) {
            deleteData.push(req.body.deletecheckbox);
            deleteData = deleteData.flat().map(x => Number(x));
            product.ProductImage = product.ProductImage.filter((img, idx) => !deleteData.includes(idx));
        }

        // Update ProductImage field with new images
        if (req.files && req.files.length > 0) {
          const productImage = req.files.map(file => ({
            filename: file.filename,
            path: file.path
          }));
          product.ProductImage = product.ProductImage.concat(productImage);
        }

        await product.save();
        res.redirect(`/admin/addproduct`);
      
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
};


  module.exports ={
    addproduct,
    updateProduct
  }