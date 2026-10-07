const User = require("../models/User");

// ======================================
// GET MY PROFILE
// GET /api/profile
// ======================================
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select(
      "-password"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Get profile error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to get profile",
      error: error.message,
    });
  }
};

// ======================================
// UPDATE MY PROFILE
// PUT /api/profile
// ======================================
const updateProfile = async (req, res) => {
  try {
    const {
      name,
      phone,
      profileImage,
      address,
    } = req.body;

    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update name
    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({
          success: false,
          message: "Name cannot be empty",
        });
      }

      user.name = name.trim();
    }

    // Update phone
    if (phone !== undefined) {
      user.phone = phone.trim();
    }

    // Update profile image
    if (profileImage !== undefined) {
      user.profileImage = profileImage.trim();
    }

    // Update address
    if (address !== undefined) {
      user.address = {
        street: address.street?.trim() || "",
        city: address.city?.trim() || "",
        state: address.state?.trim() || "",
        pincode: address.pincode?.trim() || "",
      };
    }

    await user.save();

    const updatedUser = await User.findById(
      user._id
    ).select("-password");

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update profile error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to update profile",
      error: error.message,
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,
};