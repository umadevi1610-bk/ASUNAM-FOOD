const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    food: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Food",
      required: [true, "Food is required"],
    },

    name: {
      type: String,
      required: [true, "Food name is required"],
      trim: true,
    },

    image: {
      type: String,
      default: "",
    },

    price: {
      type: Number,
      required: [true, "Food price is required"],
      min: 0,
    },

    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: 1,
    },

    total: {
      type: Number,
      required: [true, "Item total is required"],
      min: 0,
    },
  },
  {
    _id: false,
  }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
      required: true,
    },

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

    deliveryPartner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: function (items) {
          return items.length > 0;
        },
        message: "Order must contain at least one item",
      },
    },

    deliveryAddress: {
      name: {
        type: String,
        required: true,
      },

      phone: {
        type: String,
        required: true,
      },

      street: {
        type: String,
        required: true,
      },

      city: {
        type: String,
        required: true,
      },

      state: {
        type: String,
        required: true,
      },

      pincode: {
        type: String,
        required: true,
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

    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },

    deliveryFee: {
      type: Number,
      default: 0,
      min: 0,
    },

    discount: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    paymentMethod: {
      type: String,
      enum: ["cod", "online"],
      default: "cod",
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },

    orderStatus: {
      type: String,
      enum: [
        "placed",
        "restaurant_accepted",
        "preparing",
        "ready_for_pickup",
        "delivery_assigned",
        "picked_up",
        "out_for_delivery",
        "delivered",
        "cancelled",
        "rejected",
      ],
      default: "placed",
    },

    restaurantAcceptedAt: {
      type: Date,
      default: null,
    },

    preparingAt: {
      type: Date,
      default: null,
    },

    readyAt: {
      type: Date,
      default: null,
    },

    pickedUpAt: {
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

    customerNote: {
      type: String,
      default: "",
      trim: true,
      maxlength: 300,
    },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;