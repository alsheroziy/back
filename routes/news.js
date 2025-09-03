const express = require("express");
const router = express.Router();
const {protect, authorize} = require("../middlewares/auth");
const {
  addNews,
  getById,
  getAll,
  deleteNews,
  edit,
  getHome,
} = require("../controllers/newsController");
const multer = require("multer");
const path = require("path");
const md5 = require("md5");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/uploads/cinema");
  },
  filename: function (req, file, cb) {
    cb(null, `${md5(Date.now())}${path.extname(file.originalname)}`);
  },
});
const upload = multer({storage: storage});

router.post(
  "/add",
  protect,
  authorize("publisher", "admin"),
  upload.single("image"),
  addNews
);
router.get("/all", getAll);
router.get("/home", getHome);
router.put("/:id", protect, authorize("publisher", "admin"), edit);
router.get("/:id", getById);
router.delete("/:id", protect, authorize("publisher", "admin"), deleteNews);

module.exports = router;
