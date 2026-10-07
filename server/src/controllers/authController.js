const User = require("../models/User");
const jwt = require("jsonwebtoken");

// ======================================
// GENERATE JWT TOKEN
// ======================================
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// ======================================
// REGISTER USER
// ======================================
const registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      role,
      address,
      profileImage,
    } = req.body;

    // -----------------------------------
    // Required fields
    // -----------------------------------
    if (!name || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        message:
          "Name, email, phone and password are required",
      });
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();

    // -----------------------------------
    // Basic phone validation
    // -----------------------------------
    if (!/^[0-9]{10}$/.test(cleanPhone)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid 10-digit phone number",
      });
    }

    // -----------------------------------
    // Check existing email
    // -----------------------------------
    const existingEmailUser = await User.findOne({
      email: cleanEmail,
    });

    if (existingEmailUser) {
      return res.status(409).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    // -----------------------------------
    // Check existing phone
    // -----------------------------------
    const existingPhoneUser = await User.findOne({
      phone: cleanPhone,
    });

    if (existingPhoneUser) {
      return res.status(409).json({
        success: false,
        message: "User with this phone number already exists",
      });
    }

    // -----------------------------------
    // Create user
    // -----------------------------------
    const user = await User.create({
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      password,
      role: role || "customer",
      address,
      profileImage,
    });

    // -----------------------------------
    // Generate token
    // -----------------------------------
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: "Registration successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email || "",
        phone: user.phone,
        role: user.role,
        address: user.address,
        profileImage: user.profileImage || "",
      },
    });
  } catch (error) {
    console.error("Register error:", error.message);

    res.status(500).json({
      success: false,
      message: "Registration failed",
      error: error.message,
    });
  }
};

// ======================================
// EMAIL + PASSWORD LOGIN
// ======================================
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // -----------------------------------
    // Required fields
    // -----------------------------------
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    // -----------------------------------
    // Find user + password
    // -----------------------------------
    const user = await User.findOne({
      email: cleanEmail,
    }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // -----------------------------------
    // Account status
    // -----------------------------------
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account is inactive",
      });
    }

    // -----------------------------------
    // Password check
    // -----------------------------------
    const isPasswordCorrect =
      await user.comparePassword(password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // -----------------------------------
    // Generate token
    // -----------------------------------
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email || "",
        phone: user.phone,
        role: user.role,
        address: user.address,
        profileImage: user.profileImage || "",
      },
    });
  } catch (error) {
    console.error("Login error:", error.message);

    res.status(500).json({
      success: false,
      message: "Login failed",
      error: error.message,
    });
  }
};

// ======================================
// TEMPORARY CUSTOMER LOGIN
// NAME + PHONE
// OTP WILL BE ADDED LATER
// ======================================
const customerLogin = async (req, res) => {
  try {
    const { name, phone } = req.body;

    // -----------------------------------
    // Required fields
    // -----------------------------------
    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        message: "Name and phone number are required",
      });
    }

    const cleanName = name.trim();
    const cleanPhone = phone.trim();

    // -----------------------------------
    // Validate name
    // -----------------------------------
    if (cleanName.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Name must be at least 2 characters",
      });
    }

    // -----------------------------------
    // Validate phone
    // -----------------------------------
    if (!/^[0-9]{10}$/.test(cleanPhone)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid 10-digit phone number",
      });
    }

    // -----------------------------------
    // Find existing user by phone
    // -----------------------------------
    let user = await User.findOne({
      phone: cleanPhone,
    });

    // -----------------------------------
    // Check role
    // -----------------------------------
    if (user && user.role !== "customer") {
      return res.status(403).json({
        success: false,
        message:
          "This phone number belongs to a partner account",
      });
    }

    // -----------------------------------
    // Create new customer
    // -----------------------------------
    if (!user) {
      user = await User.create({
        name: cleanName,
        phone: cleanPhone,
        role: "customer",
      });
    } else {
      // Update name if customer enters a new name
      if (cleanName !== user.name) {
        user.name = cleanName;
        await user.save();
      }
    }

    // -----------------------------------
    // Account status
    // -----------------------------------
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account is inactive",
      });
    }

    // -----------------------------------
    // Generate JWT
    // -----------------------------------
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: "Customer login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email || "",
        phone: user.phone,
        role: user.role,
        address: user.address,
        profileImage: user.profileImage || "",
      },
    });
  } catch (error) {
    console.error(
      "Customer login error:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Customer login failed",
      error: error.message,
    });
  }
};

// ======================================
// GET CURRENT USER
// ======================================
const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(
      req.user.userId
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email || "",
        phone: user.phone || "",
        role: user.role,
        address: user.address,
        profileImage: user.profileImage || "",
      },
    });
  } catch (error) {
    console.error(
      "Get current user error:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Failed to get user",
      error: error.message,
    });
  }
};

// ======================================
// EXPORTS
// ======================================
module.exports = {
  registerUser,
  loginUser,
  customerLogin,
  getCurrentUser,
};