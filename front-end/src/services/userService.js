import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "skip-browser-warning",
  },
});

// Add token to requests
const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return token
    ? {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    : {};
};

/**
 * Get all users with pagination and search
 */
export const getAllUsers = async (page = 1, limit = 10, search = "") => {
  try {
    const params = { page, limit };
    if (search) params.search = search;

    const response = await api.get("/users", {
      params,
      ...getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching users:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to fetch users",
      error: error.response?.data || error.message,
    };
  }
};

/**
 * Get user by ID
 */
export const getUserById = async (id) => {
  try {
    const response = await api.get(`/users/${id}`, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error(`Error fetching user with ID ${id}:`, error);
    return {
      success: false,
      message:
        error.response?.data?.message || `Failed to fetch user with ID ${id}`,
      error: error.response?.data || error.message,
    };
  }
};

/**
 * Create new user
 */
export const createUser = async (userData) => {
  try {
    const cleanData = {
      name: userData.name?.trim(),
      email: userData.email?.trim(),
      password: userData.password,
      role: userData.role || "user",
      status: userData.status || "active",
    };

    const response = await api.post("/users", cleanData, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error("Error creating user:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to create user",
      errors: error.response?.data?.errors || [],
      error: error.response?.data || error.message,
    };
  }
};

/**
 * Update user
 */
export const updateUser = async (id, userData) => {
  try {
    const cleanData = {};

    if (userData.name !== undefined) cleanData.name = userData.name.trim();
    if (userData.email !== undefined) cleanData.email = userData.email.trim();
    if (userData.role !== undefined) cleanData.role = userData.role;
    if (userData.status !== undefined) cleanData.status = userData.status;
    if (userData.password !== undefined) cleanData.password = userData.password;

    const response = await api.put(`/users/${id}`, cleanData, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error(`Error updating user with ID ${id}:`, error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to update user",
      errors: error.response?.data?.errors || [],
      error: error.response?.data || error.message,
    };
  }
};

/**
 * Delete user
 */
export const deleteUser = async (id) => {
  try {
    const response = await api.delete(`/users/${id}`, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error(`Error deleting user with ID ${id}:`, error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to delete user",
      error: error.response?.data || error.message,
    };
  }
};

/**
 * Toggle user status (active/inactive)
 */
export const toggleUserStatus = async (id, status) => {
  try {
    const response = await api.patch(
      `/users/${id}/status`,
      { status },
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    console.error(`Error toggling user status for ID ${id}:`, error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to toggle user status",
      error: error.response?.data || error.message,
    };
  }
};

/**
 * Change user password
 */
export const changeUserPassword = async (id, currentPassword, newPassword) => {
  try {
    const response = await api.patch(
      `/users/${id}/password`,
      { currentPassword, newPassword },
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    console.error(`Error changing password for user ID ${id}:`, error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to change password",
      error: error.response?.data || error.message,
    };
  }
};

/**
 * Search users
 */
export const searchUsers = async (query, page = 1, limit = 10) => {
  try {
    const response = await api.get("/users/search", {
      params: {
        q: query,
        page,
        limit,
      },
      ...getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    console.error("Error searching users:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to search users",
      error: error.response?.data || error.message,
    };
  }
};

/**
 * Get user statistics
 */
export const getUserStats = async () => {
  try {
    const response = await api.get("/users/stats", getAuthHeader());
    return response.data;
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return {
      success: false,
      message:
        error.response?.data?.message || "Failed to fetch user statistics",
      error: error.response?.data || error.message,
    };
  }
};
