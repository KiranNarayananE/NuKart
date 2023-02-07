var express = require("express");
var router = express.Router();
var {ifUserAxios,ifUser}=require("../middleware/session")
const {
  home,
  login,
  enterOtp,
  enterPhone,
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
} = require("../controller/user");

/* GET users page. */
router.get("/", home);

router.get("/login", login);
router.post("/login",loginPost);

router.get("/verifyphone", enterPhone);
router.post("/verifyphone", enterOtp);

router.post("/otpverify", verifyOtp);
router.get("/signup", viewSignup)
router.post("/signup", signup);

router.get("/password", passwordView)
router.patch("/password", passwordVerify)

router.get("/shop", shop)
router.post("/search",search)

router.get('/category',categories)

router.get("/product/:id", productDetail)

router.post("/cart",ifUserAxios,addToCart)
router.get("/cart",ifUser,viewCart)
router.patch("/cart",ifUserAxios,cartEdit)

router.post("/checkout",ifUser,cartCheckout)
router.post("/verifyPayment",ifUser,verifyPayment)

router.get("/wishList",ifUser,viewWishList)
router.post("/wishList/:productId",ifUserAxios,addToWishList)

router.post("/coupon",ifUserAxios,applyCoupon)

router.post("/order",ifUserAxios,orderPost)

router.get("/profile",ifUser,profile )

router.get("/address",ifUser,address )
router.post("/address",ifUser,addAddress)
router.patch("/address",ifUserAxios,updateAddress)
router.delete("/address",ifUserAxios,deleteAddress)
router.get("/editAddress",ifUserAxios,getEditAddress)
 
router.get("/orders",ifUser,orderList)
router.patch("/orders",ifUserAxios,orderCancel)
router.get("/success",ifUserAxios,success)

router.get("/logout",ifUser, logout)
module.exports = router;
