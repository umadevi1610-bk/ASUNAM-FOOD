const mongoose = require("mongoose");
const Restaurant = require("../models/Restaurant");
const Order = require("../models/Order");

// ======================================
// NORMALIZE RESTAURANT ADDRESS
// Model expects an address object
// ======================================
const normalizeAddress = (value, currentAddress = {}) => {
  const current = currentAddress || {};

  // Profile form may send address as a string.
  if (typeof value === "string") {
    return {
      street: value.trim(),
      city: current.city || "",
      state: current.state || "",
      pincode: current.pincode || "",
      latitude: current.latitude ?? null,
      longitude: current.longitude ?? null,
    };
  }

  // API may also send an address object.
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const latitude =
      value.latitude === ""
        ? null
        : value.latitude ?? current.latitude ?? null;

    const longitude =
      value.longitude === ""
        ? null
        : value.longitude ?? current.longitude ?? null;

    return {
      street: String(value.street ?? current.street ?? "").trim(),
      city: String(value.city ?? current.city ?? "").trim(),
      state: String(value.state ?? current.state ?? "").trim(),
      pincode: String(value.pincode ?? current.pincode ?? "").trim(),
      latitude,
      longitude,
    };
  }

  if (value == null) {
    return value;
  }

  throw new Error("Invalid restaurant address format");
};

// ======================================
// NORMALIZE CUISINE
// Model expects an array of strings
// ======================================
const normalizeCuisine = (value) => {
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item).trim())
      .filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  if (value == null) {
    return [];
  }

  throw new Error("Invalid restaurant cuisine format");
};

// ======================================
// CREATE RESTAURANT
// ======================================
const createRestaurant = async (req, res) => {
  try {
    const {
      name,
      description,
      image,
      phone,
      email,
      address,
      cuisine,
      openingTime,
      closingTime,
      deliveryFee,
      minimumOrderAmount,
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Restaurant name is required",
      });
    }

    const existingRestaurant = await Restaurant.findOne({
      owner: req.user.userId,
    });

    if (existingRestaurant) {
      return res.status(409).json({
        success: false,
        message: "You already have a restaurant",
      });
    }

    const restaurant = await Restaurant.create({
      owner: req.user.userId,
      name: name.trim(),
      description,
      image,
      phone,
      email,
      address:
        address == null
          ? undefined
          : normalizeAddress(address),
      cuisine:
        cuisine == null
          ? undefined
          : normalizeCuisine(cuisine),
      openingTime,
      closingTime,
      deliveryFee,
      minimumOrderAmount,
    });

    return res.status(201).json({
      success: true,
      message: "Restaurant created successfully",
      restaurant,
    });
  } catch (error) {
    console.error("Create restaurant error:", error.message);

    if (
      error.name === "ValidationError" ||
      error.name === "CastError" ||
      error instanceof TypeError ||
      error.message === "Invalid restaurant address format" ||
      error.message === "Invalid restaurant cuisine format"
    ) {
      return res.status(400).json({
        success: false,
        message: "Please check the restaurant details",
        error: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create restaurant",
      error: error.message,
    });
  }
};

// ======================================
// GET ALL RESTAURANTS
// ======================================
const getRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.find({
      isActive: true,
    }).populate("owner", "name email phone");

    return res.status(200).json({
      success: true,
      count: restaurants.length,
      restaurants,
    });
  } catch (error) {
    console.error("Get restaurants error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to get restaurants",
      error: error.message,
    });
  }
};

// ======================================
// GET SINGLE RESTAURANT
// ======================================
const getRestaurantById = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(
      req.params.id
    ).populate("owner", "name email phone");

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    return res.status(200).json({
      success: true,
      restaurant,
    });
  } catch (error) {
    console.error("Get restaurant error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to get restaurant",
      error: error.message,
    });
  }
};

// ======================================
// GET LOGGED-IN RESTAURANT
// ======================================
const getMyRestaurant = async (req, res) => {
  try {
    if (
      req.user.role &&
      req.user.role !== "restaurant"
    ) {
      return res.status(403).json({
        success: false,
        message: "Restaurant access required",
      });
    }

    const restaurant = await Restaurant.findOne({
      owner: req.user.userId,
    }).populate("owner", "name email phone");

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message:
          "No restaurant is linked to this partner account",
      });
    }

    return res.status(200).json({
      success: true,
      restaurant,
    });
  } catch (error) {
    console.error("Get my restaurant error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to get your restaurant",
      error: error.message,
    });
  }
};

// ======================================
// GET RESTAURANT ORDERS
// LOGGED-IN RESTAURANT ONLY
// ======================================
const getRestaurantOrders = async (req, res) => {
  try {
    if (
      req.user.role &&
      req.user.role !== "restaurant"
    ) {
      return res.status(403).json({
        success: false,
        message: "Restaurant access required",
      });
    }

    const restaurant = await Restaurant.findOne({
      owner: req.user.userId,
    });

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message:
          "No restaurant is linked to this partner account",
      });
    }

    const orders = await Order.find({
      restaurant: restaurant._id,
    })
      .populate("customer", "name phone email")
      .populate("deliveryPartner", "name phone")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: orders.length,
      restaurant: {
        id: restaurant._id,
        name: restaurant.name,
      },
      orders,
    });
  } catch (error) {
    console.error(
      "Get restaurant orders error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Failed to get restaurant orders",
      error: error.message,
    });
  }
};

