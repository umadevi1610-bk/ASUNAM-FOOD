
const mongoose = require("mongoose");

const deliveryPartnerProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Delivery partner account is required"],
      unique: true,
    },

    drivingLicenseNumber: {
      type: String,
      required: [true, "Driving licence number is required"],
      trim: true,
      uppercase: true,
      maxlength: 30,
    },

    vehicleType: {
      type: String,
      enum: ["bike", "scooter", "bicycle", "other"],
      required: [true, "Vehicle type is required"],
    },

    vehicleModel: {
      type: String,
      required: [true, "Vehicle model is required"],
      trim: true,
      maxlength: 100,
    },

    vehicleRegistrationNumber: {
      type: String,
      required: [true, "Vehicle registration number is required"],
      trim: true,
      uppercase: true,
      maxlength: 20,
    },

    address: {
      street: {
        type: String,
        required: true,
        trim: true,
      },

      city: {
        type: String,
        required: true,
        trim: true,
      },

      state: {
        type: String,
        required: true,
        trim: true,
      },

      pincode: {
        type: String,
        required: true,
        trim: true,
      },
    },

    availability: {
      startTime: {
        type: String,
        required: true,
        default: "09:00",
      },

      endTime: {
        type: String,
        required: true,
        default: "18:00",
      },
    },

    isAvailable: {
      type: Boolean,
      default: false,
    },

    verificationStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    identityVerificationStatus: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

const DeliveryPartnerProfile = mongoose.model(
  "DeliveryPartnerProfile",
  deliveryPartnerProfileSchema
);

module.exports = DeliveryPartnerProfile;
