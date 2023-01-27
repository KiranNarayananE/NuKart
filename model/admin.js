const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { ObjectId} =require('mongodb')



const categorySchema = new mongoose.Schema({
  name:{
    type: String,
    required: [true],
    
  },
  description: {
    type: String,
    required: [true],
  }
},{
    versionKey:false
});
const category = mongoose.model('category', categorySchema);

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true],
    
  },
  description: {
    type: String,
    required: [true],
  },
  price:{
    type:  Number,
    required: [true],
  },
  color: {
    type: String,
    required: [true],
  },
  size:{
    type:  Number,
    required: [true],
  },
  quantity:{
    type:  Number,
    required: [true],
  },
  category:{
    type:  String,
    ref: "category",
    required: [true],
  },
  image:{
    type:  Array,
    required: [true],
  },
},{
    versionKey:false
});

const product = mongoose.model('product', productSchema);

const couponSchema = new mongoose.Schema(
  {      couponName: {
    type: String,
    unique: true,
    required: true
},
      couponCode: {
          type: String,
          unique: true,
          trim: true,
          required: true
      },
      percentDiscount: {
          type: Number,
          required: true
      },
    quantity: {
      type: Number,
      required: true
  },

      startDate: {
          type: Date,
          required: true
      },

      endDate: {
          type: Date,
          required: true
      },
      maximumDiscount: {
          type: Number,
          required: true
      },
      minimumSpend: {
        type: Number,
        required: true
    },
    perLimit: {
      type: Number,
      required: true
  },
  perCustomer: {
    type: Number,
    default:1
},
      couponStatus: {
          type: Boolean,
          default: true
      },
      users: [
          {
              user: {
                  type: ObjectId,
                  ref: 'user'
              },
              useTime: {
                type: Number,
                default:0
            }

          }
      ]

  }
)

const coupon = mongoose.model('coupon', couponSchema);

module.exports = {
    category,
    product,
    coupon
  };