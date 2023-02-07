const bcrypt = require("bcrypt");
const { product, category, coupon } = require("../model/admin");
const db = require("../config/server");
require("dotenv/config");
const { v4: uuidv4 } = require('uuid');
const accountSid = process.env.accountSid;
const authToken = process.env.authToken;
const client = require('twilio')(accountSid, authToken);
const {
  user,
  cart,
  wishList,
  order
} = require("../model/user")
const {ObjectId} =require('mongodb');
const paypal =require("@paypal/checkout-server-sdk")
const envirolment =
  process.env.NODE_ENV === "production"
    ? paypal.core.LiveEnvironment
    : paypal.core.SandboxEnvironment;
const CLIENT_ID =process.env.PAYPAL_CLIENT_ID
const paypalCliend = new paypal.core.PayPalHttpClient(
  new envirolment(process.env.PAYPAL_CLIENT_ID, process.env.PAYPAL_CLIENT_SECRET)
);




const home = async function (req, res, next) {
 try{

  let {loginuser,loginTocart,userId,loginToWishList}=req.session
  let cart_limit= await cart.findOne({userId}).populate("item.productId")
  let wishListData =  await wishList.findOne({userId:userId})
    .populate("wishList.productId","name price image")
  let cartCount=0
  let wishListCount=0
  if(cart_limit){
    cartCount=cart_limit.item.
    length
  }
  if(wishListData){
    wishListCount= wishListData.
    wishList.length
  }
  
const product_list = await product.find({})
  res.render("home",{product_list,cart_limit,msg_login:loginuser,msg_loginTocart:loginTocart,msg_loginTowishList:loginToWishList,cartCount,wishListCount});
  req.session.loginTocart=false
  req.session.loginToWishList=false
 }
 catch(err){
  console.log(err)
 }
};

const login = function (req, res, next) {
  try{
    let{signup,loginerror_block,loginerror_email,loginerror_password}= req.session
res.render("userlogin",{msg_create:signup,msgblock:loginerror_block,msg_email:loginerror_email,msgpassword:loginerror_password});
req.session.signup  = false
req.session.loginerror_block  = false
req.session.loginerror_email  = false
req.session.loginerror_password  = false
  }
  catch(err){
    console.log(err)
  } 
};

const enterPhone = function(req, res, next) {
    try{
    res.render('enterotp')
    }
    catch(err){
      console.log(err)
    }
  }

const enterOtp = async function(req, res, next) {
  try{
    let {phone,password} = req.body
    req.session.phone = phone
    function sendOtp(mobile) {
    client.verify.v2.services('VA38bef4cfc13a6013d179b33f24acdce5')
                .verifications
                .create({to: `+91${mobile}`, channel: 'sms'})
                .then(verification =>{
                  console.log(verification)
                 
                   res.send({status :true,phone:mobile})})
.catch(error => {
  console.error(error)

})
  }
  let find = await user.findOne({phone})
  if(!password){
  
  if(find){
    
    res.send({msg:"Number Already registered "})
  }  
 else{


sendOtp(phone)

}
  }
  else{
    if(find){
   
  sendOtp(phone)
    }
    else{
    res.send({msg:"Number not Registered"})
    }

  }
  }
  catch(err){
    console.log(err)
  }
}

  const verifyOtp = function(req, res, next) {
    try{
    let {phone} =req.session
    const enteredOTP = req.body.otp;
    
    
    client.verify.v2.services('VA38bef4cfc13a6013d179b33f24acdce5')
    .verificationChecks
    .create({to: `+91${phone}`, code: enteredOTP})
    .then(verification_check => {if(verification_check.status=="approved"){
    req.session.otpcorrect = true
    res.send({status:true})   
    }
        else{
          res.send({msg: "Enter correct otp"})
        }
        })
  
    .catch(error => {
      
      console.error(error)
    })
  
  }
  catch(err){
    console.log(err)
  }
}  

