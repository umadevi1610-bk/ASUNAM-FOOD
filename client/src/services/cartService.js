import apiRequest from "./api";

// ===============================
// GET MY CART
// ===============================
export const getCart = async (token) => {
  return await apiRequest("/cart", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// ===============================
// ADD FOOD TO CART
// ===============================
export const addToCart = async (foodId, quantity = 1, token) => {
  return await apiRequest("/cart/add", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      foodId,
      quantity,
    }),
  });
};

// ===============================
// UPDATE CART ITEM
// ===============================
export const updateCartItem = async (foodId, quantity, token) => {
  return await apiRequest("/cart/update", {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      foodId,
      quantity,
    }),
  });
};

// ===============================
// REMOVE FOOD FROM CART
// ===============================
export const removeFromCart = async (foodId, token) => {
  return await apiRequest(`/cart/remove/${foodId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// ===============================
// CLEAR CART
// ===============================
export const clearCart = async (token) => {
  return await apiRequest("/cart/clear", {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};