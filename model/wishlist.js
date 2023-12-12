const mongoos= require('mongoose')

const wishListSchema = new mongoos.Schema({
  user:{
    type:mongoos.Types.ObjectId,
    ref:'User',
    require:true
  },
  product:[{
    type:mongoos.Types.ObjectId,
    ref:'Product',
    require:true
  }],
},{
  timestamps:true
})
module.exports=mongoos.model('WishList',wishListSchema) 