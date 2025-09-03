const express = require("express");
const {
  addSlider,
  getSlidersForAdminPage,
  deleteSlider,
  getClient,
} = require("../controllers/slider");

const router = express.Router();
const {protect, authorize} = require("../middlewares/auth");

router.post("/add", protect, authorize("admin", "publisher"), addSlider);
router.get(
  "/admin",
  protect,
  authorize("publisher", "admin"),
  getSlidersForAdminPage
); // For Admin
router.get("/client", getClient); // For Admin
router.delete("/:id", protect, authorize("publisher", "admin"), deleteSlider);

module.exports = router;
