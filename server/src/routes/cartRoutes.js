const express = require("express");

const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} = require("../controllers/cartController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, getCart);

router.post("/add", protect, addToCart);

router.put("/update", protect, updateCartItem);

router.delete("/remove/:foodId", protect, removeFromCart);

router.delete("/clear", protect, clearCart);

module.exports = router;