const express = require("express");
const Extra = require("../controllers/extra");
const router = express.Router();
const {protect, authorize} = require("../middlewares/auth");

router.post("/mobile/version", Extra.createVersion);
router.put("/mobile/version/:name", Extra.updateVersion);
router.get("/mobile/version/:name", Extra.getVersion);

router.delete("/mobile/version/:name", Extra.deleteVersion);
router.post("/namoz", Extra.namoz);
router.get("/log/index", Extra.getLogs);

module.exports = router;
