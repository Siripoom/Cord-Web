import prisma from "../config/db.js";
import { validationResult } from "express-validator";

/**
 * Helper ฟังก์ชัน แปลง lyrics raw string เป็น array ของ {word, chord}
 * รูปแบบ raw สมมติ: "[C]เธอจะ [G7]ฉัน [F]แล้วนะ"
 * ปรับตาม format input จริงได้ครับ
 */
function parseLyricsRaw(raw) {
  const regex = /\[([^\]]+)\]([^\[]+)/g;
  let result = [];
  let match;
  while ((match = regex.exec(raw)) !== null) {
    result.push({ chord: match[1], word: match[2].trim() });
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

    const totalSongs = await prisma.song.count();

    const songs = await prisma.song.findMany({
      skip,
      take: limit,
      include: {
        category: true,
        // creator: {
        //   select: { id: true, name: true },
        // },
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
 * @desc    Get song by ID พร้อมเนื้อเพลงแยกคำ+คอร์ด
 * @route   GET /api/songs/:id
 * @access  Public
 */
export const getSongById = async (req, res) => {
  try {
    const song = await prisma.song.findUnique({
      where: { id: req.params.id },
      include: {
        category: true,
        // creator: {
        //   select: { id: true, name: true },
        // },
        lyrics: {
          orderBy: { wordOrder: "asc" },
          select: { word: true, chord: true, wordOrder: true },
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
 * @desc    Create a new song พร้อมเพิ่มเนื้อเพลงแยกคำ+คอร์ด
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

    // สมมติ req.user.id มี user id ที่ login อยู่
    const creatorId = req.user?.id || "some-default-id";

    // สร้างเพลงก่อน
    const song = await prisma.song.create({
      data: {
        title,
        artist,
        defaultKey,
        categoryId,
        creatorId,
      },
    });

    // แปลง lyrics raw string เป็น array ของคำ+คอร์ด
    // ตัวอย่าง parse function ด้านบน
    const parsedLyrics = parseLyricsRaw(lyrics);

    // สร้าง Lyric ทีละคำ
    const lyricsData = parsedLyrics.map((item, index) => ({
      songId: song.id,
      wordOrder: index,
      word: item.word,
      chord: item.chord,
    }));

    await prisma.lyric.createMany({
      data: lyricsData,
    });

    // ดึงข้อมูลเพลงพร้อมเนื้อเพลงใหม่กลับมา
    const createdSong = await prisma.song.findUnique({
      where: { id: song.id },
      include: {
        lyrics: { orderBy: { wordOrder: "asc" } },
        category: true,
        creator: { select: { id: true, name: true } },
      },
    });

    res.status(201).json({
      success: true,
      message: "Song created successfully",
      data: createdSong,
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
 * @desc    Update a song พร้อมแก้ไขเนื้อเพลง
 * @route   PUT /api/songs/:id
 * @access  Private/Admin
 */
export const updateSong = async (req, res) => {
  try {
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
    const { title, artist, lyrics, defaultKey, categoryId } = req.body;

    // เช็คเพลงก่อนว่ามีหรือไม่
    const existingSong = await prisma.song.findUnique({
      where: { id: songId },
    });

    if (!existingSong) {
      return res.status(404).json({
        success: false,
        message: "Song not found",
      });
    }

    // อัพเดตข้อมูลเพลงที่ไม่ใช่เนื้อเพลงก่อน
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (artist !== undefined) updateData.artist = artist;
    if (defaultKey !== undefined) updateData.defaultKey = defaultKey;
    if (categoryId !== undefined) updateData.categoryId = categoryId;

    await prisma.song.update({
      where: { id: songId },
      data: updateData,
    });

    // ถ้ามี lyrics ให้ลบของเก่าก่อน แล้วเพิ่มของใหม่
    if (lyrics !== undefined) {
      // ลบ Lyric เก่าของเพลงนี้ทั้งหมด
      await prisma.lyric.deleteMany({
        where: { songId },
      });

      // แปลง lyrics raw เป็น array
      const parsedLyrics = parseLyricsRaw(lyrics);

      const lyricsData = parsedLyrics.map((item, index) => ({
        songId,
        wordOrder: index,
        word: item.word,
        chord: item.chord,
      }));

      await prisma.lyric.createMany({
        data: lyricsData,
      });
    }

    // ดึงข้อมูลเพลงพร้อมเนื้อเพลงกลับมา
    const updatedSong = await prisma.song.findUnique({
      where: { id: songId },
      include: {
        lyrics: { orderBy: { wordOrder: "asc" } },
        category: true,
        creator: { select: { id: true, name: true } },
      },
    });

    res.status(200).json({
      success: true,
      message: "Song updated successfully",
      data: updatedSong,
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
      error:
        process.env.NODE_ENV === "production"
          ? "Internal server error"
          : error.message,
    });
  }
};

/**
 * @desc    Delete a song และเนื้อเพลงที่เกี่ยวข้อง
 * @route   DELETE /api/songs/:id
 * @access  Private/Admin
 */
export const deleteSong = async (req, res) => {
  try {
    // เช็คว่ามีเพลงหรือไม่
    const songExists = await prisma.song.findUnique({
      where: { id: req.params.id },
    });

    if (!songExists) {
      return res.status(404).json({
        success: false,
        message: "Song not found",
      });
    }

    // ลบเนื้อเพลงก่อน (ถ้ามี)
    await prisma.lyric.deleteMany({
      where: { songId: req.params.id },
    });

    // ลบเพลง
    await prisma.song.delete({
      where: { id: req.params.id },
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
