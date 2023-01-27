const bcrypt = require("bcrypt");
const { product, category } = require("../model/admin");
const db = require("../config/server");
require("dotenv/config");
const accountSid = process.env.accountSid;
const authToken = process.env.authToken;
const client = require('twilio')(accountSid, authToken);
const {
  user,
  cart,
  wishList
} = require("../model/user")
const {ObjectId} =require('mongodb')



const home = async function (req, res, next) {
 
  let {loginuser,loginTocart,userId}=req.session
  let cart_limit= await cart.findOne({userId}).populate("item.productId")
  
const product_list = await product.find({})
  res.render("home",{product_list,cart_limit,msg_login:loginuser,msg_loginTocart:loginTocart});
  req.session.loginTocart=false
};

const login = function (req, res, next) {
res.render("userlogin",{msg_create:req.session.signup,msgblock:req.session.loginerror_block,msg_email:req.session.loginerror_email,msgpassword:req.session.loginerror_password});
req.session.signup  = false
req.session.loginerror_block  = false
req.session.loginerror_email  = false
req.session.loginerror_password  = false
};

const enterPhone = function(req, res, next) {
  
    res.render('enterphone',{msgerror:req.session.mobileexist})
    req.session.mobileexist=false
  }

const enterOtp = async function(req, res, next) {
    const{phone} = req.body
  let find = await user.findOne({phone})
  if(find){
    req.session.mobileexist=true
    res.redirect("/verifyphone")
  }  
 else{

req.session.phone = phone
client.verify.v2.services('VA38bef4cfc13a6013d179b33f24acdce5')
                .verifications
                .create({to: `+91${phone}`, channel: 'sms'})
                .then(verification =>{
                  console.log(verification)
                   res.render("enterotp",{"msg_error":req.session.otperror,"msg_wrong":req.session.otpwrong})})
.catch(error => {
  console.error(error)
  res.redirect("/verifyphone")
})
}
}

  const verifyOtp = function(req, res, next) {
    phone =req.session.phone
    const enteredOTP = req.body.otp;
    client.verify.v2.services('VA38bef4cfc13a6013d179b33f24acdce5')
    .verificationChecks
    .create({to: `+91${phone}`, code: enteredOTP})
    .then(verification_check => {if(verification_check.status=="approved"){
    req.session.otpcorrect = true
        res.render('usersignup',{"msg_correct":req.session.otpcorrect,msg_exist:req.session.emailregistered})
        req.session.otpcorrect = false
    }
        else{
          req.session.otpwrong = true
      res.render("enterotp",{"msg_error":req.session.otperror,"msg_wrong":req.session.otpwrong})
      req.session.otpwrong=false
        }
        })
  
    .catch(error => {
      req.session.otperror = true
      res.render("enterotp",{"msg_error":req.session.otperror,"msg_wrong":req.session.otpwrong})
      req.session.otperror=false
      console.error(error)
    })
}  
   

const signup = async function(req, res, next) {
  const status = true
    const {name,email,password,confirm_password}= req.body
    const phone=req.session.phone
    let find = await user.findOne({email})
    if(find){
      req.session.emailregistered=true
      res.render("usersignup",{"msg_correct":req.session.otpcorrect,msg_exist:req.session.emailregistered})
      req.session.emailregistered=true
    }
    else{
    
    user.create(
      { name,email ,phone, password,confirm_password,status },
      (err, data) => {
        if (err) {
        console.log(err);
        }
        else
        req.session.signup  = true
        res.redirect('/login');
        
      }

    );
  
    }
  }

  const loginPost= async (req,res)=>{
    const{email,password} = req.body
    const find = await user.findOne({email});
  if (find) {
    if(find.status==false){
      req.session.loginerror_block  = true
      res.redirect('/login')
      
    }
    else{
    bcrypt.compare(password,find.password,async(err,data)=>{

      if(err) {
          console.log(err)
      }
      else if (data){
        const id = await user.findOne({email},{_id:1})
           
        req.session.userId= id._id
         req.session.loginuser=true;

         res.redirect('/')
      }else{
          
          req.session.loginerror_password  = true
           res.redirect('/login')
           
      }
  })
}
  }
else{
  req.session.loginerror_email = true
  res.redirect('/login')
 
  console.log("wrong usser")
  
}
}

