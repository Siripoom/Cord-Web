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
const authHeader = () => {
  const token = localStorage.getItem("token");    
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

/**
 * Get all songs with pagination
 */
export const getAllSongs = async (page = 1, limit = 10) => {
  try {
    const response = await api.get("/songs", {
      params: {
        page,
        limit,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching songs:", error);
    throw error;
  }
};

/**
 * Get song by ID
 */
export const getSongById = async (id, token) => {
  try {
    const response = await api.get(
      `/songs/${id}`,
      token ? authHeader(token) : {}
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching song with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Create new song
 */
export const createSong = async (songData, token) => {
  try {
    const response = await api.post("/songs", songData, authHeader(token));
    return response.data;
  } catch (error) {
    console.error("Error creating song:", error);
    throw error;
  }
};

/**
 * Update song
 */
export const updateSong = async (id, songData, token) => {
  try {
    // Clean up undefined values from songData
    const cleanData = Object.fromEntries(
      Object.entries(songData).filter(([_, v]) => v !== undefined)
    );

    const response = await api.put(`/songs/${id}`, cleanData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Error updating song with ID ${id}:`, error);
    // Return error information in a structured way
    return {
      success: false,
      message: error.response?.data?.message || "Failed to update song",
      error: error.response?.data || error.message,
    };
  }
};

/**
 * Delete song
 */
export const deleteSong = async (id, token) => {
  try {
    const response = await api.delete(`/songs/${id}`, authHeader(token));
    return response.data;
  } catch (error) {
    console.error(`Error deleting song with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Search songs
 */
export const searchSongs = async (query, page = 1, limit = 10, token) => {
  try {
    const response = await api.get(
      `/songs/search?q=${encodeURIComponent(
        query
      )}&page=${page}&limit=${limit}`,
      token ? authHeader(token) : {}
    );
    return response.data;
  } catch (error) {
    console.error("Error searching songs:", error);
    throw error;
  }
};

/**
 * Get recent songs
 */
export const getRecentSongs = async (page = 1, limit = 10, token) => {
  try {
    const response = await api.get(
      `/songs/recent?page=${page}&limit=${limit}`,
      token ? authHeader(token) : {}
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching recent songs:", error);
    throw error;
  }
};

/**
 * Get popular songs
 */
export const getPopularSongs = async (page = 1, limit = 10, token) => {
  try {
    const response = await api.get(
      `/songs/popular?page=${page}&limit=${limit}`,
      token ? authHeader(token) : {}
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching popular songs:", error);
    throw error;
  }
};

/**
 * Get all categories
 */
export const getAllCategories = async (token) => {
  try {
    const response = await api.get(
      "/categories",
      token ? authHeader(token) : {}
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
};

/**
 * Get songs by category ID
 */
export const getSongsByCategory = async (
  categoryId,
  page = 1,
  limit = 10,
  token
) => {
  try {
    const response = await api.get(
      `/categories/${categoryId}/songs?page=${page}&limit=${limit}`,
      token ? authHeader(token) : {}
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching songs for category ${categoryId}:`, error);
    throw error;
  }
};

/**
 * Create new category
 */
export const createCategory = async (categoryData, token) => {
  try {
    const response = await api.post(
      "/categories",
      categoryData,
      authHeader(token)
    );
    return response.data;
  } catch (error) {
    console.error("Error creating category:", error);
    throw error;
  }
};

/**
 * Update category
 */
export const updateCategory = async (id, categoryData, token) => {
  try {
    const response = await api.put(
      `/categories/${id}`,
      categoryData,
      authHeader(token)
    );
    return response.data;
  } catch (error) {
    console.error(`Error updating category with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Delete category
 */
export const deleteCategory = async (id, token) => {
  try {
    const response = await api.delete(`/categories/${id}`, authHeader(token));
    return response.data;
  } catch (error) {
    console.error(`Error deleting category with ID ${id}:`, error);
    throw error;
  }
};
