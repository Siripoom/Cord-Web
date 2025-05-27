import prisma from "../config/db.js";
import { validationResult } from "express-validator";

/**
 * Helper function to parse lyrics raw string to array of {word, chord}
 * Format: "[C]Hello[G]world[Am]song"
 * Returns: [{word: "Hello", chord: "C"}, {word: "world", chord: "G"}, {word: "song", chord: "Am"}]
 */
/**
 * Helper function to parse lyrics raw string to array of {word, chord}
 * Format: "Intro / Am / Am / [C]Hello[G]world[Am]song"
 * Returns: [{word: "Intro / Am / Am / ", chord: null}, {word: "Hello", chord: "C"}, {word: "world", chord: "G"}, {word: "song", chord: "Am"}]
 */
function parseLyricsRaw(raw) {
  if (!raw || typeof raw !== "string") return [];

  const result = [];

  // Check if there are any chords in the text
  const hasChords = /\[[^\]]*\]/.test(raw);

  if (!hasChords) {
    // No chords found, treat entire text as one word
    result.push({
      word: raw,
      chord: null,
    });
    return result;
  }

  // Extract all chords and their positions
  const chords = [];
  const chordRegex = /\[([^\]]*)\]/g;
  let match;

  while ((match = chordRegex.exec(raw)) !== null) {
    chords.push({
      chord: match[1],
      position: match.index,
      fullMatch: match[0],
    });
  }

  let currentPos = 0;

  for (let i = 0; i < chords.length; i++) {
    const chordInfo = chords[i];

    // Add any text before this chord (only if it exists)
    if (chordInfo.position > currentPos) {
      const textBefore = raw.substring(currentPos, chordInfo.position);
      if (textBefore) {
        result.push({
          word: textBefore,
          chord: null,
        });
      }
    }

    // Move position past the chord
    currentPos = chordInfo.position + chordInfo.fullMatch.length;

    // Find the text that follows this chord (until next chord or end)
    let textAfter = "";
    const nextChord = chords[i + 1];

    if (nextChord) {
      textAfter = raw.substring(currentPos, nextChord.position);
    } else {
      textAfter = raw.substring(currentPos);
    }

    // Add the text with the chord (even if text is empty)
    result.push({
      word: textAfter,
      chord: chordInfo.chord,
    });

    // Update current position for next iteration
    if (nextChord) {
      currentPos = nextChord.position;
    } else {
      currentPos = raw.length;
      break; // We've processed everything
    }
  }

  return result;
}

/**
 * @desc    Get all songs with pagination
 * @route   GET /api/songs
 * @access  Public
 */
export const getAllSongs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || "";

    // Build where clause for search
    const whereClause = search
      ? {
          OR: [
            { title: { contains: search, mode: "insensitive" } },
            { artist: { contains: search, mode: "insensitive" } },
          ],
        }
      : {};

    const totalSongs = await prisma.song.count({ where: whereClause });

    const songs = await prisma.song.findMany({
      where: whereClause,
      skip,
      take: limit,
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
          },
        },
        lyrics: {
          orderBy: { wordOrder: "asc" },
          select: {
            id: true,
            word: true,
            chord: true,
            wordOrder: true,
          },
        },
        _count: {
          select: {
            lyrics: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
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
 * @desc    Get song by ID with lyrics
 * @route   GET /api/songs/:id
 * @access  Public
 */
export const getSongById = async (req, res) => {
  try {
    const song = await prisma.song.findUnique({
      where: { id: req.params.id },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
          },
        },
        lyrics: {
          orderBy: { wordOrder: "asc" },
          select: {
            id: true,
            word: true,
            chord: true,
            wordOrder: true,
          },
        },
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
 * @desc    Create a new song with lyrics
 * @route   POST /api/songs
 * @access  Private
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

    // Get creator ID from authenticated user (optional)
    const creatorId = req.user?.id || null;

    // Clean categoryId - convert empty string to null
    const cleanCategoryId =
      categoryId && categoryId.trim() ? categoryId.trim() : null;

    // Start transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create song first
      const song = await tx.song.create({
        data: {
          title: title.trim(),
          artist: artist.trim(),
          defaultKey,
          categoryId: cleanCategoryId,
          creatorId,
        },
      });

      // Parse lyrics and create lyric records
      if (lyrics && lyrics.trim()) {
        const parsedLyrics = parseLyricsRaw(lyrics.trim());

        if (parsedLyrics.length > 0) {
          const lyricsData = parsedLyrics.map((item, index) => ({
            songId: song.id,
            wordOrder: index,
            word: item.word,
            chord: item.chord,
          }));

          await tx.lyric.createMany({
            data: lyricsData,
          });
        }
      }

      // Return created song with lyrics
      return await tx.song.findUnique({
        where: { id: song.id },
        include: {
          lyrics: { orderBy: { wordOrder: "asc" } },
          category: { select: { id: true, name: true } },
          creator: { select: { id: true, name: true } },
        },
      });
    });

    res.status(201).json({
      success: true,
      message: "Song created successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error creating song:", error);

    if (error.code === "P2003") {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID provided",
      });
    }

    res.status(500).json({
      success: false,
      message: "Error creating song",
      error: error.message,
    });
  }
};

