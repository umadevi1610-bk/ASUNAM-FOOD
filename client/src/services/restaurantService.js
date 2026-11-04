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
export const createRestaurant = async (
  restaurantData,
  token
) => {
  return await apiRequest("/restaurants", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(restaurantData),
  });
};

// ===============================
// GET MY RESTAURANT ORDERS
// ===============================
export const getMyRestaurantOrders = async (token) => {
  return await apiRequest("/restaurants/mine/orders", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// ===============================
// UPDATE ORDER STATUS
// ===============================
export const updateRestaurantOrderStatus = async (
  orderId,
  status,
  token,
  reason = ""
) => {
  return await apiRequest(
    `/restaurants/mine/orders/${orderId}/status`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        status,
        reason,
      }),
    }
  );
};

// ===============================
// GET MY RESTAURANT PROFILE
// ===============================
export const getMyRestaurantProfile = async (token) => {
  return await apiRequest("/restaurants/mine", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// ===============================
// UPDATE MY RESTAURANT PROFILE
// ===============================
export const updateMyRestaurantProfile = async (
  restaurantData,
  token
) => {
  return await apiRequest("/restaurants/mine", {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(restaurantData),
  });
};