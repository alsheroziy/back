const express = require("express");
const router = express.Router();
const {
    checkTransaction,
    saveData,
    Events,
    checkOson,
    payOson,
    checkUser,
    PaymeUrl,
    checkApelsin,
    payApelsin,
    appLinkOson,
    payOsonAppLink,
} = require("../controllers/Payment");
const { protect, authorize } = require("../middlewares/auth");

router.post("/check", checkOson);
router.post("/pay", payOson);
router.post("/pay/applink", payOsonAppLink);
// router.get("/pay/oson", payOsonAppLink);
// oson applink  payOsonAppLink
router.post("/oson/applink", appLinkOson);
router.post("/check/:id", checkTransaction);

router.post("/check/paynet/:id", checkUser);
router.post("/create", saveData);
router.get("/all", Events);

// apelsin

router.post("/e-apelsin/info", checkApelsin);
router.post("/e-apelsin/pay", payApelsin);

//create payme url
router.post("/paymeurl", PaymeUrl);

module.exports = router;