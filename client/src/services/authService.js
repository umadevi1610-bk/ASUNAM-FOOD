
import apiRequest from "./api";

// ======================================
// CUSTOMER SIGN UP
// ======================================
export const registerUser = async (userData) => {
  return await apiRequest("/auth/register", {
    method: "POST",
    body: JSON.stringify(userData),
  });
};

// ======================================
// RESTAURANT PARTNER SIGN UP
// ======================================
export const registerRestaurantUser = async (userData) => {
  return await apiRequest("/auth/restaurant-register", {
    method: "POST",
    body: JSON.stringify(userData),
  });
};

// ======================================
// DELIVERY PARTNER SIGN UP
// ======================================
export const registerDeliveryUser = async (userData) => {
  return await apiRequest("/auth/delivery-register", {
    method: "POST",
    body: JSON.stringify(userData),
  });
};

// ======================================
// NORMAL EMAIL + PASSWORD LOGIN
// ======================================
export const loginUser = async (loginData) => {
  return await apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify(loginData),
  });
};

// ======================================
// CUSTOMER LOGIN
// NAME + PHONE
// ======================================
export const customerLogin = async (customerData) => {
  return await apiRequest("/auth/customer-login", {
    method: "POST",
    body: JSON.stringify(customerData),
  });
};

// ======================================
// RESTAURANT PARTNER LOGIN
// ======================================
export const restaurantLogin = async (restaurantData) => {
  return await apiRequest("/auth/restaurant-login", {
    method: "POST",
    body: JSON.stringify(restaurantData),
  });
};

// ======================================
// DELIVERY PARTNER LOGIN
// ======================================
export const deliveryLogin = async (deliveryData) => {
  return await apiRequest("/auth/delivery-login", {
    method: "POST",
    body: JSON.stringify(deliveryData),
  });
};

// ======================================
// CURRENT LOGGED-IN USER
// ======================================
export const getCurrentUser = async (token) => {
  return await apiRequest("/auth/me", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
