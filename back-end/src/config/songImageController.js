// back-end/src/controllers/song   Controller.js
import prisma from "../config/db.js";
import { uploadToSupabase, deleteFromSupabase } from "../config/supabase.js";
import { generateFilename } from "../config/multer.js";
import sharp from "sharp";

/**
 * @desc    Upload    s for a song
 * @route   POST /api/songs/:id/   s
 * @access  Private
 */
export const uploadSong   s = async (req, res) => {
  try {
    const songId = req.params.id;
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No files uploaded",
      });
    }

    // Check if song exists
    const song = await prisma.song.findUnique({
      where: { id: songId },
      include: {    s: true },
    });

    if (!song) {
      return res.status(404).json({
        success: false,
        message: "Song not found",
      });
    }

    // Check total    s limit (current + new should not exceed 6)
    const current   Count = song.   s.length;
    if (current   Count + files.length > 6) {
      return res.status(400).json({
        success: false,
        message: `Cannot upload ${files.length}    s. Maximum 6    s per song. Currently have ${current   Count}    s.`,
      });
    }

    const uploadResults = [];
    const failedUploads = [];

    // Process each file
    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      try {
        // Optimize     with Sharp
        const optimizedBuffer = await sharp(file.buffer)
          .resize(1200, 1200, {
            fit: "inside",
            withoutEnlargement: true,
          })
          .jpeg({ quality: 85 })
          .toBuffer();

        // Create optimized file object
        const optimizedFile = {
          buffer: optimizedBuffer,
          mimetype: "   /jpeg",
          originalname: file.originalname,
        };

        // Generate unique filename
        const filename = generateFilename(file.originalname);

        // Upload to Supabase
        const uploadResult = await uploadToSupabase(optimizedFile, filename);

        if (uploadResult.success) {
          // แก้ไข URL ให้ถูกต้อง - เพิ่ม CORS headers และ cache control
          let finalUrl = uploadResult.url;

          // ตรวจสอบว่า URL มี query parameters หรือไม่
          if (!finalUrl.includes("?")) {
            finalUrl += "?t=" + Date.now(); // เพิ่ม cache buster
          }

          // Save to database
          const    Record = await prisma.song   .create({
            data: {
              songId: songId,
              filename: file.originalname,
              url: finalUrl, // ใช้ URL ที่แก้ไขแล้ว
              size: optimizedBuffer.length,
              mimeType: "   /jpeg",
              order: current   Count + i,
              storagePath: uploadResult.key, // เก็บ path สำหรับ Supabase
            },
          });

          uploadResults.push(   Record);

          console.log(`✅ Successfully uploaded     ${i + 1}:`, {
            id:    Record.id,
            filename:    Record.filename,
            url:    Record.url,
            size:    Record.size,
          });
        } else {
          failedUploads.push({
            filename: file.originalname,
            error: uploadResult.error,
          });

          console.error(
            `❌ Failed to upload ${file.originalname}:`,
            uploadResult.error
          );
        }
      } catch (error) {
        console.error(`Error processing file ${file.originalname}:`, error);
        failedUploads.push({
          filename: file.originalname,
          error: error.message,
        });
      }
    }

    // Log final results
    console.log("Upload Summary:", {
      total: files.length,
      successful: uploadResults.length,
      failed: failedUploads.length,
      songId: songId,
    });

    res.status(200).json({
      success: true,
      message: `Successfully uploaded ${uploadResults.length}    s`,
      data: {
        uploaded: uploadResults,
        failed: failedUploads,
      },
    });
  } catch (error) {
    console.error("Error uploading song    s:", error);
    res.status(500).json({
      success: false,
      message: "Error uploading    s",
      error: error.message,
    });
  }
};

/**
 * @desc    Get    s for a song
 * @route   GET /api/songs/:id/   s
 * @access  Public
 */
export const getSong   s = async (req, res) => {
  try {
    const songId = req.params.id;

    const    s = await prisma.song   .findMany({
      where: { songId },
      orderBy: { order: "asc" },
    });

    // แก้ไข URL ให้แสดงผลได้ - เพิ่ม headers และ cache control
    const    sWithFixedUrls =    s.map((   ) => {
      let fixedUrl =    .url;

      // เพิ่ม cache buster ถ้ายังไม่มี
      if (!fixedUrl.includes("?")) {
        fixedUrl += "?t=" + Date.now();
      }

      return {
        ...   ,
        url: fixedUrl,
      };
    });

    // console.log(`📷 Retrieved ${   s.length}    s for song ${songId}`);

    // Debug: Log     URLs
       sWithFixedUrls.forEach((   , index) => {
      console.log(`    ${index + 1}:`, {
        id:    .id,
        filename:    .filename,
        url:    .url,
        size:    .size,
      });
    });

    res.status(200).json({
      success: true,
      data:    sWithFixedUrls,
    });
  } catch (error) {
    console.error("Error fetching song    s:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching    s",
      error: error.message,
    });
  }
};

