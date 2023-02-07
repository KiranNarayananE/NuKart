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
var app = express();
const hbs= require ("hbs")


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


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
hbs.registerHelper("equal", require("./middleware/equal.js"))


app.use('/', userRouter);
app.use('/admin', adminRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
