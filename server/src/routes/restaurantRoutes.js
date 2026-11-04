const express = require("express");

const {
  createRestaurant,
  getRestaurants,
  getRestaurantById,
  getMyRestaurant,
  getRestaurantOrders,
  updateRestaurantOrderStatus,
  updateMyRestaurant,
} = require("../controllers/restaurantController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// CREATE RESTAURANT
router.post("/", protect, createRestaurant);

// GET ALL RESTAURANTS
router.get("/", getRestaurants);

// GET LOGGED-IN RESTAURANT
router.get("/mine", protect, getMyRestaurant);

// UPDATE LOGGED-IN RESTAURANT PROFILE
router.patch("/mine", protect, updateMyRestaurant);

// GET LOGGED-IN RESTAURANT ORDERS
router.get("/mine/orders", protect, getRestaurantOrders);

// UPDATE RESTAURANT ORDER STATUS
router.patch(
  "/mine/orders/:orderId/status",
  protect,
  updateRestaurantOrderStatus
);

// GET SINGLE RESTAURANT
router.get("/:id", getRestaurantById);

module.exports = router;