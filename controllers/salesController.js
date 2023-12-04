const Order= require('../model/order')


const getSalesReport = async (req, res) => {
    try {
      const salesReport = await Order.aggregate([
        {
          $match: {
            orderStatus: 'Delivered'
          }
        },
        {
          $unwind: '$products'
        },
        {
          $lookup: {
            from: 'products',
            localField: 'products.product',
            foreignField: '_id',
            as: 'productDetails'
          }
        },
        {
          $unwind: '$productDetails'
        },
        {
          $lookup: {
            from: 'categories',
            localField: 'productDetails.Category',
            foreignField: '_id',
            as: 'productDetailsCategory'
          }
        },
        {
          $unwind: '$productDetailsCategory'
        },
        {
          $lookup: {
            from: 'users',
            localField: 'user',
            foreignField: '_id',
            as: 'userDetails'
          }
        },
        {
          $unwind: '$userDetails'
        },
        {
          $project: {
            orderDate: 1,
            'userDetails.username': 1,
            'productDetails.Name': 1,
            'productDetailsCategory.categoryName': 1,
            'products.pricePerQnt': 1,
            'products.quantity': 1,
            paymentMethod: 1
          }
        }
      ]);
      // console.log(salesReport);
  
      for (const entry of salesReport) {
        entry.orderDate = entry.orderDate.toISOString().split('T')[0];
      }
  
      res.render("admin/salesreport", { salesReport, email: req.session.email });
    } catch (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
    }
  };
  
  
  const getFilterSalesReport = async (req, res) => {
    try {
      const paymentMethod = req.params.payment
      // console.log(paymentMethod);
      const salesReport = await Order.aggregate([
        {
          $match: {
            orderStatus: 'Delivered',
            paymentMethod: paymentMethod
          }
        },
        {
          $unwind: '$products'
        },
        {
          $lookup: {
            from: 'products',
            localField: 'products.product',
            foreignField: '_id',
            as: 'productDetails'
          }
        },
        {
          $unwind: '$productDetails'
        },
        {
          $lookup: {
            from: 'categories',
            localField: 'productDetails.Category',
            foreignField: '_id',
            as: 'productDetailsCategory'
          }
        },
        {
          $unwind: '$productDetailsCategory'
        },
        {
          $lookup: {
            from: 'users',
            localField: 'user',
            foreignField: '_id',
            as: 'userDetails'
          }
        },
        {
          $unwind: '$userDetails'
        },
        {
          $project: {
            orderDate: 1,
            'userDetails.username': 1,
            'productDetails.Name': 1,
            'productDetailsCategory.categoryName': 1,
            'products.pricePerQnt': 1,
            'products.quantity': 1,
            paymentMethod: 1
          }
        }
      ]);
  
      for (const entry of salesReport) {
        entry.orderDate = entry.orderDate.toISOString().split('T')[0];
      }
      // console.log(salesReport);
  
      res.json(salesReport); // Send JSON response
    } catch (err) {
      res.status(500).send('An error occurred: ' + err.message);
    }
  };
  
  const getDatedReport = async (req, res) => {
    try {
      let startDate = req.query.startDate;
      let endDate = req.query.endDate;
      console.log(startDate);
      let salesReport
  
      if (startDate === endDate) {
        const today = new Date();
        const startTime = new Date(today);
        startTime.setUTCHours(0, 0, 0, 0);
        const endTime = new Date(today);
        endTime.setUTCHours(23, 59, 59, 999);
  
        salesReport = await Order.aggregate([
          {
            $match: {
              orderStatus: 'Delivered',
              orderDate: {
                $gte: startTime,
                $lte: endTime
              }
            }
          },
          {
            $unwind: '$products'
          },
          {
            $lookup: {
              from: 'products',
              localField: 'products.product',
              foreignField: '_id',
              as: 'productDetails'
            }
          },
          {
            $unwind: '$productDetails'
          },
          {
            $lookup: {
              from: 'categories',
              localField: 'productDetails.Category',
              foreignField: '_id',
              as: 'productDetailsCategory'
            }
          },
          {
            $unwind: '$productDetailsCategory'
          },
          {
            $lookup: {
              from: 'users',
              localField: 'user',
              foreignField: '_id',
              as: 'userDetails'
            }
          },
          {
            $unwind: '$userDetails'
          },
          {
            $project: {
              orderDate: 1,
              'userDetails.username': 1,
              'productDetails.Name': 1,
              'productDetailsCategory.categoryName': 1,
              'products.pricePerQnt': 1,
              'products.quantity': 1,
              paymentMethod: 1
  
            }
          }
  
        ]);
  
        for (const entry of salesReport) {
          entry.orderDate = entry.orderDate.toISOString().split('T')[0];
        }
  
  
      } else {
        startDate = new Date(startDate);
        endDate = new Date();
  
        salesReport = await Order.aggregate([
          {
            $match: {
              orderStatus: 'Delivered',
              orderDate: {
                $gte: startDate,
                $lte: endDate
              }
            }
          },
          {
            $unwind: '$products'
          },
          {
            $lookup: {
              from: 'products',
              localField: 'products.product',
              foreignField: '_id',
              as: 'productDetails'
            }
          },
          {
            $unwind: '$productDetails'
          },
          {
            $lookup: {
              from: 'categories',
              localField: 'productDetails.Category',
              foreignField: '_id',
              as: 'productDetailsCategory'
            }
          },
          {
            $unwind: '$productDetailsCategory'
          },
          {
            $lookup: {
              from: 'users',
              localField: 'user',
              foreignField: '_id',
              as: 'userDetails'
            }
          },
          {
            $unwind: '$userDetails'
          },
          {
            $project: {
              orderDate: 1,
              'userDetails.username': 1,
              'productDetails.Name': 1,
              'productDetailsCategory.categoryName': 1,
              'products.pricePerQnt': 1,
              'products.quantity': 1,
              paymentMethod: 1
  
            }
          }
        ]);
        for (const entry of salesReport) {
          entry.orderDate = entry.orderDate.toISOString().split('T')[0];
        }
      }
      res.json(salesReport);
    } catch (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
    }
  };

  
module.exports={
    getSalesReport,
    getFilterSalesReport,
    getDatedReport
}