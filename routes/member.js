const express = require("express");
const {
  allMembers,
  addMember,
  editMember,
  deleteMember,
  editPoster,
  getMemberId,
  allMemberr,
} = require("../controllers/members");
const router = express.Router();
const {protect, authorize} = require("../middlewares/auth");
const multer = require("multer");
const path = require("path");
const md5 = require("md5");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/uploads/members");
  },
  filename: function (req, file, cb) {
    cb(null, `${md5(Date.now())}${path.extname(file.originalname)}`);
  },
});
const upload = multer({storage: storage});
router
  .route("/")
  .get(allMembers)
  .post(
    protect,
    authorize("publisher", "admin"),
    upload.single("file"),
    addMember
  );

router.get("/all", protect, authorize("publisher", "admin"), allMemberr);
router.put("/:id", protect, authorize("admin"), editMember);
router.get("/:id", protect, authorize("admin"), getMemberId);
router.delete("/:id", protect, authorize("admin"), deleteMember);

// edit image
router.put("/:id/image", upload.single("file"), editPoster);

module.exports = router;
