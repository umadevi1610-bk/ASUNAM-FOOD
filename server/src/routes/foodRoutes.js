const express = require("express");

const {
  createFood,
  getFoods,
  getFoodById,
} = require("../controllers/foodController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Create food - login required
router.post("/", protect, createFood);

// Get all foods
router.get("/", getFoods);

// Get single food
router.get("/:id", getFoodById);

module.exports = router;