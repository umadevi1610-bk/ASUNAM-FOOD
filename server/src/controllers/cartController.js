
const mongoose = require("mongoose");
const Cart = require("../models/Cart");
const Food = require("../models/Food");
const Restaurant = require("../models/Restaurant");

// ======================================
// CART HELPERS
// ======================================

const getUserId = (req) =>
  req.user?.userId || req.user?._id || req.user?.id;

const populateCart = (query) =>
  query
    .populate("items.food")
    .populate("items.restaurant")
    .populate("restaurant");

// Recalculate totals directly in MongoDB.
// This avoids document.save() version conflicts.
const calculateTotalsStages = [
  {
    $set: {
      subtotal: {
        $sum: {
          $map: {
            input: { $ifNull: ["$items", []] },
            as: "item",
            in: {
              $multiply: [
                { $ifNull: ["$$item.price", 0] },
                { $ifNull: ["$$item.quantity", 0] },
              ],
            },
          },
        },
      },
    },
  },
  {
    $set: {
      totalAmount: {
        $max: [
          0,
          {
            $subtract: [
              {
                $add: [
                  { $ifNull: ["$subtotal", 0] },
                  { $ifNull: ["$deliveryFee", 0] },
                ],
              },
              { $ifNull: ["$discount", 0] },
            ],
          },
        ],
      },
    },
  },
];

// ======================================
// GET MY CART
// ======================================

const getCart = async (req, res) => {
  try {
    const userId = getUserId(req);

    const cart = await populateCart(
      Cart.findOne({ user: userId })
    );

    return res.status(200).json({
      success: true,
      message: cart ? "Cart fetched successfully" : "Cart is empty",
      cart: cart || null,
    });
  } catch (error) {
    console.error("Get cart error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to get cart",
    });
  }
};

// ======================================
// ADD FOOD TO CART
// ======================================

const addToCart = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { foodId, quantity = 1 } = req.body;

    const parsedQuantity = Number(quantity);

    if (!foodId || !mongoose.isValidObjectId(foodId)) {
      return res.status(400).json({
        success: false,
        message: "Valid food ID is required",
      });
    }

    if (
      !Number.isInteger(parsedQuantity) ||
      parsedQuantity < 1
    ) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be a positive whole number",
      });
    }

    // Find food
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

    // Find restaurant
    const restaurant = await Restaurant.findById(food.restaurant);

    if (!restaurant || !restaurant.isActive) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found or inactive",
      });
    }

    // Atomically find or create a cart.
    // If two requests try to create simultaneously,
    // handle the unique-user-index duplicate key race.

    let cart;

    try {
      cart = await Cart.findOneAndUpdate(
        { user: userId },
        {
          $setOnInsert: {
            user: userId,
            restaurant: null,
            items: [],
            subtotal: 0,
            deliveryFee: 0,
            discount: 0,
            totalAmount: 0,
          },
        },
        {
          upsert: true,
          returnDocument: "after",
          setDefaultsOnInsert: true,
        }
      );
    } catch (error) {
      if (error.code !== 11000) {
        throw error;
      }

      // Another simultaneous request created the cart.
      cart = await Cart.findOne({ user: userId });
    }

    if (!cart) {
      return res.status(500).json({
        success: false,
        message: "Unable to create or retrieve cart",
      });
    }

    const restaurantId = restaurant._id;
    const foodObjectId = food._id;

    // Prepare new cart item.
    const newCartItem = {
      _id: new mongoose.Types.ObjectId(),
      food: foodObjectId,
      restaurant: restaurantId,
      quantity: parsedQuantity,
      price: food.price,
    };

    // Atomically add or increase an item.
    const pipeline = [
      {
        $set: {
          items: {
            $let: {
              vars: {
                currentItems: {
                  $ifNull: ["$items", []],
                },
              },
              in: {
                $cond: [
                  {
                    $in: [
                      foodObjectId,
                      {
                        $map: {
                          input: "$$currentItems",
                          as: "item",
                          in: "$$item.food",
                        },
                      },
                    ],
                  },

                  // Existing item: increase quantity.
                  {
                    $map: {
                      input: "$$currentItems",
                      as: "item",
                      in: {
                        $cond: [
                          {
                            $eq: [
                              "$$item.food",
                              foodObjectId,
                            ],
                          },
                          {
                            $mergeObjects: [
                              "$$item",
                              {
                                quantity: {
                                  $add: [
                                    {
                                      $ifNull: [
                                        "$$item.quantity",
                                        0,
                                      ],
                                    },
                                    parsedQuantity,
                                  ],
                                },
                                price: food.price,
                              },
                            ],
                          },
                          "$$item",
                        ],
                      },
                    },
                  },

                  // New item: append to cart.
                  {
                    $concatArrays: [
                      "$$currentItems",
                      [newCartItem],
                    ],
                  },
                ],
              },
            },
          },

          restaurant: restaurantId,
          deliveryFee: restaurant.deliveryFee || 0,
          discount: 0,
        },
      },

      ...calculateTotalsStages,
    ];

    // Prevent adding products from multiple restaurants.
const updatedCart = await Cart.findOneAndUpdate(
  {
    _id: cart._id,
    $or: [
      { restaurant: null },
      { restaurant: restaurantId },
    ],
  },
  pipeline,
  {
    returnDocument: "after",
    updatePipeline: true,
  }
);

    if (!updatedCart) {
      const currentCart = await Cart.findById(cart._id);

      if (
        currentCart?.restaurant &&
        currentCart.restaurant.toString() !==
          restaurantId.toString()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "You can order from only one restaurant at a time. Please clear your cart first.",
        });
      }

      return res.status(409).json({
        success: false,
        message: "Cart changed during the request. Please try again.",
      });
    }

    const populatedCart = await populateCart(
      Cart.findById(updatedCart._id)
    );

    return res.status(200).json({
      success: true,
      message: "Food added to cart successfully",
      cart: populatedCart,
    });
  } catch (error) {
    console.error("Add to cart error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to add food to cart",
      error: error.message,
    });
  }
};

