const express = require("express");

const {
  createFood,
  getFoods,
  getFoodById,
  updateFood,
  deleteFood,
} = require("../controllers/foodController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Create food — restaurant owner login required
router.post("/", protect, createFood);

// Get foods — public
router.get("/", getFoods);

// Get one food — public
router.get("/:id", getFoodById);

// Edit food — restaurant owner login required
router.patch("/:id", protect, updateFood);

// Delete food — restaurant owner login required
router.delete("/:id", protect, deleteFood);

module.exports = router;