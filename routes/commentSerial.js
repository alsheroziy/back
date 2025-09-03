const express = require("express");
const router = express.Router({mergeParams: true});
const seriyaComment = require("../controllers/commentSerial");
const {protect, authorize} = require("../middlewares/auth");

router.post("/add", protect, seriyaComment.addSeriyaComment);
router.get("/all", seriyaComment.GetCommnets);
router.get("/:id", seriyaComment.GetCommnet);
router.put(
  "/:id",
  protect,
  authorize("admin", "publisher"),
  seriyaComment.EditComment
);
router.delete(
  "/:id",
  protect,
  authorize("admin", "publisher"),
  seriyaComment.deleteSeriyaComment
);

module.exports = router;
