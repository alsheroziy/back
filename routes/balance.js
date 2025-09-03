const express = require("express");
const router = express.Router();
const {
  addBalance,
  getBalances,
  deleteBalalnces,
} = require("../controllers/balance");

const {protect, authorize} = require("../middlewares/auth");

router
  .route("/")
  .post(protect, addBalance)
  .get(/* protect,authorize('admin'), */ getBalances);

module.exports = router;
