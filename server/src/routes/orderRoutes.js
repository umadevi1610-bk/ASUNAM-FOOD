const express = require("express");

const {
  createOrder,
  getMyOrders,
  getOrderById,
} = require("../controllers/orderController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Create new order
router.post("/", protect, createOrder);

// Get logged-in customer's orders
router.get("/", protect, getMyOrders);

// Get single order
router.get("/:id", protect, getOrderById);

module.exports = router;