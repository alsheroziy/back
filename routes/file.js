const express = require("express");
const multer = require("multer");
const md5 = require("md5");
const path = require("path");
const router = express.Router();
const File = require("../controllers/File");
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./public/temp");
    },
    filename: function (req, file, cb) {
        cb(null, `${md5(Date.now())}${path.extname(file.originalname)}`);
    },
});
const upload = multer({ storage: storage });

router.post("/create", upload.single("image"), File.create);

module.exports = router;
