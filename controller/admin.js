const bcrypt = require("bcrypt");
const fs = require("fs");
const path = require("path");
require("dotenv/config");
const { ObjectId} =require('mongodb')
const { category, 
        product,
        coupon,
         } = require("../model/admin");

        
const {
  user,
  order
  } = require("../model/user")


const login = function (req, res, next) {
  try{
  const{adminlogin,adminloginwrong}= req.session
  if(adminlogin)
  res.render("admin_home")
  else{
  res.render("admin_login",{adminloginwrong});
  req.session.adminloginwrong = false;
  }
}
catch(err){
  console.log(err)
}
};


const home = (req, res) => {
  try{
  let email = process.env.adminemail;
  let password = process.env.adminpassword;
  if (req.body.email == email && password == req.body.password) {
    req.session.adminlogin = true;
    res.redirect("/admin")
  } else {
    req.session.adminloginwrong = true;
    res.redirect("/admin");
    
  }
}
catch(err){
  console.log(err)
}

};



const categories = async (req, res) => {
  try{
  let categorydetail = await category.find();
  const categorydetails = categorydetail.map((val, index) => ({
    ...val,
    number: index + 1,
  }));
  console.log(categorydetails)

  res.render("admin_category", { categorydetails });

  }
  catch(err){
    console.log(err)
  }
};


const addCategory = (req, res) => {
  try{
  const {addCategoryexist,addCategoryerror,addCategory} =req.session
  res.render("admin_add_category",{msg_exist:addCategoryexist,msg_error:addCategoryerror,msg_add:addCategory});
  req.session.addCategoryerror=false
  req.session.addCategoryexist=false
  req.session.addCategory=false
  }
  catch(err){
    console.log(err)
  }
};


const submitAddCategory = async (req, res) => {
  try{
  const { name, description } = req.body;
  let regExp = new RegExp(`^${name}`,'i')
  let find = await category.findOne({name:{$regex:regExp}})
  console.log(find)
  if (find) {
    req.session.addCategoryexist=true
    res.redirect("/admin/add_category");
  } else {
    category.create({ name, description }, (err, data) => {
     if (err) {
      req.session.addCategoryerror=true
      console.log(err);
    }
    });
    req.session.addCategory=true
    res.redirect("/admin/add_category");
    
  }
}
catch(err){
  console.log(err)
}
};

let deleteCategory = async (req,res)=>{
   
    try{
      let {id}=req.params
      console.log(id)
  let del = await category.deleteOne({_id:id})
      if(del.deletedCount===0){
        res.send({msg_deleteerr:true})
      }
      else if(del.deletedCount===1){
        res.send({msg_delete:true})
      }
    }
   catch(err){
    console.log(err)
   }
}

const products = async (req, res) => {
  try{
  let category_list = await category.find({});
  let product_list= await product.find({});
  const {product_update,product_updateerr} =req.session
  console.log(product_list)
  res.render("admin_products",{category_list,product_list,msg_update:product_update,msg_updateerr:product_updateerr});
  req.session.product_updateerr=false
  req.session.product_update=false
  }
  catch(err){
    console.log(err)
  }
};




const addProduct = async (req, res) => {
  try{
  const {product_add,product_adderr} =req.session
  let cat = await category.find({}, { name: 1 });
  res.render("admin_add_products", { cat,msg_add:product_add,msg_adderr:product_adderr });
  req.session.product_adderr=false
  req.session.product_adderr=false
  }
  catch(err){
    console.log(err)
  }
};


const submitAddProduct = (req, res) => {
      try{
      const { name, description, price, color, size, quantity, category } = req.body;
      
      

      let image = req.files.map((val) => val.filename);
       
      product.create(
        { name, description, price, color, size, quantity, category, image},
         (err, data) => {
          if (err){
           console.log(err);
          req.session.product_adderr=true
          res.redirect("/admin/add_product");
          }
          else if (data){
            req.session.product_add=true
          res.redirect("/admin/add_product");
            
          }
          else{
            req.session.product_adderr=true
            res.redirect("/admin/add_product"); 
          }
        }
      )
      }
      catch(err){
        console.log(err)
      }
    }
  


const users = async (req, res) => {
  try{
    let{userBlock,userUnBlock}=req.session
let customer= await user.find({})
  res.render("admin_customers",{customer,userBlock,userUnBlock});
  req.session.userBlock=false
  req.session.userUnBlock=false
  }
  catch(err){
    console.log(err)
  }
};


let deleteUser = async (req,res)=>{
  try{ 
    let {id}=req.params 
    let del = await user.deleteOne({_id:ObjectId(id)})
        if(del.deletedCount===0){
          res.send({msg_deleteerr:true})
        }
        else if(del.deletedCount===1){
          res.send({msg_delete:true})
        }
      }
     catch(err){
      console.log(err)
        
     }
  }



let blockUser = async (req,res)=>{
  
 try{
  let {id}=req.params
  let find= await user.findOne({_id:id})
  console.log(find)
  if(find.status){
  let block = await user.updateOne({_id:id},{status:false})
  .then(val=>{
  req.session.userBlock=true
  res.send(msg=true)
  }).catch(err=>{
    console.log(err)
  })
  }
  else{
  let block = await user.updateOne({_id:id},{status:true})
  .then(val=>{
    req.session.userUnBlock=true
    res.send(msg=true)
    }).catch(err=>{
      console.log(err)
    })
  res.send(msg=true)
  }
  
}
catch(err){
  console.log(err)
}
}





