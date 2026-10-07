const Cart = require("../models/Cart");
const Order = require("../models/Order");
const Food = require("../models/Food");
const Restaurant = require("../models/Restaurant");

// ======================================
// GENERATE UNIQUE ORDER NUMBER
// ======================================
const generateOrderNumber = () => {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(1000 + Math.random() * 9000);

  return `ASF-${timestamp}-${random}`;
};

// ======================================
// CREATE ORDER
// POST /api/orders
// ======================================
const createOrder = async (req, res) => {
  try {
    const {
      deliveryAddress,
      paymentMethod = "cod",
      customerNote = "",
    } = req.body;

    // -------------------------------
    // Validate delivery address
    // -------------------------------
    if (!deliveryAddress) {
      return res.status(400).json({
        success: false,
        message: "Delivery address is required",
      });
    }

    const requiredAddressFields = [
      "name",
      "phone",
      "street",
      "city",
      "state",
      "pincode",
    ];

    for (const field of requiredAddressFields) {
      if (!deliveryAddress[field]) {
        return res.status(400).json({
          success: false,
          message: `${field} is required in delivery address`,
        });
      }
    }

    // -------------------------------
    // Validate payment method
    // -------------------------------
    if (!["cod", "online"].includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment method",
      });
    }

    // -------------------------------
    // Get user's cart
    // -------------------------------
    const cart = await Cart.findOne({
      user: req.user.userId,
    }).populate("items.food");

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    // -------------------------------
    // Check cart items
    // -------------------------------
    if (!cart.items || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Your cart is empty",
      });
    }

    // -------------------------------
    // Get restaurant
    // -------------------------------
    const restaurant = await Restaurant.findById(cart.restaurant);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    if (!restaurant.isActive) {
      return res.status(400).json({
        success: false,
        message: "Restaurant is currently unavailable",
      });
    }

    // -------------------------------
    // Prepare order items
    // -------------------------------
    const orderItems = [];

    for (const cartItem of cart.items) {
      const food = cartItem.food;

      if (!food) {
        return res.status(400).json({
          success: false,
          message: "One of the food items in your cart no longer exists",
        });
      }

      // Check current availability
      if (!food.isAvailable) {
        return res.status(400).json({
          success: false,
          message: `${food.name} is currently unavailable`,
        });
      }

      const itemTotal = cartItem.price * cartItem.quantity;

      orderItems.push({
        food: food._id,
        name: food.name,
        image: food.image || "",
        price: cartItem.price,
        quantity: cartItem.quantity,
        total: itemTotal,
      });
    }

    // -------------------------------
    // Calculate totals again
    // -------------------------------
    const subtotal = orderItems.reduce(
      (total, item) => total + item.total,
      0
    );

    const deliveryFee = restaurant.deliveryFee || 0;
    const discount = cart.discount || 0;

    const totalAmount = subtotal + deliveryFee - discount;

    // -------------------------------
    // Create order
    // -------------------------------
    const order = await Order.create({
      orderNumber: generateOrderNumber(),

      customer: req.user.userId,

      restaurant: restaurant._id,

      deliveryPartner: null,

      items: orderItems,

      deliveryAddress: {
        name: deliveryAddress.name,
        phone: deliveryAddress.phone,
        street: deliveryAddress.street,
        city: deliveryAddress.city,
        state: deliveryAddress.state,
        pincode: deliveryAddress.pincode,
        latitude: deliveryAddress.latitude || null,
        longitude: deliveryAddress.longitude || null,
      },

      subtotal,
      deliveryFee,
      discount,
      totalAmount,

      paymentMethod,

      paymentStatus: "pending",

      orderStatus: "placed",

      customerNote: customerNote.trim(),
    });

    // -------------------------------
    // Clear cart after order
    // -------------------------------
    cart.restaurant = null;
    cart.items = [];
    cart.subtotal = 0;
    cart.deliveryFee = 0;
    cart.discount = 0;
    cart.totalAmount = 0;

    await cart.save();

    // -------------------------------
    // Return populated order
    // -------------------------------
    const createdOrder = await Order.findById(order._id)
      .populate("customer", "name email phone")
      .populate("restaurant", "name image phone")
      .populate("deliveryPartner", "name phone");

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order: createdOrder,
    });
  } catch (error) {
    console.error("Create order error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to create order",
      error: error.message,
    });
  }
};

// ======================================
// GET MY ORDERS
// GET /api/orders
// ======================================
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      customer: req.user.userId,
    })
      .populate("restaurant", "name image cuisine")
      .populate("deliveryPartner", "name phone profileImage")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("Get orders error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to get orders",
      error: error.message,
    });
  }
};

// ======================================
// GET SINGLE ORDER
// GET /api/orders/:id
// ======================================
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("customer", "name email phone")
      .populate("restaurant", "name image phone address")
      .populate("deliveryPartner", "name phone profileImage");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Customer can only view their own order
    if (order.customer._id.toString() !== req.user.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to view this order",
      });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Get order error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to get order",
      error: error.message,
    });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
};