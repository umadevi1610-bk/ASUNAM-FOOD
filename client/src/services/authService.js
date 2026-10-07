import apiRequest from "./api";

// ===============================
// REGISTER
// ===============================
export const registerUser = async (userData) => {
  return await apiRequest("/auth/register", {
    method: "POST",
    body: JSON.stringify(userData),
  });
};

// ===============================
// LOGIN
// ===============================
export const loginUser = async (loginData) => {
  return await apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify(loginData),
  });
};

// ===============================
// GET CURRENT USER
// ===============================
export const getCurrentUser = async (token) => {
  return await apiRequest("/auth/me", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// ===============================
// TEMP CUSTOMER LOGIN
// NAME + PHONE
// OTP WILL BE ADDED LATER
// ===============================
export const customerLogin = async (customerData) => {
  return await apiRequest("/auth/customer-login", {
    method: "POST",
    body: JSON.stringify(customerData),
  });
};