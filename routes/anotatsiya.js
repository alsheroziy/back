const express = require("express");
const router = express.Router();
const {
    add,
    deleteById,
    update,
    getAll,
    getOne,
    getHome,
} = require("../controllers/anotatsiya");
const { protect, authorize } = require("../middlewares/auth");
router.get("/home", getHome);
router.post("/add", protect, authorize("admin", "publisher"), add);
router.get("/all", protect, authorize("admin", "publisher"), getAll);
router.get("/:id", protect, authorize("admin", "publisher"), getOne);
router.put("/:id", protect, authorize("admin", "publisher"), update);
router.delete("/:id", protect, authorize("admin", "publisher"), deleteById);

module.exports = router;