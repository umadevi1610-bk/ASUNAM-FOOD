
const DeliveryPartnerProfile = require("../models/DeliveryPartnerProfile");

// ======================================
// CHECK DELIVERY PARTNER ROLE
// ======================================
const requireDeliveryRole = (req, res) => {
  if (req.user?.role !== "delivery") {
    res.status(403).json({
      success: false,
      message: "Delivery partner access required.",
    });
    return false;
  }

  if (!req.user?.userId) {
    res.status(401).json({
      success: false,
      message: "Please login again.",
    });
    return false;
  }

  return true;
};

// ======================================
// GET MY DELIVERY PROFILE
// GET /api/delivery/profile
// ======================================
const getMyDeliveryProfile = async (req, res) => {
  if (!requireDeliveryRole(req, res)) return;

  try {
    const profile = await DeliveryPartnerProfile.findOne({
      user: req.user.userId,
    }).select("-drivingLicenseNumber");

    return res.status(200).json({
      success: true,
      completed: Boolean(profile),
      profile,
    });
  } catch (error) {
    console.error("Get delivery profile error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to load delivery partner profile.",
    });
  }
};

// ======================================
// CREATE OR UPDATE MY DELIVERY PROFILE
// PUT /api/delivery/profile
// ======================================

const saveMyDeliveryProfile = async (req, res) => {
  if (!requireDeliveryRole(req, res)) return;

  try {
    const {
      drivingLicenseNumber,
      vehicleType,
      vehicleModel,
      vehicleRegistrationNumber,
      address,
      availability,
    } = req.body;

    // Find existing profile to preserve saved licence number.
    const existingProfile = await DeliveryPartnerProfile.findOne({
      user: req.user.userId,
    });

    if (
      !vehicleType ||
      !vehicleModel ||
      !vehicleRegistrationNumber ||
      !address?.street ||
      !address?.city ||
      !address?.state ||
      !address?.pincode ||
      !availability?.startTime ||
      !availability?.endTime
    ) {
      return res.status(400).json({
        success: false,
        message: "Please complete all required delivery partner details.",
      });
    }

    const submittedLicense =
      typeof drivingLicenseNumber === "string"
        ? drivingLicenseNumber.trim()
        : "";

    // Keep the old licence number when editing without entering it again.
    const cleanLicense = submittedLicense
      ? submittedLicense.toUpperCase()
      : existingProfile?.drivingLicenseNumber;

    if (!cleanLicense) {
      return res.status(400).json({
        success: false,
        message: "Please enter your driving licence number.",
      });
    }

    const cleanVehicleModel = String(vehicleModel).trim();

    const cleanRegistration = String(vehicleRegistrationNumber)
      .trim()
      .toUpperCase();

    const cleanAddress = {
      street: String(address.street).trim(),
      city: String(address.city).trim(),
      state: String(address.state).trim(),
      pincode: String(address.pincode).trim(),
    };

    const cleanAvailability = {
      startTime: String(availability.startTime).trim(),
      endTime: String(availability.endTime).trim(),
    };

    const allowedVehicleTypes = [
      "bike",
      "scooter",
      "bicycle",
      "other",
    ];

    const validTime = /^([01]\d|2[0-3]):[0-5]\d$/;

    if (!allowedVehicleTypes.includes(vehicleType)) {
      return res.status(400).json({
        success: false,
        message: "Please select a valid vehicle type.",
      });
    }

    if (cleanLicense.length < 5 || cleanLicense.length > 30) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid driving licence number.",
      });
    }

    if (
      cleanVehicleModel.length < 2 ||
      cleanVehicleModel.length > 100
    ) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid vehicle model.",
      });
    }

    if (
      cleanRegistration.length < 4 ||
      cleanRegistration.length > 20
    ) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid vehicle registration number.",
      });
    }

    if (!/^[0-9]{6}$/.test(cleanAddress.pincode)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid 6-digit pincode.",
      });
    }

    if (
      !validTime.test(cleanAvailability.startTime) ||
      !validTime.test(cleanAvailability.endTime)
    ) {
      return res.status(400).json({
        success: false,
        message: "Please enter availability times in HH:MM format.",
      });
    }

    if (cleanAvailability.startTime === cleanAvailability.endTime) {
      return res.status(400).json({
        success: false,
        message: "Start time and end time cannot be the same.",
      });
    }

    const profile = await DeliveryPartnerProfile.findOneAndUpdate(
      { user: req.user.userId },
      {
        $set: {
          user: req.user.userId,
          drivingLicenseNumber: cleanLicense,
          vehicleType,
          vehicleModel: cleanVehicleModel,
          vehicleRegistrationNumber: cleanRegistration,
          address: cleanAddress,
          availability: cleanAvailability,
          verificationStatus: "pending",
          identityVerificationStatus: "pending",
          isAvailable: false,
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    ).select("-drivingLicenseNumber");

    return res.status(200).json({
      success: true,
      message: "Delivery partner details saved. Verification is pending.",
      completed: true,
      profile,
    });
  } catch (error) {
    console.error("Save delivery profile error:", error.message);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to save delivery partner details.",
    });
  }
};


module.exports = {
  getMyDeliveryProfile,
  saveMyDeliveryProfile,
};
