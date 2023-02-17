const bcrypt = require("bcrypt");
const fs = require("fs");
const path = require("path");
const moment = require("moment")
require("dotenv/config");
const { ObjectId} =require('mongodb')
const { category, 
        product,
        coupon,
        banner
         } = require("../model/admin");

        
const {
  user,
  order
  } = require("../model/user");




const login = async function (req, res, next) {
  try{
  const{adminlogin,adminloginwrong}= req.session
  let orderList=await order.find({}).populate("product.productId").sort( {createdAt: -1 } ).limit(10)

  let totalPrice = await order.aggregate([
    {
      $match: { orderStatus: "delivered" },
  }, {
    $group: {
      _id: null,
      totalSum: {
        $sum: "$totalPrice"
      }
    }
  }])
  let productCount = await order.aggregate([
    {
      $match: { orderStatus: "delivered" },
  }, {
    $unwind: "$product"
  },
  {
    $group: {
      _id: null,
      totalQuantity: {
        $sum: "$product.quantity"
      }
    }
  }])
  if(adminlogin)
  res.render("admin_home",{totalPrice,productCount,orderList})
  else{
  res.render("admin_login",{adminloginwrong});
  req.session.adminloginwrong = false;
  }
}
catch(err){
  err.admin = true;
        next(err);
}
};


const home = async (req, res) => {
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
  err.admin = true;
        next(err);
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
    err.admin = true;
    next(err);
};

}
const addCategory = (req, res) => {
  try{
  const {addCategoryexist,addCategoryerror,addCategory} =req.session
  res.render("admin_add_category",{msg_exist:addCategoryexist,msg_error:addCategoryerror,msg_add:addCategory});
  req.session.addCategoryerror=false
  req.session.addCategoryexist=false
  req.session.addCategory=false
  }
  catch(err){
    err.admin = true;
        next(err);
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
  err.admin = true;
        next(err);
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
    err.admin = true;
        next(err);
   }
}

const products = async (req, res) => {
  try{
  let category_list = await category.find({});
  let product_list= await product.find({status:true});
  const {product_update,product_updateerr} =req.session
  console.log(product_list)
  res.render("admin_products",{category_list,product_list,msg_update:product_update,msg_updateerr:product_updateerr});
  req.session.product_updateerr=false
  req.session.product_update=false
  }
  catch(err){
    err.admin = true;
        next(err);
  }
};




const addProduct = async (req, res) => {
  try{
  const {product_add,product_adderr} =req.session
  let cat = await category.find({}, { name: 1 });
  res.render("admin_add_products", { cat,msg_add:product_add,msg_adderr:product_adderr });
  req.session.product_add=false
  req.session.product_adderr=false
  }
  catch(err){
    err.admin = true;
    next(err);
  }
};


const  submitAddProduct = (req, res) => {
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
        err.admin = true;
        next(err);
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
    err.admin = true;
        next(err);
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
      err.admin = true;
        next(err);
        
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
  err.admin = true;
        next(err);
}
}





let deleteProduct = async (req,res)=>{
  
  try{
    let {id}=req.params
    console.log(id)
let del = await product.updateOne({_id:id},{status:false})
    if(del.modifiedCount===0){
      res.send({msg_deleteerr:true})
    }
    else if(del.modifiedCount===1){
      res.send({msg_delete:true})
    }
  }
 catch(err){
  err.admin = true;
        next(err);
 }
}
  