/**
 * @desc    Delete a song    
 * @route   DELETE /api/songs/:songId/   s/:   Id
 * @access  Private
 */
export const deleteSong    = async (req, res) => {
  try {
    const { songId,    Id } = req.params;

    // Find the    
    const     = await prisma.song   .findFirst({
      where: {
        id:    Id,
        songId: songId,
      },
    });

    if (!   ) {
      return res.status(404).json({
        success: false,
        message: "    not found",
      });
    }

    // Delete from Supabase using storagePath
    let deleteResult = { success: true };
    if (   .storagePath) {
      deleteResult = await deleteFromSupabase(   .storagePath);
      if (!deleteResult.success) {
        console.error("Failed to delete from Supabase:", deleteResult.error);
        // Continue with database deletion even if Supabase deletion fails
      }
    }

    // Delete from database
    await prisma.song   .delete({
      where: { id:    Id },
    });

    // Reorder remaining    s
    const remaining   s = await prisma.song   .findMany({
      where: { songId },
      orderBy: { order: "asc" },
    });

    // Update order
    for (let i = 0; i < remaining   s.length; i++) {
      await prisma.song   .update({
        where: { id: remaining   s[i].id },
        data: { order: i },
      });
    }

    console.log(`🗑️ Deleted     ${   Id} from song ${songId}`);

    res.status(200).json({
      success: true,
      message: "    deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting song    :", error);
    res.status(500).json({
      success: false,
      message: "Error deleting    ",
      error: error.message,
    });
  }
};

/**
 * @desc    Reorder song    s
 * @route   PUT /api/songs/:id/   s/reorder
 * @access  Private
 */
export const reorderSong   s = async (req, res) => {
  try {
    const songId = req.params.id;
    const {    Ids } = req.body; // Array of     IDs in new order

    if (!Array.isArray(   Ids)) {
      return res.status(400).json({
        success: false,
        message: "   Ids must be an array",
      });
    }

    // Verify all    s belong to this song
    const    s = await prisma.song   .findMany({
      where: {
        songId,
        id: { in:    Ids },
      },
    });

    if (   s.length !==    Ids.length) {
      return res.status(400).json({
        success: false,
        message: "Some    s do not belong to this song",
      });
    }

    // Update order
    for (let i = 0; i <    Ids.length; i++) {
      await prisma.song   .update({
        where: { id:    Ids[i] },
        data: { order: i },
      });
    }

    // Return updated    s with fixed URLs
    const updated   s = await prisma.song   .findMany({
      where: { songId },
      orderBy: { order: "asc" },
    });

    const    sWithFixedUrls = updated   s.map((   ) => {
      let fixedUrl =    .url;
      if (!fixedUrl.includes("?")) {
        fixedUrl += "?t=" + Date.now();
      }
      return {
        ...   ,
        url: fixedUrl,
      };
    });

    console.log(`🔄 Reordered ${   Ids.length}    s for song ${songId}`);

    res.status(200).json({
      success: true,
      message: "   s reordered successfully",
      data:    sWithFixedUrls,
    });
  } catch (error) {
    console.error("Error reordering song    s:", error);
    res.status(500).json({
      success: false,
      message: "Error reordering    s",
      error: error.message,
    });
  }
};

/**
 * @desc    Test     URL access
 * @route   GET /api/songs/test-   -access
 * @access  Public
 */
export const test   Access = async (req, res) => {
  try {
    // ดึงรูปภาพตัวอย่างมา test
    const sample    = await prisma.song   .findFirst({
      orderBy: { createdAt: "desc" },
    });

    if (!sample   ) {
      return res.status(404).json({
        success: false,
        message: "No    s found to test",
      });
    }

    // ทดสอบ URL หลายแบบ
    const baseUrl = sample   .url.split("?")[0]; // Remove query params
    const testUrls = [
      sample   .url, // Original URL
      baseUrl, // URL without query params
      baseUrl + "?t=" + Date.now(), // With cache buster
      baseUrl + "?download=true", // With download flag
    ];

    res.status(200).json({
      success: true,
      message: "Test URLs generated",
      data: {
        original   : sample   ,
        testUrls: testUrls,
        instructions: "Try each URL in your browser to see which one works",
      },
    });
  } catch (error) {
    console.error("Error testing     access:", error);
    res.status(500).json({
      success: false,
      message: "Error testing     access",
      error: error.message,
    });
  }
};
