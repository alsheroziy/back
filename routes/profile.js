const express = require("express");
const router = express.Router();
const Profile = require("../controllers/Profile");

const multer = require("multer");
const md5 = require("md5");
const path = require("path");
const {protect, authorize} = require("../middlewares/auth");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/uploads/avatar");
  },
  filename: function (req, file, cb) {
    cb(null, `${md5(Date.now())}.jpg`);
  },
});
const upload = multer({storage: storage});

router.put("/update", protect, Profile.update);
router.post("/follow", protect, Profile.follow);
router.post("/dev", Profile.dev);

// Update image in user
router.route("/upload").post(upload.single("photo"), Profile.photo);

module.exports = router;
