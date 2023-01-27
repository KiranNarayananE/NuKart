var express = require('express');
var router = express.Router();
var ifAdmin=require("../middleware/session")
const multer = require("../middleware/multer")
const path = require('path')
const { login ,
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
  logout
} = require("../controller/admin");

/* GET admin listing. */

router.get('/',login );
router.post('/',home )
router.get('/category',ifAdmin,categories )

router.get('/add_category' ,ifAdmin,addCategory )
router.post("/add_category", ifAdmin, submitAddCategory);
router.get('/product', ifAdmin,products )

router.get('/add_product' ,ifAdmin,addProduct )
router.post('/add_product', ifAdmin,multer.array("myFiles", 4),submitAddProduct)
router.get('/user', ifAdmin,users)
router.delete("/user/:id" ,ifAdmin, deleteUser)
router.patch("/block_user/:id" ,ifAdmin, blockUser)
router.delete("/category/:id", ifAdmin, deleteCategory)
router.delete("/product/:id" ,ifAdmin, deleteProduct)
router.get("/edit_product/:id" ,ifAdmin, editProduct)
router.put("/product/:id" ,ifAdmin,multer.array("myFiles", 4), editProductSubmit)
router.get("/product_category/:id", ifAdmin, productCategory)
router.get("/create_coupon" ,ifAdmin, createCoupon)
router.post("/create_coupon" ,ifAdmin, postCreateCoupon)
router.delete("/coupon/:id" ,ifAdmin, deleteCoupon)
router.get("/coupon" ,ifAdmin, viewCoupon)
router.get('/logout',logout)








module.exports = router;
