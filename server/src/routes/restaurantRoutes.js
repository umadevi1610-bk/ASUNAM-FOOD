const express = require("express");

const {
  createRestaurant,
  getRestaurants,
  getRestaurantById,
} = require("../controllers/restaurantController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Create restaurant - login required
router.post("/", protect, createRestaurant);

// Get all restaurants
router.get("/", getRestaurants);

// Get single restaurant
router.get("/:id", getRestaurantById);

module.exports = router;