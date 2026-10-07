const Cart = require("../models/Cart");
const Food = require("../models/Food");
const Restaurant = require("../models/Restaurant");

// ===============================
// GET MY CART
// ===============================
const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({
      user: req.user.userId,
    })
      .populate("items.food")
      .populate("items.restaurant")
      .populate("restaurant");

    if (!cart) {
      return res.status(200).json({
        success: true,
        message: "Cart is empty",
        cart: null,
      });
    }

    res.status(200).json({
      success: true,
      cart,
    });
  } catch (error) {
    console.error("Get cart error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to get cart",
      error: error.message,
    });
  }
};

// ===============================
// ADD FOOD TO CART
// ===============================
const addToCart = async (req, res) => {
  try {
    console.log("CONTENT TYPE:", req.headers["content-type"]);
    console.log("REQUEST BODY:", req.body);
    const { foodId, quantity = 1 } = req.body;

    if (!foodId) {
      return res.status(400).json({
        success: false,
        message: "Food ID is required",
      });
    }

    if (quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be at least 1",
      });
    }

    const food = await Food.findById(foodId);

    if (!food) {
      return res.status(404).json({
        success: false,
        message: "Food not found",
      });
    }

    if (!food.isAvailable) {
      return res.status(400).json({
        success: false,
        message: "This food is currently unavailable",
      });
    }

    const restaurant = await Restaurant.findById(food.restaurant);

    if (!restaurant || !restaurant.isActive) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found or inactive",
      });
    }

    let cart = await Cart.findOne({
      user: req.user.userId,
    });

    // Create new cart
    if (!cart) {
      cart = new Cart({
        user: req.user.userId,
        restaurant: restaurant._id,
        items: [],
      });
    }

    // Prevent items from multiple restaurants
    if (
      cart.restaurant &&
      cart.restaurant.toString() !== restaurant._id.toString()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "You can order from only one restaurant at a time. Please clear your cart first.",
      });
    }

    cart.restaurant = restaurant._id;

    const existingItem = cart.items.find(
      (item) => item.food.toString() === foodId
    );

    if (existingItem) {
      existingItem.quantity += Number(quantity);
      existingItem.price = food.price;
    } else {
      cart.items.push({
        food: food._id,
        restaurant: restaurant._id,
        quantity: Number(quantity),
        price: food.price,
      });
    }

    // Calculate totals
    cart.subtotal = cart.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    cart.deliveryFee = restaurant.deliveryFee || 0;
    cart.discount = 0;

    cart.totalAmount =
      cart.subtotal + cart.deliveryFee - cart.discount;

    await cart.save();

    const updatedCart = await Cart.findById(cart._id)
      .populate("items.food")
      .populate("items.restaurant")
      .populate("restaurant");

    res.status(200).json({
      success: true,
      message: "Food added to cart successfully",
      cart: updatedCart,
    });
  } catch (error) {
    console.error("Add to cart error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to add food to cart",
      error: error.message,
    });
  }
};

// ===============================
// UPDATE CART ITEM
// ===============================
const updateCartItem = async (req, res) => {
  try {
    const { foodId, quantity } = req.body;

    if (!foodId || quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: "Food ID and quantity are required",
      });
    }

    const cart = await Cart.findOne({
      user: req.user.userId,
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    const item = cart.items.find(
      (item) => item.food.toString() === foodId
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Food item not found in cart",
      });
    }

    if (quantity <= 0) {
      cart.items = cart.items.filter(
        (item) => item.food.toString() !== foodId
      );
    } else {
      item.quantity = Number(quantity);
    }

    if (cart.items.length === 0) {
      cart.restaurant = null;
      cart.subtotal = 0;
      cart.deliveryFee = 0;
      cart.discount = 0;
      cart.totalAmount = 0;
    } else {
      const restaurant = await Restaurant.findById(cart.restaurant);

      cart.subtotal = cart.items.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      );

      cart.deliveryFee = restaurant?.deliveryFee || 0;
      cart.totalAmount =
        cart.subtotal + cart.deliveryFee - cart.discount;
    }

    await cart.save();

    const updatedCart = await Cart.findById(cart._id)
      .populate("items.food")
      .populate("items.restaurant")
      .populate("restaurant");

    res.status(200).json({
      success: true,
      message: "Cart updated successfully",
      cart: updatedCart,
    });
  } catch (error) {
    console.error("Update cart error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to update cart",
      error: error.message,
    });
  }
};

// ===============================
// REMOVE FOOD FROM CART
// ===============================
const removeFromCart = async (req, res) => {
  try {
    const { foodId } = req.params;

    const cart = await Cart.findOne({
      user: req.user.userId,
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    cart.items = cart.items.filter(
      (item) => item.food.toString() !== foodId
    );

    if (cart.items.length === 0) {
      cart.restaurant = null;
      cart.subtotal = 0;
      cart.deliveryFee = 0;
      cart.discount = 0;
      cart.totalAmount = 0;
    } else {
      cart.subtotal = cart.items.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      );

      cart.totalAmount =
        cart.subtotal + cart.deliveryFee - cart.discount;
    }

    await cart.save();

    const updatedCart = await Cart.findById(cart._id)
      .populate("items.food")
      .populate("items.restaurant")
      .populate("restaurant");

    res.status(200).json({
      success: true,
      message: "Food removed from cart",
      cart: updatedCart,
    });
  } catch (error) {
    console.error("Remove from cart error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to remove food from cart",
      error: error.message,
    });
  }
};

// ===============================
// CLEAR CART
// ===============================
const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({
      user: req.user.userId,
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    cart.restaurant = null;
    cart.items = [];
    cart.subtotal = 0;
    cart.deliveryFee = 0;
    cart.discount = 0;
    cart.totalAmount = 0;

    await cart.save();

    res.status(200).json({
      success: true,
      message: "Cart cleared successfully",
      cart,
    });
  } catch (error) {
    console.error("Clear cart error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to clear cart",
      error: error.message,
    });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
};