// ======================================
// UPDATE CART ITEM QUANTITY
// ======================================

const updateCartItem = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { foodId, quantity } = req.body;

    const parsedQuantity = Number(quantity);

    if (
      !foodId ||
      !mongoose.isValidObjectId(foodId) ||
      quantity === undefined ||
      !Number.isInteger(parsedQuantity) ||
      parsedQuantity < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid food ID and quantity are required",
      });
    }

    const foodObjectId = new mongoose.Types.ObjectId(foodId);

    // First verify that the item belongs to this cart.
    const existingCart = await Cart.findOne({
      user: userId,
      "items.food": foodObjectId,
    });

    if (!existingCart) {
      return res.status(404).json({
        success: false,
        message: "Food item not found in cart",
      });
    }

    let pipeline;

    if (parsedQuantity === 0) {
      // Quantity 0 means remove item.
      pipeline = [
        {
          $set: {
            items: {
              $filter: {
                input: { $ifNull: ["$items", []] },
                as: "item",
                cond: {
                  $ne: ["$$item.food", foodObjectId],
                },
              },
            },
          },
        },
      ];
    } else {
      pipeline = [
        {
          $set: {
            items: {
              $map: {
                input: { $ifNull: ["$items", []] },
                as: "item",
                in: {
                  $cond: [
                    {
                      $eq: [
                        "$$item.food",
                        foodObjectId,
                      ],
                    },
                    {
                      $mergeObjects: [
                        "$$item",
                        { quantity: parsedQuantity },
                      ],
                    },
                    "$$item",
                  ],
                },
              },
            },
          },
        },
      ];
    }

    pipeline.push({
      $set: {
        restaurant: {
          $cond: [
            { $gt: [{ $size: "$items" }, 0] },
            "$restaurant",
            null,
          ],
        },

        deliveryFee: {
          $cond: [
            { $gt: [{ $size: "$items" }, 0] },
            "$deliveryFee",
            0,
          ],
        },

        discount: {
          $cond: [
            { $gt: [{ $size: "$items" }, 0] },
            "$discount",
            0,
          ],
        },
      },
    });

    pipeline.push(...calculateTotalsStages);
const updatedCart = await Cart.findOneAndUpdate(
  {
    user: userId,
    "items.food": foodObjectId,
  },
  pipeline,
  {
    returnDocument: "after",
    updatePipeline: true,
  }
);

    if (!updatedCart) {
      return res.status(404).json({
        success: false,
        message: "Cart item was already changed. Please refresh.",
      });
    }

    const populatedCart = await populateCart(
      Cart.findById(updatedCart._id)
    );

    return res.status(200).json({
      success: true,
      message:
        parsedQuantity === 0
          ? "Food removed from cart"
          : "Cart quantity updated successfully",
      cart: populatedCart,
    });
  } catch (error) {
    console.error("Update cart error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update cart",
      error: error.message,
    });
  }
};

// ======================================
// REMOVE FOOD FROM CART
// ======================================

const removeFromCart = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { foodId } = req.params;

    if (!mongoose.isValidObjectId(foodId)) {
      return res.status(400).json({
        success: false,
        message: "Valid food ID is required",
      });
    }

    const foodObjectId = new mongoose.Types.ObjectId(foodId);

    const pipeline = [
      {
        $set: {
          items: {
            $filter: {
              input: { $ifNull: ["$items", []] },
              as: "item",
              cond: {
                $ne: ["$$item.food", foodObjectId],
              },
            },
          },
        },
      },

      {
        $set: {
          restaurant: {
            $cond: [
              { $gt: [{ $size: "$items" }, 0] },
              "$restaurant",
              null,
            ],
          },

          deliveryFee: {
            $cond: [
              { $gt: [{ $size: "$items" }, 0] },
              "$deliveryFee",
              0,
            ],
          },

          discount: {
            $cond: [
              { $gt: [{ $size: "$items" }, 0] },
              "$discount",
              0,
            ],
          },
        },
      },

      ...calculateTotalsStages,
    ];

const updatedCart = await Cart.findOneAndUpdate(
  { user: userId },
  pipeline,
  {
    returnDocument: "after",
    updatePipeline: true,
  }
);
    if (!updatedCart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    const populatedCart = await populateCart(
      Cart.findById(updatedCart._id)
    );

    return res.status(200).json({
      success: true,
      message: "Food removed from cart",
      cart: populatedCart,
    });
  } catch (error) {
    console.error("Remove from cart error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to remove food from cart",
      error: error.message,
    });
  }
};

// ======================================
// CLEAR CART
// ======================================

const clearCart = async (req, res) => {
  try {
    const userId = getUserId(req);

const updatedCart = await Cart.findOneAndUpdate(
  { user: userId },
  [
    {
      $set: {
        restaurant: null,
        items: [],
        subtotal: 0,
        deliveryFee: 0,
        discount: 0,
        totalAmount: 0,
      },
    },
  ],
  {
    returnDocument: "after",
    updatePipeline: true,
  }
);

    return res.status(200).json({
      success: true,
      message: updatedCart
        ? "Cart cleared successfully"
        : "Cart is already empty",
      cart: updatedCart || null,
    });
  } catch (error) {
    console.error("Clear cart error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to clear cart",
      error: error.message,
    });
  }
};

// ======================================
// EXPORT CONTROLLERS
// ======================================

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
};