const viewSignup = function(req, res, next) {
  try{
    console.log(req.session.emailregistered);
    res.render('usersignup',{"msg_correct":req.session.otpcorrect,msg_exist:req.session.emailregistered})
    req.session.otpcorrect = false
    req.session.emailregistered=false
  }
  catch(err){
    console.log(err)
  }
}
   

const signup = async function(req, res, next) {
  try{
  
    const {name,email,password,confirm_password}= req.body
    const phone=req.session.phone
    let find = await user.findOne({email})
    if(find){
      req.session.emailregistered=true
      res.redirect("/signup")
    }
    else{
    
    user.create(
      { name,email ,phone, password,confirm_password },
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
    catch(err){
      console.log(err)
    }
  }

  const loginPost= async (req,res)=>{
    try{
    const {email,password} = req.body
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
    catch(err){
      console.log(err)
    }
}
const passwordView = async function (req, res, next) {
  try{
    res.render("forgotpassword")  
  }
  catch(err){
    console.log(err)
  }

}

const passwordVerify = async function (req, res, next) {
  try{
    let {email,password,confirm_password}= req.body
    let find = await user.findOne({email})
    if(find){
    const salt = await bcrypt.genSalt();
    password = await bcrypt.hash(password, salt);
    confirm_password = await bcrypt.hash(confirm_password, salt)
    let cartUpdate= await cart.updateOne({email},{$set:{password,confirm_password}})
    res.send({status:true})
    }
    else{
    
      res.send({msg:"E-mail not registered"})
  }
}
  catch(err){
    console.log(err)
  }

}
const shop = async function (req, res, next) {
  try{
    const {userId} =req.session
  const product_list = await product.find({})
  const category_list = await category.find({})
  let cart_limit= await cart.findOne({userId:userId}).populate("item.productId")
  let wishListData =  await wishList.findOne({userId:userId})
    .populate("wishList.productId","name price image")
  let cartCount=0
  let wishListCount=0
  if(cart_limit){
    cartCount=cart_limit.item.
    length
  }
  if(wishListData){
    wishListCount= wishListData.
    wishList.length
  }
  res.render("shop",{category_list,product_list,cart_limit,msg_login:req.session.loginuser,wishListCount,cartCount});
  }
  catch(err){
    console.log(err)
  }
};  
const logout = async function (req, res, next) {
  try{
  req.session.destroy()
  res.redirect("/login")
}
catch(err){
  console.log(err)
}

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
  try{
   ; 
  let id1=req.params.id
  
  let {outOfStock,quantityOfStock,loginTocart,addToCartError,addToCartSuccess,loginuser,userId}= req.session
  let cart_limit= await cart.findOne({userId:userId}).populate("item.productId")
  let wishListData =  await wishList.findOne({userId:userId})
    .populate("wishList.productId","name price image")
  let cartCount=0
  let wishListCount=0
  if(cart_limit){
    cartCount=cart_limit.item.
    length
  }
  if(wishListData){
    wishListCount= wishListData.
    wishList.length
  }
  product_list= await product.findOne({_id:id1})
  res.render("product-detail",{product_list,msg_login:loginuser,cart_limit,msg_outOfStock:outOfStock,msg_quantityOfStock:quantityOfStock,msg_loginTocart:loginTocart,msg_addToCartError:addToCartError,msg_addToCartSuccess:addToCartSuccess,wishListCount,cartCount})
  req.session.outOfStock=false
  req.session.quantityOfStock=false
  req.session.loginTocart=false
  req.session.addToCartError=false
  req.session.addToCartSuccess=false
  }
  catch(err){
    console.log(err)
  } 
} 

const profile = async function (req, res, next) {
  try{
  const user_list= await user.findOne({_id:req.session.userId})
  res.render("user_profile",{user_list,msg_login:req.session.loginuser})
  }
  catch(err){
    console.log(err)
  }
}

const addToCart = async function (req, res, next) {
  try{
  console.log(req.body)
  let {userId,loginuser}=req.session
  let productId= req.query.id
  
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
catch(err){
  console.log(err)
}
}


const viewCart = async function (req, res, next) {
  try{
  req.session.couponapplied=false
  let {userId,loginuser,quantityOfStock,productName}=req.session
  console.log(productName);
  let cartData =  await cart.findOne({userId:userId})
  .populate("item.productId","name price image")
  let wishListData =  await wishList.findOne({userId:userId})
    .populate("wishList.productId","name price image")
  let cartCount=0
  let wishListCount=0
  if(wishListData){
    wishListCount= wishListData.
    wishList.length
  }

  if(cartData ){
    cartCount=cartData.item.
    length
  let cartDetail=cartData.item
  let grandPrice=cartDetail.reduce((acc,curr)=>
    acc+=curr.totalPrice,0)
 
  res.render("shoping-cart",{cartData ,msg_login:req.session.loginuser,userId,grandPrice,msg_quantityOfStock:quantityOfStock,wishListCount,cartCount,productName})
  req.session.quantityOfStock=false
   }
   else{
    res.render("shoping-cart",{cartData ,msg_login:req.session.loginuser,userId,cartCount,wishListCount,msg_quantityOfStock:quantityOfStock,productName})
    req.session.quantityOfStock=false
   }
  
  }
  catch(err){
    console.log(err)
  }
}

const cartEdit = async function (req, res, next) {
 try{
  req.session.couponapplied=false
  let productId= req.query.id
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
          grandPrice:grandPrice- price,
          msg_delete:true,
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
catch(err){
  console.log(err)
}
    }


     const address = async function (req, res, next) {
      try{
      const user_list= await user.findOne({_id:req.session.userId})
      
      res.render("user_address",{user_list,msg_login:req.session.loginuser})
      }
      catch(err){
        console.log(err)
      }
    }

    const addAddress = async function (req, res, next) {
      try{
      let {userId}=req.session
      console.log(req.body)
      let {data}=req.body
      
      const addressUpdate= await user.updateOne({_id:userId},{$push:{address:data}})
      .then(async ()=>{
        const user_list= await user.findOne({_id:req.session.userId},{address:1})
        res.send({status:true,userAddress:user_list.address})
      })
    }
    catch(err){
      console.log(err)
    }
    }

    const getEditAddress = async function (req, res, next) {
      try{
        let {userId}=req.session
        let{id}=req.query
       let userAddress = await user.aggregate([{ $match: { _id:ObjectId(userId) } },
          { $project: { "address": { $filter: { input: "$address", cond: { $eq: ["$$this._id",ObjectId(id)] } } },_id: 0 } }])      
        res.send({userAddress:userAddress[0].address[0]})
      }
      catch(err){
        console.log(err)
      }
    }

    const updateAddress = async function (req, res, next) {
      try{
      let {userId}=req.session
      let {firstName,lastName,address,street,city,state,zipcode,country,phone,email,id}=req.body.data
      
      let updateAddress =await user.updateOne({ _id:ObjectId(userId), 'address._id': ObjectId(id) }, { $set: { 'address.$.firstName': firstName, 'address.$.lastName': lastName, 'address.$.address':address, 'address.$.city':city, 'address.$.country':country,'address.$.state': state,'address.$.street':street,'address.$.email':email, 'address.$.zipcode':zipcode, 'address.$.phone':phone } })
        if(updateAddress.modifiedCount==0){
            res.send({msg:false})
        }
        else if(updateAddress.modifiedCount==1){
          const user_list= await user.findOne({_id:req.session.userId},{address:1})
          res.send({msg:true,userAddress:user_list.address})
        }
    }
    catch(err){
      console.log(err)
    }
    }
    let deleteAddress = async (req,res)=>{
  
      try{
        let {id}=req.query
        let {userId}= req.session
        let addressDelete =await user.updateOne({_id:userId},{ $pull: { address: { _id:id } } })
        if(addressDelete.modifiedCount==0){
            res.send({msg:false})
        }
        else if(addressDelete.modifiedCount==1){
          const user_list= await user.findOne({_id:req.session.userId},{address:1})
          res.send({msg:true})
        }
      }
     catch(err){
      console.log(err)
     }
    }
    const cartCheckout = async function (req, res, next) {
      try{
      let {userId,loginuser,couponapplied,discount}= req.session
      let userList=await user.findOne({_id:userId})
    let cartItem=await cart.findOne({userId:userId},{"item": 1,_id:0}).populate("item.productId","quantity name")
    let wishListData =  await wishList.findOne({userId:userId})
    .populate("wishList.productId","name price image")
  let cartCount=0
  let wishListCount=0
  
  cartCount=cartItem.item.
    length
  if(wishListData){
    wishListCount= wishListData.
    wishList.length
  }
    let subTotalPrice=cartItem.item.reduce((acc,curr)=>
     acc+=curr.totalPrice,0)
     let proceedTocheckout= true
     for (let i = 0; i < cartItem.item.length; i++) {
      let cartQuantity = cartItem.item[i].quantity
       let inventoryQuantity=cartItem.item[i].productId.quantity
       if(cartQuantity>inventoryQuantity){
        req.session.productName=cartItem.item[i].productId.name
        proceedTocheckout=false
        break
       }
       }
       if(proceedTocheckout){
    if(!couponapplied){
      
   
      res.render("checkOut",{userList,msg_login:loginuser,subTotalPrice,totalPrice:subTotalPrice,discount:0,CLIENT_ID,wishListCount,cartCount})
    }
    else{
      res.render("checkOut",{userList,msg_login:loginuser,subTotalPrice,totalPrice:subTotalPrice-discount,discount:discount,CLIENT_ID,cartCount,wishListCount})
    }
  }
  else{
    req.session.quantityOfStock=true
    res.redirect("/cart")
  }
  }
  catch(err){
    console.log(err)
  }
    }


  

    const orderPost = async function (req, res, next) {
      try{
      let {userId,loginuser,discount,couponapplied,couponappliedCode}= req.session
      let {id,paymentMode}= req.body
      
      console.log(paymentMode)
      let userList=await user.findOne({_id:userId})
      let cartItem=await cart.findOne({userId:userId})
      let subTotalPrice=cartItem.item.reduce((acc,curr)=>
      acc+=curr.totalPrice,0)
      let totalPrice=subTotalPrice
      if(couponapplied){
        totalPrice=subTotalPrice-discount
        }
      const index= userList.address.findIndex(obj=>
        obj._id==id)
        if(paymentMode=="online"){
          req.session.addressId=id
          const request = new paypal.orders.OrdersCreateRequest();
    
  
  request.prefer("return=representation");
  request.requestBody({
    intent: "CAPTURE",
    purchase_units: [
      {
        amount: {
          currency_code: "USD",
          value: totalPrice,
        },
      },
    ],
  });
  
    const order = await paypalCliend.execute(request);
    res.send({id: order.result.id });


        }
        else if (paymentMode=="COD"){
          
          order.create( {userId,product:cartItem.item,deliveryAddress:userList.address[index],subTotalPrice,discountPrice:discount,totalPrice,orderId:`LS${uuidv4().replace(/-/g, '').slice(0, 10)}`.toUpperCase(),couponCode},
           async (err, data) => {
             if (err){
              console.log(err);
     
             }
             else if (data){
             await cart.updateOne({userId:userId}, { $set: {item: [] }})
             for (let i = 0; i < cartItem.item.length; i++) {
              let productId = cartItem.item[i].productId
              let quantity= cartItem.item[i].quantity
             await product.findByIdAndUpdate(productId, { $inc: { quantity: -quantity } })
          }
              await coupon.updateOne({couponCode:couponappliedCode}, { $push: {users: {user:ObjectId(userId)} }})
             res.send({status:true});
               
             }
             else{
               res.send({status:false})
             }
           }
         )
        }
        }
      
      catch(err){
        console.log(err)
      }
    }

    const verifyPayment = async function (req, res, next) {
      try{
        let {userId,loginuser,discount,couponapplied,couponappliedCode,addressId}= req.session
         console.log(req.body)
       const {id}=req.body
       const {payer_id}=req.body.payer
        let userList=await user.findOne({_id:userId})
        let cartItem=await cart.findOne({userId:userId})
        let subTotalPrice=cartItem.item.reduce((acc,curr)=>
        acc+=curr.totalPrice,0)
        let totalPrice=subTotalPrice
        const index= userList.address.findIndex(obj=>
          obj._id==addressId)
          if(couponapplied){
            totalPrice=subTotalPrice-discount
            }
          order.create( {userId,product:cartItem.item,deliveryAddress:userList.address[index],subTotalPrice,discountPrice:discount,Payment:"paypal",paypalDetails:{id,payer_id},totalPrice,orderId:`LS${uuidv4().replace(/-/g, '').slice(0, 10)}`.toUpperCase(),couponappliedCode},
            async (err, data) => {
              if (err){
               console.log(err); 
      
              }
              else if (data){
              await cart.updateOne({userId:userId}, { $set: {item: [] }})

        for (let i = 0; i < cartItem.item.length; i++) {
            let productId = cartItem.item[i].productId
            let quantity= cartItem.item[i].quantity
           await product.findByIdAndUpdate(productId, { $inc: { quantity: -quantity } })
        }
               await coupon.updateOne({couponCode:couponappliedCode}, { $push: {users: {user:ObjectId(userId)} }})
              res.send({status:true});
                
              }
              else{
                res.send({status:false})
              }
            })
      
         
        }
      catch(err){
        console.log(err)
      }
    }

    const addToWishList = async function (req, res, next) {
      try{
     let {userId,loginuser}=req.session
     let {productId}= req.params
     let object =ObjectId(productId)
   
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
      catch(err){
        console.log(err)
      }
  }


  const viewWishList = async function (req, res, next) {
    try{
    let {userId,loginuser}=req.session
     
    let wishListData =  await wishList.findOne({userId:userId})
    .populate("wishList.productId","name price image") 
      res.render("wishlist",{wishListData,msg_login:req.session.loginuser,userId})
     
    }
    catch(err){
      console.log(err)
    }
    }


    const applyCoupon = async function (req, res, next) {
      try{
      let {userId,couponappliedCode,couponapplied}=req.session
      let {couponCode}=req.body
      console.log(userId)
      let date= new Date(Date.now())
      if(!couponapplied||couponCode!=couponappliedCode){
        req.session.couponapplied=false
        
      let couponFind=await coupon.findOne({couponCode:couponCode})
      let cartItem=await cart.findOne({userId:userId},{"item": 1,_id:0})
    
              let totalPrice=cartItem.item.reduce((acc,curr)=>
               acc+=curr.totalPrice,0)
      if(couponFind){
        
        if(date>=couponFind.startDate&&date<=couponFind.endDate){
          if(couponFind.quantity>0){
            let alreadyUsed= await coupon.findOne({couponCode:couponCode,"users.user":userId})
            if(!alreadyUsed){
             
               if(totalPrice>couponFind.minimumSpend){
                 let discountPrice= (couponFind.percentDiscount*totalPrice)/100
                 if(discountPrice>couponFind.maximumDiscount){
                  req.session.couponapplied=true
                  req.session.couponappliedCode=couponCode
                  req.session.discount=couponFind.maximumDiscount
                  res.send({status:true,discount:couponFind.maximumDiscount,totalPrice:totalPrice-discountPrice,msg:"Coupon Applied"
                  })
                 }
                 else{
                  req.session.couponapplied=true
                  req.session.couponappliedCode=couponCode
                  req.session.discount=discountPrice
                  res.send({status:true,discount:discountPrice,totalPrice:totalPrice-discountPrice,msg:"Coupon Applied"})
                 }
               }
               else{
                res.send({msg:`Spend Minimum RS ${couponFind. minimumSpend}`,totalPrice:totalPrice })
               }
            }
            else{
              res.send({msg:"Coupon Already Used",totalPrice:totalPrice}) 
            }
          }
          else{
            res.send({msg:"Coupon Expired",totalPrice:totalPrice})
          }
        }
        else{
          res.send({msg:"Coupon out of date",totalPrice:totalPrice})
        }
      }
      else{
        res.send({msg:"Coupon Invalid",totalPrice:totalPrice})
      }
    }
    else{
      res.send({msg:"Coupon Already Applied"})
    } 
  }
  catch(err){
    console.log(err)
  }
  }
  const orderList = async function (req, res, next) {
    try{
      let {orderreq}=req.query
      let {loginuser,loginTocart,userId,loginToWishList}=req.session
      let cart_limit= await cart.findOne({userId}).populate("item.productId")
      let orderHistory=await order.find({userId}).populate("product.productId")
      let wishListData =  await wishList.findOne({userId:userId})
        .populate("wishList.productId","name price image")
      let cartCount=0
      let wishListCount=0
      if(cart_limit){
        cartCount=cart_limit.item.
        length
      }
      if(wishListData){
        wishListCount= wishListData.
        wishList.length
      }
      if(!orderreq){
        res.render("order",{msg_login:loginuser,orderList:orderHistory,cart_limit,cartCount,wishListCount})
      }
     else{
      let orderHistory=await order.findOne({orderId:orderreq}).populate("product.productId")
      console.log(orderHistory)
      res.render("orderdetails",{msg_login:loginuser,orderList:orderHistory,cart_limit,cartCount,wishListCount})
     }
    }
    catch(err){
     console.log(err)
   }
   }

   let orderCancel = async (req,res)=>{
  
    try{
      let {userId}= req.session
      let {orderId}= req.body
      orderHistory=await order.findOne({orderId:orderId})
      let orderChange =await order.updateOne({orderId:orderId},{ $set:{orderStatus:"cancelled"} })
      if(orderChange.modifiedCount==0){
          res.send({msg:false})
      }
      else if(orderChange.modifiedCount==1){
        for (let i = 0; i < orderHistory.product.length; i++) {
          let productId = orderHistory.product[i].productId
          let quantity= orderHistory.product[i].quantity
         await product.findByIdAndUpdate(productId, { $inc: { quantity: -quantity } })
      }
        res.send({msg:true})
      }
    }
   catch(err){
    console.log(err)
   }
  }
 
  const search = async (req,res)=>{
  try {
    let {name}=req.body;
    let regExp = new RegExp(`${name}`,'i')
    // let find = await product.find({name:{$regex:regExp}})
    let {loginuser,loginTocart,userId,loginToWishList}=req.session
  let cart_limit= await cart.findOne({userId}).populate("item.productId")
  let wishListData =  await wishList.findOne({userId:userId})
    .populate("wishList.productId","name price image")
  let cartCount=0
  let wishListCount=0
  if(cart_limit){
    cartCount=cart_limit.item.
    length
  }
  if(wishListData){
    wishListCount= wishListData.
    wishList.length
  }
  
const product_list = await product.find({name:{$regex:regExp}})
  res.render("home",{product_list,cart_limit,msg_login:loginuser,msg_loginTocart:loginTocart,msg_loginTowishList:loginToWishList,cartCount,wishListCount});
  req.session.loginTocart=false
  req.session.loginToWishList=false

  } catch (error) {
   console.log(error) 
  }

  }


  const success = async function (req, res, next) {
   try{
    let {loginuser,loginTocart,userId}=req.session
    res.render("success",{msg_login:loginuser,msg_loginTocart:loginTocart})
   }
   catch(err){
    console.log(err)
  }
  }
module.exports = {
  home,
  login, 
  enterPhone,
  enterOtp,
  verifyOtp,
  viewSignup,
  signup,
  loginPost,
  passwordView,
  passwordVerify,
  shop,
  search,
  categories,
  logout,
  productDetail,
  profile,
  addToCart,
  viewCart,
  cartEdit,
  address,
  addAddress,
  getEditAddress,
  updateAddress,
  deleteAddress,
  cartCheckout,
  verifyPayment,
  addToWishList,
  viewWishList,
  applyCoupon,
  orderPost,
  orderList,
  orderCancel,
  success
};
