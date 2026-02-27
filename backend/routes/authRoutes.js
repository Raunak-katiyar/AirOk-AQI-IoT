const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

const { body } = require("express-validator");
const validate = require("../middleware/validationMiddleware");
const asyncHandler = require("../middleware/asyncHandler");
const { authLimiter } = require("../middleware/rateLimiter");

const { protect, authorize } = require("../middleware/authMiddleware");


// ==========================
// 🔐 REGISTER (Super Admin Only)
// ==========================
router.post(
  "/register",

  protect,
  authorize(["super_admin"]),   // Only super_admin can create users

  authLimiter,

  body("email")
    .isEmail()
    .withMessage("Valid email required"),

  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),

  validate,

  asyncHandler(authController.register)
);


// ==========================
// 🔐 LOGIN (Public)
// ==========================
router.post(
  "/login",

  authLimiter,

  body("email")
    .isEmail()
    .withMessage("Valid email required"),

  body("password")
    .notEmpty()
    .withMessage("Password is required"),

  validate,

  asyncHandler(authController.login)
);

module.exports = router;