const shop = async function (req, res, next) {
  const product_list = await product.find({})
  const category_list = await category.find({})
  let cart_limit= await cart.findOne({userId:req.session.userId}).populate("item.productId")
  res.render("shop",{category_list,product_list,cart_limit,msg_login:req.session.loginuser});
};  
const logout = async function (req, res, next) {
  req.session.destroy()
  res.redirect("/login")

}

const categories = async (req, res) => {
  try{
    let{id} = req.query
    console.log(id)
    if (id=='allProducts'){
    const product_list = await product.find({})
    const category_list = await category.find({})

    let cart_limit= await cart.findOne({userId:req.session.userId}).populate("item.productId")
    res.render("shop",{category_list,product_list,cart_limit,msg_login:req.session.loginuser});
    }
    else{
      const product_list = await product.find({category:id})
      console.log(product_list)
      const category_list = await category.find({})
  
      let cart_limit= await cart.findOne({userId:req.session.userId}).populate("item.productId")
      res.render("shop",{category_list,product_list,cart_limit,msg_login:req.session.loginuser}); 
    }
  }
  catch(err){
    console.log(err)
  }
}

let productDetail = async (req,res)=>{
  let id1=req.params.id
  
  let {outOfStock,quantityOfStock,loginTocart,addToCartError,addToCartSuccess,loginuser}= req.session
  let cart_limit= await cart.findOne({userId:req.session.userId}).populate("item.productId")
  product_list= await product.findOne({_id:id1})
  res.render("product-detail",{product_list,msg_login:loginuser,cart_limit,msg_outOfStock:outOfStock,msg_quantityOfStock:quantityOfStock,msg_loginTocart:loginTocart,msg_addToCartError:addToCartError,msg_addToCartSuccess:addToCartSuccess})
  req.session.outOfStock=false
  req.session.quantityOfStock=false
  req.session.loginTocart=false
  req.session.addToCartError=false
  req.session.addToCartSuccess=false
  
} 

const profile = async function (req, res, next) {
  const user_list= await user.findOne({_id:req.session.userId})
  res.render("user_profile",{user_list,msg_login:req.session.loginuser})

}

const addToCart = async function (req, res, next) {
  console.log(req.body)
  let {userId,loginuser}=req.session
  let productId= req.params.id
  if(loginuser){
    let {quantity}=req.body
  let product_limit= await product.findOne({_id:productId},{quantity:1,_id:0,price:1})
  let totalPrice = quantity * product_limit.price
  let object={
    productId:productId,
    quantity:quantity,
    totalPrice:totalPrice
  }
  if(quantity>product_limit.quantity){
    
    if(quantity==1){
      res.send({msg_outOfStock:true})

    }
    else{
      
      res.send({msg_quantityOfStock:true})
    }
  }
  else{
  let cartExist= await cart.findOne({userId:userId})
  if(cartExist){
    
    let productExist= await cart.findOne({userId,"item.productId":productId})
     if(!productExist){
      
    let cartUpdate= await cart.updateOne({userId},{$push:{item:object}})
    .then(val=>{
      res.send({msg_addToCartSuccess:true})
    }).catch(err=>{
      res.send({msg_addToCartError:true})
    })
  }
    else{
      let item=await cart.findOne({userId,"item.productId":productId},{"item": 1,_id:0})
      let productData= item.item.filter(val=>val.productId==productId)
       let actualQuantity = +productData[0].quantity+ +quantity
       if(actualQuantity<=product_limit.quantity){
        
      let cartUpdate =await cart.updateOne({userId,"item.productId":productId},{$inc:{"item.$.quantity": quantity,"item.$.totalPrice":totalPrice}})
      .then(val=>{
        res.send({msg_addToCartSuccess:true})
      }).catch(err=>{
        res.send({msg_addToCartError:true})
      })
    }
    else{
      res.send({msg_quantityOfStock:true})
    }
  }
         
  }
    else{

     
      let cartCreate= await cart.create({userId,item:[{productId,quantity,totalPrice}]})
      .then(val=>{
        res.send({msg_addToCartSuccess:true})
      }).catch(err=>{
        console.log(err)
        res.send({msg_addToCartError:true})
      })
    }
  }
}
  else{
    res.send({msg_loginTocart:true})
  }
}


const viewCart = async function (req, res, next) {
  let {userId,loginuser}=req.session
   if(userId){
  let cartData =  await cart.findOne({userId:userId})
  .populate("item.productId","name price image")
  if(cartData ){
  let cartDetail=cartData.item
  let grandPrice=cartDetail.reduce((acc,curr)=>
    acc+=curr.totalPrice,0)
 
  res.render("shoping-cart",{cartData ,msg_login:req.session.loginuser,userId,grandPrice})
   }
   else{
    res.render("shoping-cart",{cartData ,msg_login:req.session.loginuser,userId})
   }
  }
  
   else{
    req.session.loginTocart=true
    res.redirect("/")
   }
}

