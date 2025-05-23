import prisma from "../config/db.js";
import { validationResult } from "express-validator";

/**
 * @desc    Get all songs with pagination
 * @route   GET /api/songs
 * @access  Public
 */
export const getAllSongs = async (req, res) => {
  try {
    // Parse pagination parameters with defaults
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get total count for pagination
    const totalSongs = await prisma.song.count();

    // Get songs with pagination
    const songs = await prisma.song.findMany({
      skip,
      take: limit,
      include: {
        category: true,
       
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json({
      success: true,
      data: songs,
      pagination: {
        page,
        limit,
        totalSongs,
        totalPages: Math.ceil(totalSongs / limit),
      },
    });
  } catch (error) {
    console.error("Error getting songs:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving songs",
      error: error.message,
    });
  }
};

/**
 * @desc    Get song by ID
 * @route   GET /api/songs/:id
 * @access  Public
 */
export const getSongById = async (req, res) => {
  try {
    const song = await prisma.song.findUnique({
      where: { id: req.params.id }, // Use UUID directly, no parsing needed
      include: {
        category: true,
        // createdBy: {
        //   select: {
        //     id: true,
        //     name: true,
        //   },
        // },
      },
    });

    if (!song) {
      return res.status(404).json({
        success: false,
        message: "Song not found",
      });
    }

    res.status(200).json({
      success: true,
      data: song,
    });
  } catch (error) {
    console.error("Error getting song:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving song",
      error: error.message,
    });
  }
};

/**
 * @desc    Create a new song
 * @route   POST /api/songs
 * @access  Private/Admin
 */
export const createSong = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: errors.array(),
      });
    }

    const { title, artist, lyrics, defaultKey, categoryId } = req.body;

    const song = await prisma.song.create({
      data: {
        title,
        artist,
        lyrics,
        defaultKey,
        categoryId, // Use UUID directly, no parsing needed
        // creatorId: req.user.id,
      },
    });

    res.status(201).json({
      success: true,
      message: "Song created successfully",
      data: song,
    });
  } catch (error) {
    console.error("Error creating song:", error);
    res.status(500).json({
      success: false,
      message: "Error creating song",
      error: error.message,
    });
  }
};

/**
 * @desc    Update a song
 * @route   PUT /api/songs/:id
 * @access  Private/Admin
 */
export const updateSong = async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: errors.array().map((err) => ({
          field: err.path,
          message: err.msg,
        })),
      });
    }

    const songId = req.params.id;
    const updateData = {};

    // Only include fields that were actually provided
    const { title, artist, lyrics, defaultKey, categoryId } = req.body;

    if (title !== undefined) updateData.title = title;
    if (artist !== undefined) updateData.artist = artist;
    if (lyrics !== undefined) updateData.lyrics = lyrics;
    if (defaultKey !== undefined) updateData.defaultKey = defaultKey;
    if (categoryId !== undefined) updateData.categoryId = categoryId;

    // Check if song exists
    const existingSong = await prisma.song.findUnique({
      where: { id: songId },
    });

    if (!existingSong) {
      return res.status(404).json({
        success: false,
        message: "Song not found",
      });
    }

    // Update song
    const updatedSong = await prisma.song.update({
      where: { id: songId },
      data: updateData,
      include: {
        category: true,
      },
    });

    res.status(200).json({
      success: true,
      message: "Song updated successfully",
      data: updatedSong,
    });
  } catch (error) {
    console.error("Error updating song:", error);

    // Handle Prisma specific errors
    if (error.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "Song not found",
      });
    }

    if (error.code === "P2003") {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID provided",
      });
    }

    res.status(500).json({
      success: false,
      message: "Error updating song",
      error:
        process.env.NODE_ENV === "production"
          ? "Internal server error"
          : error.message,
    });
  }
};
/**
 * @desc    Delete a song
 * @route   DELETE /api/songs/:id
 * @access  Private/Admin
 */
export const deleteSong = async (req, res) => {
  try {
    // Check if song exists
    const songExists = await prisma.song.findUnique({
      where: { id: req.params.id }, // Use UUID directly
    });

    if (!songExists) {
      return res.status(404).json({
        success: false,
        message: "Song not found",
      });
    }

    await prisma.song.delete({
      where: { id: req.params.id }, // Use UUID directly
    });

    res.status(200).json({
      success: true,
      message: "Song deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting song:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting song",
      error: error.message,
    });
  }
};
