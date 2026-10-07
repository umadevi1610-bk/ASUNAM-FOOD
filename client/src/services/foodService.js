import apiRequest from "./api";

// ===============================
// GET ALL FOODS
// ===============================
export const getFoods = async (params = {}) => {
  const searchParams = new URLSearchParams();

  if (params.restaurant) {
    searchParams.append("restaurant", params.restaurant);
  }

  if (params.category) {
    searchParams.append("category", params.category);
  }

  if (params.search) {
    searchParams.append("search", params.search);
  }

  const query = searchParams.toString();

  return await apiRequest(
    `/food${query ? `?${query}` : ""}`
  );
};

// ===============================
// GET SINGLE FOOD
// ===============================
export const getFoodById = async (foodId) => {
  return await apiRequest(`/food/${foodId}`);
};

// ===============================
// CREATE FOOD
// ===============================
export const createFood = async (foodData, token) => {
  return await apiRequest("/food", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(foodData),
  });
};