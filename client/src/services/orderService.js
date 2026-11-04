import apiRequest from "./api";

// ======================================
// CREATE ORDER
// ======================================
export const createOrder = async (orderData, token) =>
  await apiRequest("/orders", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(orderData),
  });

// ======================================
// GET MY ORDERS
// ======================================
export const getMyOrders = async (token) =>
  await apiRequest("/orders", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

// ======================================
// GET SINGLE ORDER
// ======================================
export const getOrderById = async (orderId, token) =>
  await apiRequest(`/orders/${orderId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });


  // ======================================
// CREATE REVIEW
// ======================================

export const createReview = async (reviewData, token) =>
  await apiRequest("/reviews", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(reviewData),
  });

// ======================================
// GET REVIEWS FOR AN ORDER
// ======================================

export const getOrderReviews = async (orderId, token) =>
  await apiRequest(`/reviews/order/${orderId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });