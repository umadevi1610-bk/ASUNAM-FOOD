const mongoose = require("mongoose");

const foodSchema = new mongoose.Schema(
  {
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: [true, "Restaurant is required"],
    },

    name: {
      type: String,
      required: [true, "Food name is required"],
      trim: true,
      maxlength: [100, "Food name cannot exceed 100 characters"],
    },

    description: {
      type: String,
      trim: true,
      default: "",
      maxlength: [500, "Description cannot exceed 500 characters"],
    },

    image: {
      type: String,
      default: "",
    },

    price: {
      type: Number,
      required: [true, "Food price is required"],
      min: [0, "Price cannot be negative"],
    },

    category: {
      type: String,
      required: [true, "Food category is required"],
      trim: true,
      enum: [
        "Biryani",
        "Pizza",
        "Burger",
        "Chinese",
        "South Indian",
        "North Indian",
        "Desserts",
        "Drinks",
        "Snacks",
        "Other",
      ],
    },

    isVeg: {
      type: Boolean,
      default: false,
    },

    isAvailable: {
      type: Boolean,
      default: true,
    },

    preparationTime: {
      type: Number,
      default: 20,
      min: 1,
    },

    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    totalReviews: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Food = mongoose.model("Food", foodSchema);

module.exports = Food;