// ======================================
// UPDATE RESTAURANT ORDER STATUS
// ACCEPT / REJECT / PREPARING / READY
// ======================================
const updateRestaurantOrderStatus = async (
  req,
  res
) => {
  try {
    const { status, reason } = req.body;

    // Validate order ID
    if (!mongoose.isValidObjectId(req.params.orderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    // Validate requested status
    const allowedStatuses = [
      "restaurant_accepted",
      "rejected",
      "preparing",
      "ready_for_pickup",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid restaurant order status",
      });
    }

    // Find logged-in restaurant
    const restaurant = await Restaurant.findOne({
      owner: req.user.userId,
    });

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message:
          "No restaurant is linked to this partner account",
      });
    }

    // Find order belonging to this restaurant
    const order = await Order.findOne({
      _id: req.params.orderId,
      restaurant: restaurant._id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found for this restaurant",
      });
    }

    // Validate status transition
    const allowedTransitions = {
      placed: ["restaurant_accepted", "rejected"],
      restaurant_accepted: ["preparing"],
      preparing: ["ready_for_pickup"],
    };

    const nextStatuses =
      allowedTransitions[order.orderStatus] || [];

    if (!nextStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message:
          `Cannot change order from "${order.orderStatus}" to "${status}"`,
      });
    }

    // Update order status and timestamp
    const now = new Date();

    order.orderStatus = status;

    if (status === "restaurant_accepted") {
      order.restaurantAcceptedAt = now;
    }

    if (status === "preparing") {
      order.preparingAt = now;
    }

    if (status === "ready_for_pickup") {
      order.readyAt = now;
    }

    if (status === "rejected") {
      order.cancellationReason =
        typeof reason === "string" && reason.trim()
          ? reason.trim().slice(0, 300)
          : "Rejected by restaurant";
    }

    await order.save();

    // Return updated order
    const updatedOrder = await Order.findById(order._id)
      .populate("customer", "name phone email")
      .populate("deliveryPartner", "name phone");

    return res.status(200).json({
      success: true,
      message: `Order status updated to ${status}`,
      order: updatedOrder,
    });
  } catch (error) {
    console.error(
      "Update restaurant order status error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Failed to update order status",
      error: error.message,
    });
  }
};

// ======================================
// UPDATE LOGGED-IN RESTAURANT PROFILE
// ======================================
const updateMyRestaurant = async (req, res) => {
  try {
    if (
      req.user.role &&
      req.user.role !== "restaurant"
    ) {
      return res.status(403).json({
        success: false,
        message: "Restaurant access required",
      });
    }

    const restaurant = await Restaurant.findOne({
      owner: req.user.userId,
    });

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message:
          "No restaurant is linked to this partner account",
      });
    }

    // Only allow these profile fields to be updated.
    const allowedFields = [
      "name",
      "description",
      "image",
      "phone",
      "email",
      "address",
      "cuisine",
      "openingTime",
      "closingTime",
      "deliveryFee",
      "minimumOrderAmount",
      "isOpen",
    ];

    let hasUpdates = false;

    for (const field of allowedFields) {
      if (
        !Object.prototype.hasOwnProperty.call(
          req.body,
          field
        )
      ) {
        continue;
      }

      const value = req.body[field];

      // Address must be stored as an object.
      if (field === "address") {
        restaurant.address = normalizeAddress(
          value,
          restaurant.address
        );
      }

      // Cuisine must be stored as an array.
      else if (field === "cuisine") {
        restaurant.cuisine = normalizeCuisine(value);
      }

      // Update normal fields.
      else {
        restaurant[field] = value;
      }

      hasUpdates = true;
    }

    if (!hasUpdates) {
      return res.status(400).json({
        success: false,
        message: "No profile details were provided",
      });
    }

    await restaurant.save();

    return res.status(200).json({
      success: true,
      message: "Restaurant profile updated successfully",
      restaurant,
    });
  } catch (error) {
    console.error(
      "Update restaurant profile error:",
      error.message
    );

    if (
      error.name === "ValidationError" ||
      error.name === "CastError" ||
      error.message === "Invalid restaurant address format" ||
      error.message === "Invalid restaurant cuisine format"
    ) {
      return res.status(400).json({
        success: false,
        message: "Please check the profile details",
        error: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update restaurant profile",
      error: error.message,
    });
  }
};

// ======================================
// EXPORTS
// ======================================
module.exports = {
  createRestaurant,
  getRestaurants,
  getRestaurantById,
  getMyRestaurant,
  getRestaurantOrders,
  updateRestaurantOrderStatus,
  updateMyRestaurant,
};