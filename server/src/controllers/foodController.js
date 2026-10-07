const Food = require("../models/Food");
const Restaurant = require("../models/Restaurant");

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
      preparationTime,
    } = req.body;

    if (!restaurant || !name || price === undefined || !category) {
      return res.status(400).json({
        success: false,
        message: "Restaurant, name, price and category are required",
      });
    }

    const restaurantExists = await Restaurant.findById(restaurant);

    if (!restaurantExists) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    // Only restaurant owner can add food
    if (restaurantExists.owner.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to add food to this restaurant",
      });
    }

    const food = await Food.create({
      restaurant,
      name,
      description,
      image,
      price,
      category,
      isVeg,
      preparationTime,
    });

    res.status(201).json({
      success: true,
      message: "Food created successfully",
      food,
    });
  } catch (error) {
    console.error("Create food error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to create food",
      error: error.message,
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

    res.status(200).json({
      success: true,
      count: foods.length,
      foods,
    });
  } catch (error) {
    console.error("Get foods error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to get foods",
      error: error.message,
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
        message: "Food not found",
      });
    }

    res.status(200).json({
      success: true,
      food,
    });
  } catch (error) {
    console.error("Get food error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to get food",
      error: error.message,
    });
  }
};

module.exports = {
  createFood,
  getFoods,
  getFoodById,
};