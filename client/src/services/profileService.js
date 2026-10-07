import apiRequest from "./api";

// ======================================
// GET MY PROFILE
// ======================================
export const getProfile = async (token) =>
  await apiRequest("/profile", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

// ======================================
// UPDATE MY PROFILE
// ======================================
export const updateProfile = async (profileData, token) =>
  await apiRequest("/profile", {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(profileData),
  });