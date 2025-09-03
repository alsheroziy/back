const express = require("express");
const router = express.Router({mergeParams: true});
const {protect, authorize} = require("../middlewares/auth");

const {
  //Season
  addSeason,
  getAllSeason,
  getByIdSeason,
  deleteSeason,
  updateSeason,
  getByAdminId,

  // Seriya
  addSeriya,
  updateSeriya,
  deleteSeriya,
  getAdmin,
  getByAdminSeriya,
  getSeriaOne,
  getHome,
  filter,
  search,
} = require("../controllers/season");

// Season Router
router.get("/all", getAllSeason);
router.post("/admin", protect, authorize("publisher", "admin"), getAdmin);
router.get("/search", search);
router.get("/v2/:id", getByIdSeason);
router.post("/home", getHome);
router.post("/filter", filter);
router.post("/add", protect, authorize("publisher", "admin"), addSeason);
router.get(
  "/admin/:id",
  protect,
  authorize("publisher", "admin"),
  getByAdminId
);
router.delete("/:id", protect, authorize("admin"), deleteSeason);
router.put("/:id", protect, authorize("admin"), updateSeason);
// protect, authorize("admin"),
// protect, authorize("admin"),
// protect, authorize("admin"),
// Seriya Router
router.get("/seriya/:id", getByAdminSeriya);
router.get("/seriya/one/:id", getSeriaOne);
router.post("/seriya/add", protect, authorize("publisher", "admin"), addSeriya);
router.put(
  "/seriya/:id",
  protect,
  authorize("publisher", "admin"),
  updateSeriya
);
router.delete(
  "/seriya/:id",
  protect,
  authorize("publisher", "admin"),
  deleteSeriya
);
module.exports = router;
