const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    // ======================================
    // BASIC DETAILS
    // ======================================
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },

    // Email is optional.
    // Customer OTP login does not require email.
    email: {
      type: String,
      default: undefined,
      lowercase: true,
      trim: true,
    },

    // Phone will be the main login identifier.
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },

    // Password is optional because customers use OTP.
    // Restaurant/Delivery authentication can use it later if needed.
    password: {
      type: String,
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },

    // ======================================
    // USER ROLE
    // ======================================
    role: {
      type: String,
      enum: ["customer", "restaurant", "delivery"],
      default: "customer",
    },

    // ======================================
    // DEFAULT DELIVERY ADDRESS
    // ======================================
    address: {
      street: {
        type: String,
        default: "",
        trim: true,
      },

      city: {
        type: String,
        default: "",
        trim: true,
      },

      state: {
        type: String,
        default: "",
        trim: true,
      },

      pincode: {
        type: String,
        default: "",
        trim: true,
      },
    },

    // ======================================
    // PROFILE
    // ======================================
    profileImage: {
      type: String,
      default: "",
      trim: true,
    },

    // ======================================
    // ACCOUNT STATUS
    // ======================================
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// ======================================
// INDEXES
// ======================================

// Phone should be unique because it is the
// primary authentication identifier.
userSchema.index(
  { phone: 1 },
  { unique: true }
);

// Email is optional, so duplicate empty values
// should not be treated as duplicate accounts.
userSchema.index(
  { email: 1 },
  {
    unique: true,
    sparse: true,
  }
);

// ======================================
// HASH PASSWORD BEFORE SAVING
// ======================================

userSchema.pre("save", async function () {
  // Customer OTP accounts may not have a password.
  if (!this.isModified("password") || !this.password) {
    return;
  }

  const salt = await bcrypt.genSalt(10);

  this.password = await bcrypt.hash(
    this.password,
    salt
  );
});

// ======================================
// COMPARE PASSWORD
// ======================================

userSchema.methods.comparePassword = async function (
  enteredPassword
) {
  if (!this.password || !enteredPassword) {
    return false;
  }

  return await bcrypt.compare(
    enteredPassword,
    this.password
  );
};

const User = mongoose.model("User", userSchema);

module.exports = User;