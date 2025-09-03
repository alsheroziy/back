const express = require("express");
const {
  writeComment,
  deleteComment,
  allComments,
  editStatus,
  clickLike,
} = require("../controllers/comment");
const router = express.Router({mergeParams: true});
const {protect, authorize} = require("../middlewares/auth");

//router.route('/').post(protect ,  writeComment);

router.route("/add").post(protect, writeComment);
router.get("/all", allComments);
router.post("/click/like", clickLike);
router
  .route("/:id")
  .put(protect, authorize("admin", "publisher"), editStatus)
  .delete(protect, authorize("admin", "publisher"), deleteComment);

module.exports = router;