const checkOut = async function (req, res, next) {

  let productId= req.params.id
  let {userId,increment} =req.body.data
  
  let item=await cart.findOne({userId,"item.productId":productId},{"item": 1,_id:0})
  let productData= item.item.filter(val=>val.productId==productId)
  let grandPrice=item.item.reduce((acc,curr)=>
  acc+=curr.totalPrice,0)
   let quantity =productData[0].quantity
   let totalPrice =productData[0].totalPrice
   
   let product_limit= await product.findOne({_id:productId},{quantity:1,_id:0,price:1,name:1})
     let {price,name} =product_limit
  if(increment){
    if(quantity<product_limit.quantity){
      let cartUpdate =await cart.updateOne({userId,"item.productId":productId},{$inc:{"item.$.quantity": 1,"item.$.totalPrice":price }})
      .then(val=>{
        res.send({
          totalPrice:+totalPrice+ +price,
          msg_quantityOfStock:false,
          grandPrice:+grandPrice+ +price
        })
      }).catch(err=>{
        console.log(err)
      })
    }
    else{
      res.send({productId:productId,
        msg_quantityOfStock:true})
       
    }
  }
    else{
      if(quantity==1){
        let cartUpdate =await cart.updateOne({userId,"item.productId":productId},{ $pull: { item: { productId: productId } }})
        res.send({
          msg_delete:true
        })
      }
      else{
      let cartUpdate =await cart.updateOne({userId,"item.productId":productId},{$inc:{"item.$.quantity": -1,"item.$.totalPrice": -price}})
      .then(val=>{
        res.send({
          totalPrice:totalPrice-price,
          grandPrice:grandPrice- price,
          msg_delete:false,
        })
      }).catch(err=>{
        console.log(err)
      })
    } 
  }
    }


     const address = async function (req, res, next) {
      const user_list= await user.findOne({_id:req.session.userId})
      
      res.render("user_address",{user_list,msg_login:req.session.loginuser})
    
    }

    const addAddress = async function (req, res, next) {
      let {userId}=req.session
      let {data}=req.body
      
      const addressUpdate= await user.updateOne({_id:userId},{$push:{address:data}})
      .then(()=>{
        
      })
    }

    const cartCheckout = async function (req, res, next) {
      
      res.render("checkOut")
    }

    const addToWishList = async function (req, res, next) {
     let {userId,loginuser}=req.session
     let {productId}= req.params
     let object =ObjectId(productId)
     if(userId){
     let wishListExist= await wishList.findOne({userId:userId})
     if(!wishListExist){
      let wishListCreate= await wishList.create({userId:userId,wishList:[{productId:object}]})
      .then(val=>{
        res.send({status:true})
      }).catch(err=>{
        console.log(err)
      })
    }
    else{
      let productExist= await wishList.findOne({userId:userId,"wishList.productId":productId})
      if(!productExist){
      let wishListUpdate =await wishList.updateOne({userId},{$push:{wishList:{productId:object}}})
      .then(val=>{
        res.send({status:true})
      }).catch(err=>{
        console.log(err)
      }) 
    }
    else{
      let wishListUpdate =await wishList.updateOne({userId},{$pull:{wishList:{productId:object}}})
      .then(val=>{
        res.send({status:false})
      }).catch(err=>{
        console.log(err)
      })
    }
  }
}
  }


  const viewWishList = async function (req, res, next) {
    let {userId,loginuser}=req.session
     if(userId){
    let wishListData =  await wishList.findOne({userId:userId})
    .populate("wishList.productId","name price image") 
      res.render("wishlist",{wishListData,msg_login:req.session.loginuser,userId})
     }
    }
    const applyCoupon = async function (req, res, next) {
      let {userId}=req.session
      let couponCode=req.body
      let date= new Date(Date.now())
      console.log(date)
       
  }

  

module.exports = {
  home,
  login,
  enterPhone,
  enterOtp,
  verifyOtp,
  signup,
  loginPost,
  shop,
  categories,
  logout,
  productDetail,
  profile,
  addToCart,
  viewCart,
  checkOut,
  address,
  addAddress,
  cartCheckout,
  addToWishList,
  viewWishList,
  applyCoupon
};
