// back-end/src/controllers/songAlbumController.js
import { PrismaClient } from "@prisma/client";
import { validationResult } from "express-validator";

const prisma = new PrismaClient();

/**
 * @desc    Get all albums for a song
 * @route   GET /api/songs/:songId/albums
 * @access  Public
 */
export const getSongAlbums = async (req, res) => {
  try {
    const { songId } = req.params;

    // Check if song exists
    const song = await prisma.song.findUnique({
      where: { id: songId },
    });

    if (!song) {
      return res.status(404).json({
        success: false,
        message: "Song not found",
      });
    }

    const albums = await prisma.songAlbum.findMany({
      where: { songId },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({
      success: true,
      data: albums,
    });
  } catch (error) {
    console.error("Error getting song albums:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving song albums",
      error: error.message,
    });
  }
};

/**
 * @desc    Get album by ID
 * @route   GET /api/albums/:id
 * @access  Public
 */
export const getAlbumById = async (req, res) => {
  try {
    const album = await prisma.songAlbum.findUnique({
      where: { id: req.params.id },
      include: {
        song: {
          select: {
            id: true,
            title: true,
            artist: true,
          },
        },
      },
    });

    if (!album) {
      return res.status(404).json({
        success: false,
        message: "Album not found",
      });
    }

    res.status(200).json({
      success: true,
      data: album,
    });
  } catch (error) {
    console.error("Error getting album:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving album",
      error: error.message,
    });
  }
};

/**
 * @desc    Create a new album for a song
 * @route   POST /api/songs/:songId/albums
 * @access  Private
 */
export const createSongAlbum = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: errors.array(),
      });
    }

    const { songId } = req.params;
    const { albumName, artist, releaseDate, coverImage } = req.body;

    // Check if song exists
    const song = await prisma.song.findUnique({
      where: { id: songId },
    });

    if (!song) {
      return res.status(404).json({
        success: false,
        message: "Song not found",
      });
    }

    // Create new album
    const newAlbum = await prisma.songAlbum.create({
      data: {
        songId,
        albumName,
        artist: artist || null,
        releaseDate: releaseDate ? new Date(releaseDate) : null,
        coverImage: coverImage || null,
      },
    });

    res.status(201).json({
      success: true,
      message: "Album created successfully",
      data: newAlbum,
    });
  } catch (error) {
    console.error("Error creating album:", error);
    res.status(500).json({
      success: false,
      message: "Error creating album",
      error: error.message,
    });
  }
};

/**
 * @desc    Update album
 * @route   PUT /api/albums/:id
 * @access  Private
 */
export const updateSongAlbum = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: errors.array(),
      });
    }

    const { id } = req.params;
    const { albumName, artist, releaseDate, coverImage } = req.body;

    // Check if album exists
    const existingAlbum = await prisma.songAlbum.findUnique({
      where: { id },
    });

    if (!existingAlbum) {
      return res.status(404).json({
        success: false,
        message: "Album not found",
      });
    }

    // Update album
    const updatedAlbum = await prisma.songAlbum.update({
      where: { id },
      data: {
        albumName: albumName || existingAlbum.albumName,
        artist: artist !== undefined ? artist : existingAlbum.artist,
        releaseDate:
          releaseDate !== undefined
            ? releaseDate
              ? new Date(releaseDate)
              : null
            : existingAlbum.releaseDate,
        coverImage:
          coverImage !== undefined ? coverImage : existingAlbum.coverImage,
      },
    });

    res.status(200).json({
      success: true,
      message: "Album updated successfully",
      data: updatedAlbum,
    });
  } catch (error) {
    console.error("Error updating album:", error);
    res.status(500).json({
      success: false,
      message: "Error updating album",
      error: error.message,
    });
  }
};

/**
 * @desc    Delete album
 * @route   DELETE /api/albums/:id
 * @access  Private
 */
export const deleteSongAlbum = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if album exists
    const existingAlbum = await prisma.songAlbum.findUnique({
      where: { id },
    });

    if (!existingAlbum) {
      return res.status(404).json({
        success: false,
        message: "Album not found",
      });
    }

    // Delete album
    await prisma.songAlbum.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: "Album deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting album:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting album",
      error: error.message,
    });
  }
};

/**
 * @desc    Get all albums (for admin/management)
 * @route   GET /api/albums
 * @access  Public
 */
export const getAllAlbums = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [albums, totalAlbums] = await Promise.all([
      prisma.songAlbum.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          song: {
            select: {
              id: true,
              title: true,
              artist: true,
            },
          },
        },
      }),
      prisma.songAlbum.count(),
    ]);

    res.status(200).json({
      success: true,
      data: albums,
      pagination: {
        page,
        limit,
        totalAlbums,
        totalPages: Math.ceil(totalAlbums / limit),
      },
    });
  } catch (error) {
    console.error("Error getting all albums:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving albums",
      error: error.message,
    });
  }
};

/**
 * @desc    Search albums
 * @route   GET /api/albums/search
 * @access  Public
 */
export const searchAlbums = async (req, res) => {
  try {
    const { q } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    const searchConditions = {
      OR: [
        { albumName: { contains: q, mode: "insensitive" } },
        { artist: { contains: q, mode: "insensitive" } },
        {
          song: {
            OR: [
              { title: { contains: q, mode: "insensitive" } },
              { artist: { contains: q, mode: "insensitive" } },
            ],
          },
        },
      ],
    };

    const [albums, totalAlbums] = await Promise.all([
      prisma.songAlbum.findMany({
        where: searchConditions,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          song: {
            select: {
              id: true,
              title: true,
              artist: true,
            },
          },
        },
      }),
      prisma.songAlbum.count({ where: searchConditions }),
    ]);

    res.status(200).json({
      success: true,
      data: albums,
      pagination: {
        page,
        limit,
        totalAlbums,
        totalPages: Math.ceil(totalAlbums / limit),
      },
    });
  } catch (error) {
    console.error("Error searching albums:", error);
    res.status(500).json({
      success: false,
      message: "Error searching albums",
      error: error.message,
    });
  }
};
