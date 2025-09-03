const Pay = require("../controllers/Pay");
const Journal = require("../controllers/journal");
const Click = require("../controllers/click");
const express = require("express");
const {protect, authorize} = require("../middlewares/auth");
const router = express.Router();

router.post("/payme", Pay.payme);
router.get(
  "/paylist",
  protect,
  authorize("publisher", "admin"),
  Journal.paylist
);
router.get("/user/last/:id", Journal.UserLastTrans);
router.post(
  "/journal/create",
  protect,
  authorize("publisher", "admin"),
  Journal.create
);
router.post("/click/prepare", Click.clickPrepare);
router.post("/click/complete", Click.clickComplete);

module.exports = router;
