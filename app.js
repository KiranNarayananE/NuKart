var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
require("dotenv/config")
var logger = require('morgan');
const session = require("express-session");
const nocache = require("nocache");
var userRouter = require('./routes/user');
var adminRouter = require('./routes/admin');
const db = require("./config/server");
const { err } = require("./middleware/error");
var app = express();
const hbs= require ("hbs")
const {equal,profit}  =require("./hbshelper/helper")
const { cartCount,wishlistCount } = require('./middleware/count');
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.use(
  session({
    secret: "sessionkey",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 600000000},
  })
);
app.use(nocache());

app.use((req, res, next) => {
  app.locals.session = req.session;
  next();
})


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
hbs.registerHelper("equal",equal)
hbs.registerHelper("profit",profit)
app.use(wishlistCount,cartCount)
app.use('/', userRouter);
app.use('/admin', adminRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  const error = new Error(`Not found ${req.originalUrl}`);
  if (req.originalUrl.startsWith("/admin")) {
      error.admin = true;
  }
  error.status = 404;
  next(error);
});

app.use(err);

module.exports = app;
