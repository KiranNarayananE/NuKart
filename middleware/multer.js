const multer = require("multer");
const fs = require('fs');
const path = require("path");


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      const uploadPath = './public/images/uploads';
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath);
      }
      cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
      },
    });
    var multipleupload = multer({ storage: storage })
    module.exports = multipleupload;