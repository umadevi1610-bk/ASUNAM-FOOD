const Food = require("../models/Food");
const Restaurant = require("../models/Restaurant");

// Check whether the logged-in user owns this food's restaurant
const checkFoodOwnership = async (food, userId) => {
  const restaurant = await Restaurant.findById(food.restaurant);

  if (!restaurant) {
    return { allowed: false, restaurantMissing: true };
  }

  return {
    allowed: String(restaurant.owner) === String(userId),
    restaurantMissing: false,
  };
};

// CREATE FOOD
const createFood = async (req, res) => {
  try {
    const {
      restaurant,
      name,
      description,
      image,
      price,
      category,
      isVeg,
      isAvailable,
      preparationTime,
    } = req.body;

    if (
      !restaurant ||
      !name?.trim() ||
      price === undefined ||
      price === "" ||
      !category
    ) {
      return res.status(400).json({
        success: false,
        message: "Restaurant, name, price and category are required.",
      });
    }

    if (!Number.isFinite(Number(price)) || Number(price) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid food price.",
      });
    }

    const restaurantExists = await Restaurant.findById(restaurant);

    if (!restaurantExists) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found.",
      });
    }

    if (String(restaurantExists.owner) !== String(req.user.userId)) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to add food to this restaurant.",
      });
    }

    const food = await Food.create({
      restaurant,
      name: name.trim(),
      description: description || "",
      image: image || "",
      price: Number(price),
      category,
      isVeg: typeof isVeg === "boolean" ? isVeg : true,
      isAvailable:
        typeof isAvailable === "boolean" ? isAvailable : true,
      preparationTime: Number(preparationTime) || 20,
    });

    return res.status(201).json({
      success: true,
      message: "Food created successfully.",
      food,
    });
  } catch (error) {
    console.error("Create food error:", error);

    return res.status(
      error.name === "ValidationError" ? 400 : 500
    ).json({
      success: false,
      message:
        error.name === "ValidationError"
          ? error.message
          : "Failed to create food.",
    });
  }
};

// GET ALL FOODS
const getFoods = async (req, res) => {
  try {
    const filter = {};

    if (req.query.restaurant) {
      filter.restaurant = req.query.restaurant;
    }

    if (req.query.category) {
      filter.category = req.query.category;
    }

    if (req.query.search) {
      filter.name = {
        $regex: req.query.search,
        $options: "i",
      };
    }

    const foods = await Food.find(filter)
      .populate("restaurant", "name image cuisine")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: foods.length,
      foods,
    });
  } catch (error) {
    console.error("Get foods error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get foods.",
    });
  }
};

// GET SINGLE FOOD
const getFoodById = async (req, res) => {
  try {
    const food = await Food.findById(req.params.id).populate(
      "restaurant",
      "name image cuisine deliveryFee"
    );

    if (!food) {
      return res.status(404).json({
        success: false,
        message: "Food not found.",
      });
    }

    return res.status(200).json({
      success: true,
      food,
    });
  } catch (error) {
    console.error("Get food error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get food.",
    });
  }
};

// UPDATE FOOD
const updateFood = async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);

    if (!food) {
      return res.status(404).json({
        success: false,
        message: "Food item not found.",
      });
    }

    const ownership = await checkFoodOwnership(
      food,
      req.user.userId
    );

    if (ownership.restaurantMissing) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found.",
      });
    }

    if (!ownership.allowed) {
      return res.status(403).json({
        success: false,
        message: "You cannot edit another restaurant's food.",
      });
    }

    const allowedFields = [
      "name",
      "description",
      "image",
      "price",
      "category",
      "isVeg",
      "isAvailable",
      "preparationTime",
    ];

    for (const field of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        food[field] = req.body[field];
      }
    }

    if (req.body.name !== undefined) {
      food.name = String(req.body.name).trim();

      if (!food.name) {
        return res.status(400).json({
          success: false,
          message: "Food name cannot be empty.",
        });
      }
    }

    if (req.body.price !== undefined) {
      if (
        req.body.price === "" ||
        !Number.isFinite(Number(req.body.price)) ||
        Number(req.body.price) <= 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Enter a valid food price.",
        });
      }

      food.price = Number(req.body.price);
    }

    const updatedFood = await food.save();

    return res.status(200).json({
      success: true,
      message: "Food updated successfully.",
      food: updatedFood,
    });
  } catch (error) {
    console.error("Update food error:", error);

    return res.status(
      error.name === "ValidationError" ? 400 : 500
    ).json({
      success: false,
      message:
        error.name === "ValidationError"
          ? error.message
          : "Failed to update food.",
    });
  }
};

// DELETE FOOD
const deleteFood = async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);

    if (!food) {
      return res.status(404).json({
        success: false,
        message: "Food item not found.",
      });
    }

    const ownership = await checkFoodOwnership(
      food,
      req.user.userId
    );

    if (ownership.restaurantMissing) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found.",
      });
    }

    if (!ownership.allowed) {
      return res.status(403).json({
        success: false,
        message: "You cannot delete another restaurant's food.",
      });
    }

    await food.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Food deleted successfully.",
    });
  } catch (error) {
    console.error("Delete food error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete food.",
    });
  }
};

module.exports = {
  createFood,
  getFoods,
  getFoodById,
  updateFood,
  deleteFood,
};