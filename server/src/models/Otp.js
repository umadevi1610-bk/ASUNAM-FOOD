const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      index: true,
    },

    codeHash: {
      type: String,
      required: [true, "OTP hash is required"],
    },

    purpose: {
      type: String,
      enum: ["customer_auth"],
      default: "customer_auth",
      index: true,
    },

    attempts: {
      type: Number,
      default: 0,
      min: 0,
    },

    maxAttempts: {
      type: Number,
      default: 5,
      min: 1,
    },

    expiresAt: {
      type: Date,
      required: [true, "OTP expiry time is required"],
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Automatically remove expired OTP documents
otpSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 }
);

const Otp = mongoose.model("Otp", otpSchema);

module.exports = Otp;