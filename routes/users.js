const multer = require("multer");
const md5 = require("md5");
const path = require("path");
const express = require("express");

const {
  getUser,
  getUsers,
  deleteUser,
  createUser,
  editUser,
  updateFile,
  search,
} = require("../controllers/users");
const router = express.Router();

const {protect, authorize} = require("../middlewares/auth");
//router.use(protect);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/uploads/avatar");
  },
  filename: function (req, file, cb) {
    cb(null, `${md5(Date.now())}.jpg`);
  },
});
const upload = multer({storage: storage});

router
  .route("/")
  .post(
    //protect,authorize('admin','publisher'),
    getUsers
  )
  .post(protect, authorize("publisher", "admin"), createUser);

router
  .route("/:id")
  .get(getUser)
  .put(protect, authorize("admin", "publisher"), editUser)
  .delete(protect, authorize("admin"), deleteUser);
// Update image in user
router
  .route("/upload")
  .post(
    upload.single("photo"),
    protect,
    authorize("publisher", "admin"),
    updateFile
  );
router.post("/search/:text", search);

module.exports = router;
