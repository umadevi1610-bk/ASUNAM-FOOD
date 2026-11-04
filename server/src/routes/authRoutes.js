
const express = require("express");

const {
  registerUser,
  registerRestaurantUser,
  registerDeliveryUser,
  loginUser,
  customerLogin,
  restaurantLogin,
  deliveryLogin,
  getCurrentUser,
} = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// ======================================
// CUSTOMER SIGN UP
// POST /api/auth/register
// ======================================
router.post("/register", registerUser);

// ======================================
// RESTAURANT PARTNER SIGN UP
// POST /api/auth/restaurant-register
// ======================================
router.post("/restaurant-register", registerRestaurantUser);

// ======================================
// DELIVERY PARTNER SIGN UP
// POST /api/auth/delivery-register
// ======================================
router.post("/delivery-register", registerDeliveryUser);

// ======================================
// NORMAL EMAIL + PASSWORD LOGIN
// ======================================
router.post("/login", loginUser);

// ======================================
// TEMPORARY CUSTOMER LOGIN
// NAME + PHONE
// ======================================
router.post("/customer-login", customerLogin);

// ======================================
// RESTAURANT PARTNER LOGIN
// ======================================
router.post("/restaurant-login", restaurantLogin);

// ======================================
// DELIVERY PARTNER LOGIN
// ======================================
router.post("/delivery-login", deliveryLogin);

// ======================================
// CURRENT LOGGED-IN USER
// ======================================
router.get("/me", protect, getCurrentUser);

module.exports = router;
