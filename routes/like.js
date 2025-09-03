const express = require("express");
const Like = require("../controllers/LikeController.js");

const router = express.Router();

router.post("/create", Like.create);
router.get("/me", Like.me);
router.delete("/:id", Like.delete);

module.exports = router;