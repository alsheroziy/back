const express = require("express");
const router = express.Router();
const {
  addPrices,
  getPrices,
  updatePrices,
  deletePrice,
  getById,
} = require("../controllers/priceList");
const {protect, authorize} = require("../middlewares/auth");

router.route("/").post(protect, authorize("admin"), addPrices).get(getPrices);

router.get("/:id", protect, authorize("admin"), getById);
router.put("/:id", protect, authorize("admin"), updatePrices);
router.delete("/:id", protect, authorize("admin"), deletePrice);
module.exports = router;
