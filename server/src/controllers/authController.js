
const User = require("../models/User");
const jwt = require("jsonwebtoken");

// ======================================
// GENERATE JWT TOKEN
// ======================================

const generateToken = (userId, role) => {
  return jwt.sign(
    {
      userId: String(userId),
      role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// ======================================
// FORMAT USER RESPONSE
// ======================================

const formatUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email || "",
  phone: user.phone || "",
  role: user.role,
  address: user.address,
  profileImage: user.profileImage || "",
});

// ======================================
// SHARED REGISTRATION LOGIC
// Role is determined by the server, not the request.
// ======================================

const registerAccount = async (req, res, assignedRole) => {
  try {
    const { name, email, phone, password, address, profileImage } =
      req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, phone and password are required",
      });
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();

    if (cleanName.length < 2 || cleanName.length > 50) {
      return res.status(400).json({
        success: false,
        message: "Name must contain 2 to 50 characters",
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address",
      });
    }

    if (!/^[0-9]{10}$/.test(cleanPhone)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid 10-digit phone number",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const existingEmail = await User.findOne({
      email: cleanEmail,
    });

    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    const existingPhone = await User.findOne({
      phone: cleanPhone,
    });

    if (existingPhone) {
      return res.status(409).json({
        success: false,
        message: "An account with this phone number already exists",
      });
    }

    const user = await User.create({
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      password,
      role: assignedRole,
      address,
      profileImage,
    });

    const token = generateToken(user._id, user.role);

    return res.status(201).json({
      success: true,
      message: "Registration successful",
      token,
      user: formatUser(user),
    });
  } catch (error) {
    console.error("Registration error:", error.message);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Email or phone number is already registered",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Registration failed",
    });
  }
};

// ======================================
// CUSTOMER REGISTRATION
// POST /api/auth/register
// ======================================

const registerUser = async (req, res) => {
  return registerAccount(req, res, "customer");
};

// ======================================
// RESTAURANT PARTNER REGISTRATION
// POST /api/auth/restaurant-register
// ======================================

const registerRestaurantUser = async (req, res) => {
  return registerAccount(req, res, "restaurant");
};

// ======================================
// DELIVERY PARTNER REGISTRATION
// POST /api/auth/delivery-register
// ======================================

const registerDeliveryUser = async (req, res) => {
  return registerAccount(req, res, "delivery");
};

// ======================================
// SHARED EMAIL + PASSWORD LOGIN
// ======================================

const loginWithEmailPassword = async (
  req,
  res,
  requiredRole = null,
  accountLabel = "Account"
) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: cleanEmail,
    }).select("+password");

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (requiredRole && user.role !== requiredRole) {
      return res.status(403).json({
        success: false,
        message: `This account is not a ${accountLabel} account`,
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: `${accountLabel} account is inactive`,
      });
    }

    const token = generateToken(user._id, user.role);

    return res.status(200).json({
      success: true,
      message: `${accountLabel} login successful`,
      token,
      user: formatUser(user),
    });
  } catch (error) {
    console.error(`${accountLabel} login error:`, error.message);

    return res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
};

// ======================================
// NORMAL EMAIL + PASSWORD LOGIN
// ======================================

const loginUser = async (req, res) => {
  return loginWithEmailPassword(req, res);
};

// ======================================
// RESTAURANT LOGIN
// ======================================

const restaurantLogin = async (req, res) => {
  return loginWithEmailPassword(
    req,
    res,
    "restaurant",
    "Restaurant"
  );
};

// ======================================
// DELIVERY PARTNER LOGIN
// ======================================

const deliveryLogin = async (req, res) => {
  return loginWithEmailPassword(
    req,
    res,
    "delivery",
    "Delivery partner"
  );
};

// ======================================
// TEMPORARY CUSTOMER LOGIN
// NAME + PHONE
// OTP WILL BE ADDED LATER
// ======================================

const customerLogin = async (req, res) => {
  try {
    const { name, phone } = req.body;

    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        message: "Name and phone number are required",
      });
    }

    const cleanName = name.trim();
    const cleanPhone = phone.trim();

    if (cleanName.length < 2 || cleanName.length > 50) {
      return res.status(400).json({
        success: false,
        message: "Name must contain 2 to 50 characters",
      });
    }

    if (!/^[0-9]{10}$/.test(cleanPhone)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid 10-digit phone number",
      });
    }

    let user = await User.findOne({
      phone: cleanPhone,
    });

    if (user && user.role !== "customer") {
      return res.status(403).json({
        success: false,
        message: "This phone number belongs to a partner account",
      });
    }

    if (!user) {
      user = await User.create({
        name: cleanName,
        phone: cleanPhone,
        role: "customer",
      });
    } else if (cleanName !== user.name) {
      user.name = cleanName;
      await user.save();
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account is inactive",
      });
    }

    const token = generateToken(user._id, user.role);

    return res.status(200).json({
      success: true,
      message: "Customer login successful",
      token,
      user: formatUser(user),
    });
  } catch (error) {
    console.error("Customer login error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Customer login failed",
    });
  }
};

// ======================================
// GET CURRENT LOGGED-IN USER
// ======================================

const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "This account is inactive",
      });
    }

    return res.status(200).json({
      success: true,
      user: formatUser(user),
    });
  } catch (error) {
    console.error("Get current user error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to get user",
    });
  }
};

// ======================================
// EXPORTS
// ======================================

module.exports = {
  registerUser,
  registerRestaurantUser,
  registerDeliveryUser,
  loginUser,
  customerLogin,
  restaurantLogin,
  deliveryLogin,
  getCurrentUser,
};
