const mongoose = require("mongoose");

const deliverySchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: [true, "Order is required"],
      unique: true,
    },

    deliveryPartner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Delivery partner is required"],
    },

    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: [true, "Restaurant is required"],
    },

    pickupLocation: {
      address: {
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

    deliveryLocation: {
      address: {
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

    distance: {
      type: Number,
      default: 0,
      min: 0,
    },

    deliveryFee: {
      type: Number,
      default: 0,
      min: 0,
    },

    partnerEarnings: {
      type: Number,
      default: 0,
      min: 0,
    },

    status: {
      type: String,
      enum: [
        "assigned",
        "accepted",
        "picked_up",
        "out_for_delivery",
        "delivered",
        "cancelled",
      ],
      default: "assigned",
    },

    acceptedAt: {
      type: Date,
      default: null,
    },

    pickedUpAt: {
      type: Date,
      default: null,
    },

    outForDeliveryAt: {
      type: Date,
      default: null,
    },

    deliveredAt: {
      type: Date,
      default: null,
    },

    cancelledAt: {
      type: Date,
      default: null,
    },

    cancellationReason: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Delivery = mongoose.model("Delivery", deliverySchema);

module.exports = Delivery;