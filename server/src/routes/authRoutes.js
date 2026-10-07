const express = require("express");

const {
  registerUser,
  loginUser,
  customerLogin,
  getCurrentUser,
} = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// ===============================
// REGISTER
// ===============================
router.post("/register", registerUser);

// ===============================
// OLD EMAIL + PASSWORD LOGIN
// ===============================
router.post("/login", loginUser);

// ===============================
// TEMP CUSTOMER LOGIN
// NAME + PHONE
// OTP WILL BE ADDED LATER
// ===============================
router.post("/customer-login", customerLogin);

// ===============================
// CURRENT LOGGED-IN USER
// ===============================
router.get("/me", protect, getCurrentUser);

module.exports = router;