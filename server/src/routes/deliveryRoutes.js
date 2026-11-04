
const express = require("express");

const {
  getAvailableOrders,
  getMyDeliveries,
  acceptDeliveryOrder,
  updateDeliveryStatus,
} = require("../controllers/deliveryController");

const {
  getMyDeliveryProfile,
  saveMyDeliveryProfile,
} = require("../controllers/deliveryProfileController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// All delivery routes require authentication.
router.use(protect);

// ======================================
// DELIVERY PARTNER PROFILE
// ======================================

// Get my delivery profile
router.get("/profile", getMyDeliveryProfile);

// Create or update my delivery profile
router.put("/profile", saveMyDeliveryProfile);

// ======================================
// AVAILABLE ORDERS
// ======================================
router.get("/available", getAvailableOrders);

// ======================================
// MY DELIVERIES
// ======================================
router.get("/mine", getMyDeliveries);

// ======================================
// ACCEPT AN ORDER
// ======================================
router.post(
  "/orders/:orderId/accept",
  acceptDeliveryOrder
);

// ======================================
// UPDATE DELIVERY STATUS
// ======================================
router.patch(
  "/:deliveryId/status",
  updateDeliveryStatus
);

module.exports = router;
