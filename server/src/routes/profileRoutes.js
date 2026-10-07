const express = require("express");

const {
  getProfile,
  updateProfile,
} = require("../controllers/profileController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Get logged-in user's profile
router.get("/", protect, getProfile);

// Update logged-in user's profile
router.put("/", protect, updateProfile);

module.exports = router;