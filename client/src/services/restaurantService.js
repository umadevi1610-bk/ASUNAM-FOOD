import apiRequest from "./api";

// ===============================
// GET ALL RESTAURANTS
// ===============================
export const getRestaurants = async () => {
  return await apiRequest("/restaurants");
};

// ===============================
// GET SINGLE RESTAURANT
// ===============================
export const getRestaurantById = async (restaurantId) => {
  return await apiRequest(`/restaurants/${restaurantId}`);
};

// ===============================
// CREATE RESTAURANT
// ===============================
export const createRestaurant = async (restaurantData, token) => {
  return await apiRequest("/restaurants", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(restaurantData),
  });
};