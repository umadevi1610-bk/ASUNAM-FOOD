const mongoose = require("mongoose");

const restaurantSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Restaurant owner is required"],
    },

    name: {
      type: String,
      required: [true, "Restaurant name is required"],
      trim: true,
      maxlength: [100, "Restaurant name cannot exceed 100 characters"],
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

    phone: {
      type: String,
      trim: true,
      default: "",
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },

    address: {
      street: {
        type: String,
        default: "",
      },

      city: {
        type: String,
        default: "",
      },

      state: {
        type: String,
        default: "",
      },

      pincode: {
        type: String,
        default: "",
      },

      latitude: {
        type: Number,
        default: null,
      },

      longitude: {
        type: Number,
        default: null,
      },
    },

    cuisine: [
      {
        type: String,
        trim: true,
      },
    ],

    openingTime: {
      type: String,
      default: "09:00",
    },

    closingTime: {
      type: String,
      default: "22:00",
    },

    isOpen: {
      type: Boolean,
      default: true,
    },

    isActive: {
      type: Boolean,
      default: true,
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

    deliveryFee: {
      type: Number,
      default: 0,
      min: 0,
    },

    minimumOrderAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Restaurant = mongoose.model("Restaurant", restaurantSchema);

module.exports = Restaurant;