/**
 * @desc    Update a song with lyrics
 * @route   PUT /api/songs/:id
 * @access  Private
 */
export const updateSong = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: errors.array(),
      });
    }

    const songId = req.params.id;
    const { title, artist, lyrics, defaultKey, categoryId } = req.body;

    // Clean categoryId - convert empty string to null
    const cleanCategoryId =
      categoryId !== undefined
        ? categoryId && categoryId.trim()
          ? categoryId.trim()
          : null
        : undefined;

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

    // Start transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update song basic info
      const updateData = {};
      if (title !== undefined) updateData.title = title.trim();
      if (artist !== undefined) updateData.artist = artist.trim();
      if (defaultKey !== undefined) updateData.defaultKey = defaultKey;
      if (cleanCategoryId !== undefined)
        updateData.categoryId = cleanCategoryId;

      await tx.song.update({
        where: { id: songId },
        data: updateData,
      });

      // Update lyrics if provided
      if (lyrics !== undefined) {
        // Delete existing lyrics
        await tx.lyric.deleteMany({
          where: { songId },
        });

        // Parse and create new lyrics
        if (lyrics.trim()) {
          const parsedLyrics = parseLyricsRaw(lyrics.trim());

          if (parsedLyrics.length > 0) {
            const lyricsData = parsedLyrics.map((item, index) => ({
              songId,
              wordOrder: index,
              word: item.word,
              chord: item.chord,
            }));

            await tx.lyric.createMany({
              data: lyricsData,
            });
          }
        }
      }

      // Return updated song with lyrics
      return await tx.song.findUnique({
        where: { id: songId },
        include: {
          lyrics: { orderBy: { wordOrder: "asc" } },
          category: { select: { id: true, name: true } },
          creator: { select: { id: true, name: true } },
        },
      });
    });

    res.status(200).json({
      success: true,
      message: "Song updated successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error updating song:", error);

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
      error: error.message,
    });
  }
};

/**
 * @desc    Delete a song and its lyrics
 * @route   DELETE /api/songs/:id
 * @access  Private
 */
export const deleteSong = async (req, res) => {
  try {
    const songId = req.params.id;

    // Check if song exists
    const songExists = await prisma.song.findUnique({
      where: { id: songId },
    });

    if (!songExists) {
      return res.status(404).json({
        success: false,
        message: "Song not found",
      });
    }

    // Delete song and its lyrics (cascade delete)
    await prisma.$transaction(async (tx) => {
      // Delete lyrics first
      await tx.lyric.deleteMany({
        where: { songId },
      });

      // Delete song
      await tx.song.delete({
        where: { id: songId },
      });
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

/**
 * @desc    Search songs
 * @route   GET /api/songs/search
 * @access  Public
 */
export const searchSongs = async (req, res) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    if (!q || q.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    const searchQuery = q.trim();
    const whereClause = {
      OR: [
        { title: { contains: searchQuery, mode: "insensitive" } },
        { artist: { contains: searchQuery, mode: "insensitive" } },
        { category: { name: { contains: searchQuery, mode: "insensitive" } } },
      ],
    };

    const totalSongs = await prisma.song.count({ where: whereClause });

    const songs = await prisma.song.findMany({
      where: whereClause,
      skip,
      take: parseInt(limit),
      include: {
        category: { select: { id: true, name: true } },
        creator: { select: { id: true, name: true } },
        _count: { select: { lyrics: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({
      success: true,
      data: songs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalSongs,
        totalPages: Math.ceil(totalSongs / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Error searching songs:", error);
    res.status(500).json({
      success: false,
      message: "Error searching songs",
      error: error.message,
    });
  }
};
