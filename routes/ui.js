const express = require("express");
const router = express.Router();
const {
  index,
  dashboard,
  filter,
  getBy,
} = require("../controllers/IndexController");
const {protect, authorize} = require("../middlewares/auth");

router.get("/", index);
router.get("/all", getBy);
router.get("/dashboard", protect, authorize("publisher", "admin"), dashboard);
router.get("/filter", filter);

module.exports = router;
