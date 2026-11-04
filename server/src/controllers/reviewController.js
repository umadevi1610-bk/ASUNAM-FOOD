
const mongoose = require("mongoose");

const Review = require("../models/Review");
const Order = require("../models/Order");
const Restaurant = require("../models/Restaurant");
const Food = require("../models/Food");

// ======================================
// UPDATE RESTAURANT RATING
// Only restaurant-level reviews are counted.
// ======================================

const updateRestaurantRating = async (restaurantId) => {
  const [result] = await Review.aggregate([
    {
      $match: {
        restaurant: new mongoose.Types.ObjectId(
          restaurantId.toString()
        ),
        food: null,
        isVisible: true,
      },
    },
    {
      $group: {
        _id: null,
        averageRating: { $avg: "$rating" },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  const rating = result
    ? Number(result.averageRating.toFixed(1))
    : 0;

  const totalReviews = result
    ? result.totalReviews
    : 0;

  await Restaurant.findByIdAndUpdate(restaurantId, {
    $set: {
      rating,
      totalReviews,
    },
  });

  return { rating, totalReviews };
};

// ======================================
// UPDATE FOOD RATING
// ======================================

const updateFoodRating = async (foodId) => {
  const [result] = await Review.aggregate([
    {
      $match: {
        food: new mongoose.Types.ObjectId(foodId.toString()),
        isVisible: true,
      },
    },
    {
      $group: {
        _id: null,
        averageRating: { $avg: "$rating" },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  const rating = result
    ? Number(result.averageRating.toFixed(1))
    : 0;

  const totalReviews = result
    ? result.totalReviews
    : 0;

  await Food.findByIdAndUpdate(foodId, {
    $set: {
      rating,
      totalReviews,
    },
  });

  return { rating, totalReviews };
};

// ======================================
// CREATE REVIEW
// POST /api/reviews
//
// Without foodId = restaurant review
// With foodId = individual food review
// ======================================

const createReview = async (req, res) => {
  try {
    const customerId =
  req.user?.userId || req.user?._id || req.user?.id;

    if (!customerId) {
      return res.status(401).json({
        success: false,
        message: "Please login to submit a review.",
      });
    }

    const {
      orderId,
      foodId,
      rating: rawRating,
      comment,
    } = req.body;

    const rating = Number(rawRating);

    if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        success: false,
        message: "A valid order ID is required.",
      });
    }

    if (
      !Number.isFinite(rating) ||
      rating < 1 ||
      rating > 5
    ) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5.",
      });
    }

    // Find only an order belonging to this customer.
    const order = await Order.findOne({
      _id: orderId,
      customer: customerId,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    // Only delivered orders can be reviewed.
    if (order.orderStatus !== "delivered") {
      return res.status(400).json({
        success: false,
        message: "You can review only delivered orders.",
      });
    }

    let selectedFoodId = null;

    // Validate food review when foodId is provided.
    if (foodId) {
      if (!mongoose.Types.ObjectId.isValid(foodId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid food ID.",
        });
      }

      const foodExistsInOrder = order.items.some(
        (item) =>
          item.food &&
          item.food.toString() === foodId.toString()
      );

      if (!foodExistsInOrder) {
        return res.status(400).json({
          success: false,
          message: "This food item is not part of your order.",
        });
      }

      const food = await Food.findOne({
        _id: foodId,
        restaurant: order.restaurant,
      });

      if (!food) {
        return res.status(404).json({
          success: false,
          message: "Food item not found.",
        });
      }

      selectedFoodId = food._id;
    }

    // Prevent duplicate reviews.
    const existingReview = await Review.findOne({
      customer: customerId,
      order: order._id,
      food: selectedFoodId,
    });

    if (existingReview) {
      return res.status(409).json({
        success: false,
        message: "You have already reviewed this order item.",
      });
    }

    // Save review.
    const review = await Review.create({
      customer: customerId,
      restaurant: order.restaurant,
      food: selectedFoodId,
      order: order._id,
      rating,
      comment: comment || "",
    });

    // Recalculate the relevant average rating.
    let ratingSummary;

    if (selectedFoodId) {
      ratingSummary = await updateFoodRating(selectedFoodId);
    } else {
      ratingSummary = await updateRestaurantRating(
        order.restaurant
      );
    }

    return res.status(201).json({
      success: true,
      message: "Review submitted successfully.",
      review,
      ratingSummary,
    });

  } catch (error) {
    console.error("Create review error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "You have already submitted this review.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Could not submit review.",
      error: error.message,
    });
  }
};

// ======================================
// GET RESTAURANT REVIEWS
// GET /api/reviews/restaurant/:restaurantId
// ======================================

const getRestaurantReviews = async (req, res) => {
  try {
    const { restaurantId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid restaurant ID.",
      });
    }

    const reviews = await Review.find({
      restaurant: restaurantId,
      food: null,
      isVisible: true,
    })
      .populate("customer", "name")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: reviews.length,
      reviews,
    });

  } catch (error) {
    console.error("Get restaurant reviews error:", error);

    return res.status(500).json({
      success: false,
      message: "Could not load restaurant reviews.",
    });
  }
};

// ======================================
// GET FOOD REVIEWS
// GET /api/reviews/food/:foodId
// ======================================

const getFoodReviews = async (req, res) => {
  try {
    const { foodId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(foodId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid food ID.",
      });
    }

    const reviews = await Review.find({
      food: foodId,
      isVisible: true,
    })
      .populate("customer", "name")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: reviews.length,
      reviews,
    });

  } catch (error) {
    console.error("Get food reviews error:", error);

    return res.status(500).json({
      success: false,
      message: "Could not load food reviews.",
    });
  }
};

// ======================================
// GET CUSTOMER REVIEWS FOR AN ORDER
// GET /api/reviews/order/:orderId
// ======================================

const getOrderReviews = async (req, res) => {
  try {
    const customerId = req.user?._id || req.user?.id;
    const { orderId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID.",
      });
    }

    const order = await Order.findOne({
      _id: orderId,
      customer: customerId,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    const reviews = await Review.find({
      customer: customerId,
      order: orderId,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      reviews,
    });

  } catch (error) {
    console.error("Get order reviews error:", error);

    return res.status(500).json({
      success: false,
      message: "Could not load order reviews.",
    });
  }
};

module.exports = {
  createReview,
  getRestaurantReviews,
  getFoodReviews,
  getOrderReviews,
};
