
const express = require("express");

const router = express.Router();

const {
  createReview,
  getRestaurantReviews,
  getFoodReviews,
  getOrderReviews,
} = require("../controllers/reviewController");

const { protect } = require("../middleware/authMiddleware");

// Customer submits a restaurant or food review.
router.post("/", protect, createReview);

// Public review lists.
router.get("/restaurant/:restaurantId", getRestaurantReviews);
router.get("/food/:foodId", getFoodReviews);

// Customer can see their own reviews for an order.
router.get("/order/:orderId", protect, getOrderReviews);

module.exports = router;
