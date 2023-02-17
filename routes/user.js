var express = require("express");
var router = express.Router();
const multer = require("../middleware/multer")
var {ifUserAxios,ifUser}=require("../middleware/session")
const {
  home,
  login,
  enterOtp,
  verifyOtp,

  signup,
  loginPost,

  passwordVerify,
  shop,
  search,
  categories,
  logout,
  productDetail,
  profile,
  editProfile,
  addToCart,
  viewCart,
  cartEdit,
  address,
  addAddress,
  getEditAddress,
  updateAddress,
  deleteAddress,
  getCheckout,
  cartCheckout,
  verifyPayment,
  addToWishList,
  viewWishList,
  applyCoupon,
  orderPost,
  orderList,
  orderCancel,

  success
} = require("../controller/user");

/* GET users page. */
router.get("/", home);

router.get("/login", login);
router.post("/login",loginPost);


router.post("/verifyphone", enterOtp);

router.post("/otpverify", verifyOtp);

router.post("/signup", signup);

router.patch("/password", passwordVerify)

router.get("/shop", shop)
router.get("/search",search)

router.get('/category',categories)

router.get("/product/:id", productDetail)

router.post("/cart",ifUserAxios,addToCart)
router.get("/cart",ifUser,viewCart)
router.patch("/cart",ifUserAxios,cartEdit)
router.get("/checkout",ifUser,getCheckout)
router.post("/checkout",ifUser,cartCheckout)
router.post("/verifyPayment",ifUserAxios,verifyPayment)

router.get("/wishList",ifUser,viewWishList)
router.post("/wishList/:productId",ifUserAxios,addToWishList)

router.post("/coupon",ifUserAxios,applyCoupon)

router.post("/order",ifUserAxios,orderPost)

router.get("/profile",ifUser,profile )
router.put("/profile",ifUserAxios,multer.array("myFiles", 4),editProfile )

router.get("/address",ifUser,address )
router.post("/address",ifUser,addAddress)
router.patch("/address",ifUserAxios,updateAddress)
router.delete("/address",ifUserAxios,deleteAddress)
router.get("/editAddress",ifUserAxios,getEditAddress)
 
router.get("/orders",ifUser,orderList)
router.patch("/orders",ifUserAxios,orderCancel)
router.get("/success",ifUser,success)

router.get("/logout",ifUser, logout)
module.exports = router;