let editProduct =async(req,res) =>{

  let productId =req.params.id
  let matchedproduct = await product.findOne({_id:ObjectId(productId)})
  res.render('admin_edit_product',{matchedproduct})
  }

  let editProductSubmit =async(req,res) =>{
    
    try{
      console.log(req.body)
    let { name, description, price, color, size, quantity, category,position} = req.body
    position = JSON.parse(req.body.position)
    let imageMulter = req.files.map((val) => val.filename);
    
    let productId =req.params.id
     let find=await product.findOne({_id:ObjectId(productId)})
      let {image}=find
      let i=0
      position.forEach(element => {
        image[element]=imageMulter[i]
        i++
      });
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
      err.admin = true;
        next(err);  
    }
    }

  let productCategory =async(req,res) =>{
    try {
      let id =req.params.id
    if(id=='All')
    res.redirect('/admin/product')
    else{
    let category_list = await category.find({});
  let product_list= await product.find({category:id});
  console.log(product_list)
  res.render("admin_products",{category_list,product_list});
    }
    } catch (err) {
      err.admin = true;
        next(err);
    }
    
    }

    
   
    const createCoupon = async (req, res) => {
      try{
      res.render("admin_create_coupons");
      }
      catch(err){
        err.admin = true;
        next(err);      }
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
        err.admin = true;
        next(err);
      }
    }; 
    let getBanner =async(req,res) =>{
      try {
        let matchedBanner=await banner.find({})
     
      let {bannerId} =req.query
      if(bannerId){
        matchedBanner = await banner.findOne({_id:ObjectId(bannerId)})
        console.log(matchedBanner)
      res.render('admin_banner_edit',{matchedBanner})
      }
      else{
        res.render('admin_banner',{matchedBanner})
      }
      } catch (err) {
        err.admin = true;
        next(err);
      }
     
      }


    const  editbannerSubmit = (req, res) => {
      try{
       
      const { titlename,title,link } = req.body;
      
      const{bannerId}=req.query

      let image = req.files.map((val) => val.filename)
       
      let update=banner.updateOne({_id:ObjectId(bannerId)},
        {$set:{titlename,title,link,image:image[0]}} 
      ).then(()=>{
        res.send({msg:true})
      }).catch((err)=>{
        console.log(err)
      })
      
      
      }
      catch(err){
        err.admin = true;
        next(err);
      }
    } 
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
        err.admin = true;
        next(err);
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
      err.admin = true;
        next(err);
     }
    }

    const orderList = async function (req, res, next) {
      try{
        let {orderreq}=req.query
        let {userId}=req.session
        let orderHistory=await order.find({}).populate("product.productId").sort( {createdAt: -1 } ) 
        if(!orderreq){
          res.render("admin_orders",{orderList:orderHistory})
        }
       else{
        let orderHistory=await order.findOne({orderId:orderreq}).populate("product.productId")
        res.render("admin_orderdetails",{orderList:orderHistory})
       }
      }
      catch(err){
        err.admin = true;
        next(err);
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
      err.admin = true;
        next(err);
     }
    }
    let paymentAction = async (req,res)=>{
  
      try{
        let {userId}= req.session
        let {orderId,action}= req.body
        orderHistory=await order.findOne({orderId:orderId})
        let orderChange =await order.updateOne({orderId:orderId},{ $set:{paymentStatus:action} })
        if(orderChange.modifiedCount==0){
            res.send({msg:false})
        }
        else if(orderChange.modifiedCount==1){
          if(action==refund){
           await user.updateOne({_id:userId},{walletBalance:orderHistory.totalPrice})
          }
          res.send({msg:true,action})
        }
        
     
      }
     catch(err){
      err.admin = true;
        next(err);
     }
    }

   const salesReport= async (req, res, next) => {
    try{
      let saleReport = []
      let todayDate = new Date();
      let DaysAgo = new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000);
      console.log(DaysAgo);
      saleReport = await order.aggregate([
          {
              $match: { createdAt: { $gte: DaysAgo } },
          },
          {
              $group: {
                  _id: { $dateToString: { format: "%d-%m-%Y", date: "$createdAt" } },
                  totalPrice: { $sum: "$totalPrice" },
                  count: { $sum: 1 },
              },
          }, {
              $sort: { _id: 1 }
          }
      ])
      todayDate = moment(todayDate).format('YYYY-MM-DD')
        DaysAgo = moment(DaysAgo).format('YYYY-MM-DD')
      res.render('salesreport',{saleReport,todayDate,DaysAgo})
    }
    catch(err){
      err.admin = true;
      next(err);
    }
  }

  const salesProject= async (req, res, next) => {
    try {
        let start = new Date(req.query.from)
        let end = new Date(req.query.to)
        let {filter,orderStatus,donutchart} = req.query 
        let saleReport
        console.log(req.query.from,req.query.to,filter)
        if(orderStatus){
          saleReport = await order.aggregate([
            {
                $group: {
                    _id:  "$orderStatus",
                    count: { $sum: 1 },
                },
            }, { $sort: { _id: 1 } }
        ])
    }
     else if(donutchart){
      saleReport = await order.aggregate([
        {
            $group: {
                _id:  "$Payment",
                count: { $sum: 1 },
            },
        }, { $sort: { _id: 1 } }
    ])
}
        else{
       saleReport = await order.aggregate([
            { $match: { "$and":[
              { createdAt: { $gte: start, $lte: end } },
              { orderStatus: "delivered" }
          ]} },
            {
                $group: {
                    _id: { $dateToString: { format: filter, date: "$createdAt" } },
                    totalPrice: { $sum: "$totalPrice" },
                    count: { $sum: 1 },
                },
            }, { $sort: { _id: 1 } }
        ])
        if(filter=="%m-%Y"||filter=="%m"){
        const months = [
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
          "August",
          "September",
          "October",
          "November",
          "December",
      ];
       saleReport = saleReport.map((el) => {
          const newOne = { ...el };
          console.log(newOne);
          let id = newOne._id.slice(0, 2)
          if(id<10){
           id = newOne._id.slice(1, 2)}
          console.log(id )
          if(filter=="%m-%Y")
          newOne._id = months[id-1]+' '+newOne._id.slice(3);
          else
          newOne._id = months[id-1]

          return newOne;
      })
    }
    if(filter=="%U-%Y"){
      saleReport = saleReport.map((el) => {
        const newOne = { ...el };
        newOne._id = "week".concat(" ", newOne._id);
        return newOne;
      }) 
    }
  }
        res.json({ saleReport: saleReport })
    }
     catch(err){
      err.admin = true;
      next(err);
     }
}

const logout = (req, res) => {
  try { 
    req.session.adminlogin=false
    res.redirect("/admin") 
  } catch (error) {
    err.admin = true;
        next(err);
  }
  
}; 
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
  paymentAction,
  getBanner,
  editbannerSubmit,
  salesReport,
  salesProject,
  logout,
  
};
