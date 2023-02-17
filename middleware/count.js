const mongoose = require("mongoose");
const {
    cart,
    wishList,
  } = require("../model/user")



const wishlistCount = (req, res, next) => {
    if (req.session.loginuser) {
        wishList.find({ userId: req.session.userId}).then((data) => {
            if (data) {
                if (data[0].wishList.length > 0) {
                    let lengths = data[0].wishList.length;
                    res.locals.wishlistCount = lengths;
                    next();
                } else {
                    res.locals.wishlistCount = 0;
                    next();
                }
            } else {
                res.locals.wishlistCount = 0;
                next();
            }
        });
    } else {
        res.locals.wishlistCount = 0;
        next();
    }
};

const cartCount = (req, res, next) => {
    
    if (req.session.loginuser) {
        cart.findOne({ userId: req.session.userId }).populate("item.productId").then((data) => {
            if (data) {
                res.locals.cart_limit=data
                if (data.item.length > 0) {
                    let lengths = data.item.length;
                    res.locals.cartCount = lengths;
                    next();
                } else {
                    res.locals.cartCount = 0;
                    next();
                }
            } else {
                res.locals.cartCount = 0;
                next();
            }
        });
    } else {
        res.locals.cartCount = 0;
        next();
    }
};

module.exports = { cartCount, wishlistCount }
