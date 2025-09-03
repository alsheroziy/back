const express = require("express");
const {
  getJanrs,
  getJanr,
  createJanr,
  deleteJanr,
  updateJanr,
  getByJanr,
  getYear,
  getAdmin,
} = require("../controllers/janr");

// Include other resource routers
const productRouter = require("./products");

const router = express.Router();

// Re-route into other resource routers
router.use("/:janrId/products", productRouter);

const {protect, authorize} = require("../middlewares/auth");

router.get("/admin", protect, authorize("admin", "publisher"), getAdmin);
router
  .route("/")
  .get(getJanrs)
  .post(protect, authorize("publisher", "admin"), createJanr);
router.get("/sort/:id", getByJanr);
router.get("/year", getYear);
router
  .route("/:janrId")
  .get(getJanr)
  .put(protect, authorize("admin"), updateJanr)
  .delete(protect, authorize("admin"), deleteJanr);

module.exports = router;
