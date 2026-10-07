const Restaurant = require("../models/Restaurant");

// CREATE RESTAURANT
const createRestaurant = async (req, res) => {
  try {
    const {
      name,
      description,
      image,
      phone,
      email,
      address,
      cuisine,
      openingTime,
      closingTime,
      deliveryFee,
      minimumOrderAmount,
    } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Restaurant name is required",
      });
    }

    const existingRestaurant = await Restaurant.findOne({
      owner: req.user.userId,
    });

    if (existingRestaurant) {
      return res.status(409).json({
        success: false,
        message: "You already have a restaurant",
      });
    }

    const restaurant = await Restaurant.create({
      owner: req.user.userId,
      name,
      description,
      image,
      phone,
      email,
      address,
      cuisine,
      openingTime,
      closingTime,
      deliveryFee,
      minimumOrderAmount,
    });

    res.status(201).json({
      success: true,
      message: "Restaurant created successfully",
      restaurant,
    });
  } catch (error) {
    console.error("Create restaurant error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to create restaurant",
      error: error.message,
    });
  }
};

// GET ALL RESTAURANTS
const getRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.find({
      isActive: true,
    }).populate("owner", "name email phone");

    res.status(200).json({
      success: true,
      count: restaurants.length,
      restaurants,
    });
  } catch (error) {
    console.error("Get restaurants error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to get restaurants",
      error: error.message,
    });
  }
};

// GET SINGLE RESTAURANT
const getRestaurantById = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id).populate(
      "owner",
      "name email phone"
    );

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    res.status(200).json({
      success: true,
      restaurant,
    });
  } catch (error) {
    console.error("Get restaurant error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to get restaurant",
      error: error.message,
    });
  }
};

module.exports = {
  createRestaurant,
  getRestaurants,
  getRestaurantById,
};