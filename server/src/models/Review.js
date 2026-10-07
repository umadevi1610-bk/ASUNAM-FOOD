const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Customer is required"],
    },

    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: [true, "Restaurant is required"],
    },

    food: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Food",
      default: null,
    },

    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: [true, "Order is required"],
    },

    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
    },

    comment: {
      type: String,
      trim: true,
      default: "",
      maxlength: [500, "Review cannot exceed 500 characters"],
    },

    images: [
      {
        type: String,
      },
    ],

    isVisible: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;