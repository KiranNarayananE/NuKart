const mongoose = require('mongoose');
require("dotenv/config")
mongoose.set('strictQuery', false)
// const url='mongodb://127.0.0.1:27017/NuKart'
 const url =process.env.url

mongoose.connect(url, { useNewUrlParser: true })
  .then(() => console.log("database connected"))
  .catch((err) => console.log(err));



