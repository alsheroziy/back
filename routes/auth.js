const express = require("express");
const {
  register,
  login,
  getMe,
  forgotPassword,
  resetPassword,
  UpdateDetails,
  UpdatePassword,
  registerCheck,
  loginTest,
  registerTest,
  me,
  registerEmail,
  getAuths,
  deleteUser,
  getCaptcha,
  getRandomAuth,
  refreshToken,
} = require("../controllers/auth");
const {protect, authorize} = require("../middlewares/auth");

const router = express.Router();
router.post("/register", register);
router.post("/all", protect, authorize("admin", "publisher"), getAuths);
router.get("/random", protect, authorize("admin", "publisher"), getRandomAuth);
router.post("/register/email", registerEmail);
router.post("/test/check", registerCheck);
router.post("/test/register", registerTest);
router.post("/test/login", loginTest);
router.get("/test/me", me);
router.post("/login", login);
router.get("/me", protect, getMe);
router.put(
  "/updatedetails",
  protect,
  authorize("admin", "publisher"),
  UpdateDetails
);
router.put("/updatepassword", protect, UpdatePassword);
router.post(
  "/forgotpassword",
  protect,
  authorize("admin", "publisher"),
  forgotPassword
);
router.put(
  "/resetpassword/:resetToken",
  protect,
  authorize("admin", "publisher"),
  resetPassword
);
router.delete(
  "/delete/:id",
  protect,
  // authorize("admin", "publisher"),
  deleteUser
);
router.get("/captcha", getCaptcha);

router.post("/refresh-token", refreshToken);
module.exports = router;