let deleteProduct = async (req,res)=>{
  
  try{
    let {id}=req.params
    console.log(id)
let del = await product.deleteOne({_id:id})
    if(del.deletedCount===0){
      res.send({msg_deleteerr:true})
    }
    else if(del.deletedCount===1){
      res.send({msg_delete:true})
    }
  }
 catch(err){
  console.log(err)
 }
}
  

let editProduct =async(req,res) =>{

  let productId =req.params.id
  let matchedproduct = await product.findOne({_id:ObjectId(productId)})
  res.render('admin_edit_product',{matchedproduct})
  }

  let editProductSubmit =async(req,res) =>{
    

    const { name, description, price, color, size, quantity, category } = req.body;
    let image = req.files.map((val) => val.filename);
    let productId =req.params.id
    try{
    let update =await product.updateOne({_id:ObjectId(productId)},{$set:
      {name, description, price, color, size, quantity, category, image
      }})
      if(update.modifiedCount==0){
        req.session.product_updateerr=true
          res.send(msg=true)
      }
      else if(update.modifiedCount==1){
        req.session.product_update=true
        res.send(msg=true)
      }
    }
    catch(err){
      console.log(err)  
    }
    }

  let productCategory =async(req,res) =>{
    let id =req.params.id
    if(id=='All')
    res.redirect('/admin/product')
    else{
    let category_list = await category.find({});
  let product_list= await product.find({category:id});
  console.log(product_list)
  res.render("admin_products",{category_list,product_list});
    }
    }

    const logout = (req, res) => {
      req.session.destroy()
      res.redirect("/admin")
    }; 
   
    const createCoupon = async (req, res) => {
      try{
      res.render("admin_create_coupons");
      }
      catch(err){
        console.log(err)
      }
    };
    
    const postCreateCoupon = async (req, res) => {
      try{
        console.log()
        let {couponName,couponCode,percentDiscount,quantity,startDate,endDate,maximumDiscount,minimumSpend,perLimit}= req.body
        let couponFound= await coupon.findOne({couponCode})
        if(!couponFound){
        coupon.create( {couponName,couponCode,percentDiscount,quantity,startDate,endDate,maximumDiscount,minimumSpend,perLimit },
           (err, data) => {
            if (err){
             console.log(err);
    
            }
            else if (data){
            res.send({status:true});
              
            }
            else{
              res.send({status:false})
            }
          }
        )
        }
        else{
          res.send({exist:true})
        }
      }
      catch(err){
        console.log(err)
      }
    }; 

    const viewCoupon = async (req, res) => {
      try{ 
       let couponDetails = await coupon.find({})
        const couponData = couponDetails.map((val, index) => ({
          ...val,
          number: index + 1,
          startDate:val.startDate.toLocaleDateString(),
          endDate:val.endDate.toLocaleDateString(),
        }))
       
      res.render("admin_coupons",{couponData});
      }
      catch(err){
        console.log(err)
      }
    }  
  

    let deleteCoupon = async (req,res)=>{
  
      try{
        let {id}=req.params
        console.log(id)
    let del = await coupon.deleteOne({_id:id})
        if(del.deletedCount===0){
          res.send({msg_deleteerr:true})
        }
        else if(del.deletedCount===1){
          res.send({msg_delete:true})
        }
      }
     catch(err){
      console.log(err)
     }
    }

    const orderList = async function (req, res, next) {
      try{
        let {orderreq}=req.query
        let {userId}=req.session
        let orderHistory=await order.find({}).populate("product.productId") 
        if(!orderreq){
          res.render("admin_orders",{orderList:orderHistory})
        }
       else{
        let orderHistory=await order.findOne({orderId:orderreq}).populate("product.productId")
        res.render("admin_orderdetails",{orderList:orderHistory})
       }
      }
      catch(err){
       console.log(err)
     }
     }
      let orderAction = async (req,res)=>{
  
      try{
        let {userId}= req.session
        let {orderId,action}= req.body
        orderHistory=await order.findOne({orderId:orderId})
        let orderChange =await order.updateOne({orderId:orderId},{ $set:{orderStatus:action} })
        if(orderChange.modifiedCount==0){
            res.send({msg:false})
        }
        else if(orderChange.modifiedCount==1){
          if(action=="cancelled"||action=="returned"){
          for (let i = 0; i < orderHistory.product.length; i++) {
            let productId = orderHistory.product[i].productId
            let quantity= orderHistory.product[i].quantity
           await product.findByIdAndUpdate(productId, { $inc: { quantity: -quantity } })
        }
      }
          res.send({msg:true,action})
        }
        
     
      }
     catch(err){
      console.log(err)
     }
    }


module.exports = {
  login,
  home,
  categories,
  addCategory,
  submitAddCategory,
  products,
  addProduct,
  submitAddProduct,
  users,
  deleteUser,
  blockUser,
  deleteCategory,
  deleteProduct,
  editProduct,
  productCategory,
  editProductSubmit,
  createCoupon,
  postCreateCoupon,
  viewCoupon,
  deleteCoupon,
  orderList,
  orderAction,
  logout,
  
};
