const express = require("express");
const router = express.Router({mergeParams: true});
const {protect, authorize} = require("../middlewares/auth");
const {
  addCinema,
  getAll,
  filterByType,
  getById,
  deleteById,
  updateById,
  sortByCat,
  editPoster,
  editScreens,
  getAdmin,
} = require("../controllers/kino");
const multer = require("multer");
const md5 = require("md5");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/uploads/cinema/org");
  },
  filename: function (req, file, cb) {
    cb(null, `${md5(Date.now())}${path.extname(file.originalname)}`);
  },
});
const upload = multer({storage: storage});

router.post("/add", protect, authorize("publisher", "admin"), addCinema);
router.get("/all", getAll);
router.get("/admin", getAdmin);
router.get("/sort", sortByCat);
router.get("/:id", getById);

router.delete("/:id", protect, authorize("publisher", "admin"), deleteById);
router.put("/:id", protect, authorize("publisher", "admin"), updateById);

module.exports = router;
