var express = require("express");
var router = express.Router();
const {
  home,
  login,
  enterOtp,
  enterPhone,
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
} = require("../controller/user");

/* GET users page. */
router.get("/", home);

router.get("/login", login);

router.post("/login",loginPost);

router.get("/verifyphone", enterPhone);

router.post("/verifyphone", enterOtp);

router.post("/otpverify", verifyOtp);

router.post("/signup", signup);

router.get("/shop", shop)
router.get('/category',categories )
router.get("/logout", logout)
router.get("/product/:id", productDetail)
router.get("/profile",profile )
router.get("/address",address )
router.post("/address",addAddress)
router.post("/cart/:id",addToCart)
router.get("/cart",viewCart)
router.post("/checkout/:id",checkOut)
router.post("/checkout",cartCheckout)
router.get("/wishList",viewWishList)
router.post("/wishList/:productId",addToWishList)
router.post("/coupon",applyCoupon)


module.exports = router;
