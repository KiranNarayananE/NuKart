const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { product } = require('./admin');
const { ObjectId} =require('mongodb')


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true],
        
      },
      phone: {
        type: Number,
        required: [true],
        unique: true,
      },
    email: {
      type: String,
      required: [true],
      unique: true,
    },
    password: {
      type: String,
      required: [true],
      minlength: [6],
    },
    confirm_password: {
      type: String,
      required: [true],
      minlength: [6],
    },
    status: {
      type: Boolean
    },
    address: [
      {
          default: {
              type: Boolean,
              default: false
          },
          firstName: {
              type: String,
              required: true
          },
          lastName: {
              type: String,
              required: true
          },
          address: {
              type: String,
              required: true
          },
          city: {
              type: String,
              required: true
          },
          state: {
              type: String,
              required: true
          },
          street: {
            type: String,
            required: true
        },
        country: {
          type: String,
          required: true
      },
          
          zipcode: {
              type: Number,
              required: true
          },
          phone: {
              type: Number,
              required: true
          },
          email: {
            type: String,
            required: true
        },default:[]
      }
  ]
  });
  userSchema.pre('save', async function(next) {
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
    this.confirm_password = await bcrypt.hash(this.password, salt);
    next();
  });

  const cartSchema = new mongoose.Schema({
    userId: {
        type: String,
        ref:"user",
        unique:true,
        required: [true],
        
      },
      item: [{
        productId:{type:String,
          ref:"product",
          required: [true],
      } ,
        quantity:{
          type:Number,
          default:1,
          required: [true]
        } ,
        totalPrice:{
          type:Number
        }
      }],
      
    })

  const wishListSchema= new mongoose.Schema({
    userId:{
      type:String,
      ref:"user",
      required: [true]
    },
    wishList: [
      
      {
          productId: {
              type: ObjectId,
              ref: 'product',
          }
      }
  ]
  })




  
  const user = mongoose.model('user', userSchema)
  const cart = mongoose.model('cart', cartSchema)
  const wishList = mongoose.model('wishList', wishListSchema)
  













module.exports = {
    user,
    cart,
    wishList
  };