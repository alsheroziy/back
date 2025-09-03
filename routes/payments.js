const express = require("express");
const router = express.Router();
const Payments = require("../controllers/Payments");
const {protect, authorize} = require("../middlewares/auth");

router.post(
  "/create",
  protect,
  authorize("publisher", "admin"),
  Payments.create
);
router.post("/get", Payments.getAdmin);
router.get("/get/all", Payments.getAll);
router.put(
  "/edit/:id",
  protect,
  authorize("publisher", "admin"),
  Payments.edit
);
router.delete(
  "/delete/:id",
  protect,
  authorize("publisher", "admin"),
  Payments.delete
);

module.exports = router;
