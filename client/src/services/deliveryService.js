
import apiRequest from "./api";

// GET AVAILABLE ORDERS
export const getAvailableOrders = async (token) => {
  return await apiRequest("/delivery/available", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// GET MY DELIVERIES
export const getMyDeliveries = async (token) => {
  return await apiRequest("/delivery/mine", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// ACCEPT ORDER
export const acceptDeliveryOrder = async (orderId, token) => {
  return await apiRequest(`/delivery/orders/${orderId}/accept`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// UPDATE DELIVERY STATUS
export const updateDeliveryStatus = async (
  deliveryId,
  status,
  token
) => {
  return await apiRequest(`/delivery/${deliveryId}/status`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });
};
// ======================================
// GET MY DELIVERY PARTNER PROFILE
// ======================================
export const getMyDeliveryProfile = async (token) => {
  return await apiRequest("/delivery/profile", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// ======================================
// SAVE / UPDATE MY DELIVERY PROFILE
// ======================================
export const saveMyDeliveryProfile = async (
  profileData,
  token
) => {
  return await apiRequest("/delivery/profile", {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(profileData),
  });
};