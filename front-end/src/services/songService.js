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
 * Get all songs with pagination and search
 */
export const getAllSongs = async (page = 1, limit = 10, search = "") => {
  try {
    const params = { page, limit };
    if (search) params.search = search;

    const response = await api.get("/songs", { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching songs:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to fetch songs",
      error: error.response?.data || error.message,
    };
  }
};

/**
 * Get song by ID with full lyrics
 */
export const getSongById = async (id) => {
  try {
    const response = await api.get(`/songs/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching song with ID ${id}:`, error);
    return {
      success: false,
      message:
        error.response?.data?.message || `Failed to fetch song with ID ${id}`,
      error: error.response?.data || error.message,
    };
  }
};

/**
 * Create new song with lyrics
 */
export const createSong = async (songData) => {
  console.log("Creating song with data:", songData);
  try {
    const cleanData = {
      title: songData.title?.trim(),
      artist: songData.artist?.trim(),
      lyrics: songData.lyrics?.trim(),
      defaultKey: songData.defaultKey,
      categoryId: songData.categoryId || null, // Convert empty string to null
    };

    const response = await api.post("/songs", cleanData, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error("Error creating song:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to create song",
      errors: error.response?.data?.errors || [],
      error: error.response?.data || error.message,
    };
  }
};

/**
 * Update song with lyrics
 */
export const updateSong = async (id, songData) => {
  try {
    // Clean up data and remove undefined values
    const cleanData = {};

    if (songData.title !== undefined) cleanData.title = songData.title.trim();
    if (songData.artist !== undefined)
      cleanData.artist = songData.artist.trim();
    if (songData.lyrics !== undefined)
      cleanData.lyrics = songData.lyrics.trim();
    if (songData.defaultKey !== undefined)
      cleanData.defaultKey = songData.defaultKey;
    if (songData.categoryId !== undefined)
      cleanData.categoryId = songData.categoryId || null; // Convert empty string to null

    const response = await api.put(`/songs/${id}`, cleanData, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error(`Error updating song with ID ${id}:`, error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to update song",
      errors: error.response?.data?.errors || [],
      error: error.response?.data || error.message,
    };
  }
};

/**
 * Delete song
 */
export const deleteSong = async (id) => {
  try {
    const response = await api.delete(`/songs/${id}`, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error(`Error deleting song with ID ${id}:`, error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to delete song",
      error: error.response?.data || error.message,
    };
  }
};

/**
 * Search songs
 */
export const searchSongs = async (query, page = 1, limit = 10) => {
  try {
    const response = await api.get("/songs/search", {
      params: {
        q: query,
        page,
        limit,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error searching songs:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to search songs",
      error: error.response?.data || error.message,
    };
  }
};

/**
 * Get all categories
 */
export const getAllCategories = async () => {
  try {
    const response = await api.get("/categories");
    return response.data;
  } catch (error) {
    console.error("Error fetching categories:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to fetch categories",
      error: error.response?.data || error.message,
    };
  }
};

/**
 * Create new category
 */
export const createCategory = async (categoryData) => {
  try {
    const response = await api.post(
      "/categories",
      categoryData,
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    console.error("Error creating category:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to create category",
      error: error.response?.data || error.message,
    };
  }
};

/**
 * Update category
 */
export const updateCategory = async (id, categoryData) => {
  try {
    const response = await api.put(
      `/categories/${id}`,
      categoryData,
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    console.error(`Error updating category with ID ${id}:`, error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to update category",
      error: error.response?.data || error.message,
    };
  }
};

/**
 * Delete category
 */
export const deleteCategory = async (id) => {
  try {
    const response = await api.delete(`/categories/${id}`, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error(`Error deleting category with ID ${id}:`, error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to delete category",
      error: error.response?.data || error.message,
    };
  }
};

/**
 * Get songs by category ID
 */
export const getSongsByCategory = async (categoryId, page = 1, limit = 10) => {
  try {
    const response = await api.get(`/categories/${categoryId}/songs`, {
      params: { page, limit },
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching songs for category ${categoryId}:`, error);
    return {
      success: false,
      message:
        error.response?.data?.message || "Failed to fetch songs by category",
      error: error.response?.data || error.message,
    };
  }
};

// ==================== ALBUM SERVICES ====================

/**
 * Get all albums with pagination
 */
export const getAllAlbums = async (page = 1, limit = 10) => {
  try {
    const params = { page, limit };
    const response = await api.get("/albums", { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching albums:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to fetch albums",
      error: error.response?.data || error.message,
    };
  }
};

/**
 * Get albums for a specific song
 */
export const getSongAlbums = async (songId) => {
  try {
    const response = await api.get(`/albums/songs/${songId}/albums`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching albums for song ${songId}:`, error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to fetch song albums",
      error: error.response?.data || error.message,
    };
  }
};

/**
 * Get album by ID
 */
export const getAlbumById = async (id) => {
  try {
    const response = await api.get(`/albums/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching album with ID ${id}:`, error);
    return {
      success: false,
      message:
        error.response?.data?.message || `Failed to fetch album with ID ${id}`,
      error: error.response?.data || error.message,
    };
  }
};

/**
 * Create new album for a song
 */
export const createSongAlbum = async (songId, albumData) => {
  try {
    const cleanData = {
      albumName: albumData.albumName?.trim(),
      artist: albumData.artist?.trim() || null,
      releaseDate: albumData.releaseDate || null,
      coverImage: albumData.coverImage?.trim() || null,
    };

    const response = await api.post(
      `/albums/songs/${songId}/albums`,
      cleanData,
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    console.error("Error creating album:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to create album",
      errors: error.response?.data?.errors || [],
      error: error.response?.data || error.message,
    };
  }
};

/**
 * Update album
 */
export const updateAlbum = async (id, albumData) => {
  try {
    const cleanData = {};

    if (albumData.albumName !== undefined)
      cleanData.albumName = albumData.albumName.trim();
    if (albumData.artist !== undefined)
      cleanData.artist = albumData.artist?.trim() || null;
    if (albumData.releaseDate !== undefined)
      cleanData.releaseDate = albumData.releaseDate || null;
    if (albumData.coverImage !== undefined)
      cleanData.coverImage = albumData.coverImage?.trim() || null;

    const response = await api.put(`/albums/${id}`, cleanData, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error(`Error updating album with ID ${id}:`, error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to update album",
      errors: error.response?.data?.errors || [],
      error: error.response?.data || error.message,
    };
  }
};

/**
 * Delete album
 */
export const deleteAlbum = async (id) => {
  try {
    const response = await api.delete(`/albums/${id}`, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error(`Error deleting album with ID ${id}:`, error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to delete album",
      error: error.response?.data || error.message,
    };
  }
};

/**
 * Search albums
 */
export const searchAlbums = async (query, page = 1, limit = 10) => {
  try {
    const response = await api.get("/albums/search", {
      params: {
        q: query,
        page,
        limit,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error searching albums:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to search albums",
      error: error.response?.data || error.message,
    };
  }
};
