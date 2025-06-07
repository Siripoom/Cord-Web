// back-end/src/controllers/songImageController.js
import prisma from "../config/db.js";
import { uploadToSupabase, deleteFromSupabase } from "../config/supabase.js";
import { generateFilename } from "../config/multer.js";
import sharp from "sharp";

/**
 * @desc    Upload images for a song
 * @route   POST /api/songs/:id/images
 * @access  Private
 */
export const uploadSongImages = async (req, res) => {
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
      include: { images: true },
    });

    if (!song) {
      return res.status(404).json({
        success: false,
        message: "Song not found",
      });
    }

    // Check total images limit (current + new should not exceed 6)
    const currentImageCount = song.images.length;
    if (currentImageCount + files.length > 6) {
      return res.status(400).json({
        success: false,
        message: `Cannot upload ${files.length} images. Maximum 6 images per song. Currently have ${currentImageCount} images.`,
      });
    }

    const uploadResults = [];
    const failedUploads = [];

    // Process each file
    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      try {
        // Optimize image with Sharp
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
          mimetype: "image/jpeg",
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
          const imageRecord = await prisma.songImage.create({
            data: {
              songId: songId,
              filename: file.originalname,
              url: finalUrl, // ใช้ URL ที่แก้ไขแล้ว
              size: optimizedBuffer.length,
              mimeType: "image/jpeg",
              order: currentImageCount + i,
              storagePath: uploadResult.key, // เก็บ path สำหรับ Supabase
            },
          });

          uploadResults.push(imageRecord);

          console.log(`✅ Successfully uploaded image ${i + 1}:`, {
            id: imageRecord.id,
            filename: imageRecord.filename,
            url: imageRecord.url,
            size: imageRecord.size,
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
      message: `Successfully uploaded ${uploadResults.length} images`,
      data: {
        uploaded: uploadResults,
        failed: failedUploads,
      },
    });
  } catch (error) {
    console.error("Error uploading song images:", error);
    res.status(500).json({
      success: false,
      message: "Error uploading images",
      error: error.message,
    });
  }
};

/**
 * @desc    Get images for a song
 * @route   GET /api/songs/:id/images
 * @access  Public
 */
export const getSongImages = async (req, res) => {
  try {
    const songId = req.params.id;

    const images = await prisma.songImage.findMany({
      where: { songId },
      orderBy: { order: "asc" },
    });

    // แก้ไข URL ให้แสดงผลได้ - เพิ่ม headers และ cache control
    const imagesWithFixedUrls = images.map((image) => {
      let fixedUrl = image.url;

      // เพิ่ม cache buster ถ้ายังไม่มี
      if (!fixedUrl.includes("?")) {
        fixedUrl += "?t=" + Date.now();
      }

      return {
        ...image,
        url: fixedUrl,
      };
    });

    console.log(`📷 Retrieved ${images.length} images for song ${songId}`);

    // Debug: Log image URLs
    imagesWithFixedUrls.forEach((image, index) => {
      console.log(`Image ${index + 1}:`, {
        id: image.id,
        filename: image.filename,
        url: image.url,
        size: image.size,
      });
    });

    res.status(200).json({
      success: true,
      data: imagesWithFixedUrls,
    });
  } catch (error) {
    console.error("Error fetching song images:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching images",
      error: error.message,
    });
  }
};

/**
 * @desc    Delete a song image
 * @route   DELETE /api/songs/:songId/images/:imageId
 * @access  Private
 */
export const deleteSongImage = async (req, res) => {
  try {
    const { songId, imageId } = req.params;

    // Find the image
    const image = await prisma.songImage.findFirst({
      where: {
        id: imageId,
        songId: songId,
      },
    });

    if (!image) {
      return res.status(404).json({
        success: false,
        message: "Image not found",
      });
    }

    // Delete from Supabase using storagePath
    let deleteResult = { success: true };
    if (image.storagePath) {
      deleteResult = await deleteFromSupabase(image.storagePath);
      if (!deleteResult.success) {
        console.error("Failed to delete from Supabase:", deleteResult.error);
        // Continue with database deletion even if Supabase deletion fails
      }
    }

    // Delete from database
    await prisma.songImage.delete({
      where: { id: imageId },
    });

    // Reorder remaining images
    const remainingImages = await prisma.songImage.findMany({
      where: { songId },
      orderBy: { order: "asc" },
    });

    // Update order
    for (let i = 0; i < remainingImages.length; i++) {
      await prisma.songImage.update({
        where: { id: remainingImages[i].id },
        data: { order: i },
      });
    }

    console.log(`🗑️ Deleted image ${imageId} from song ${songId}`);

    res.status(200).json({
      success: true,
      message: "Image deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting song image:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting image",
      error: error.message,
    });
  }
};

/**
 * @desc    Reorder song images
 * @route   PUT /api/songs/:id/images/reorder
 * @access  Private
 */
export const reorderSongImages = async (req, res) => {
  try {
    const songId = req.params.id;
    const { imageIds } = req.body; // Array of image IDs in new order

    if (!Array.isArray(imageIds)) {
      return res.status(400).json({
        success: false,
        message: "imageIds must be an array",
      });
    }

    // Verify all images belong to this song
    const images = await prisma.songImage.findMany({
      where: {
        songId,
        id: { in: imageIds },
      },
    });

    if (images.length !== imageIds.length) {
      return res.status(400).json({
        success: false,
        message: "Some images do not belong to this song",
      });
    }

    // Update order
    for (let i = 0; i < imageIds.length; i++) {
      await prisma.songImage.update({
        where: { id: imageIds[i] },
        data: { order: i },
      });
    }

    // Return updated images with fixed URLs
    const updatedImages = await prisma.songImage.findMany({
      where: { songId },
      orderBy: { order: "asc" },
    });

    const imagesWithFixedUrls = updatedImages.map((image) => {
      let fixedUrl = image.url;
      if (!fixedUrl.includes("?")) {
        fixedUrl += "?t=" + Date.now();
      }
      return {
        ...image,
        url: fixedUrl,
      };
    });

    console.log(`🔄 Reordered ${imageIds.length} images for song ${songId}`);

    res.status(200).json({
      success: true,
      message: "Images reordered successfully",
      data: imagesWithFixedUrls,
    });
  } catch (error) {
    console.error("Error reordering song images:", error);
    res.status(500).json({
      success: false,
      message: "Error reordering images",
      error: error.message,
    });
  }
};

/**
 * @desc    Test image URL access
 * @route   GET /api/songs/test-image-access
 * @access  Public
 */
export const testImageAccess = async (req, res) => {
  try {
    // ดึงรูปภาพตัวอย่างมา test
    const sampleImage = await prisma.songImage.findFirst({
      orderBy: { createdAt: "desc" },
    });

    if (!sampleImage) {
      return res.status(404).json({
        success: false,
        message: "No images found to test",
      });
    }

    // ทดสอบ URL หลายแบบ
    const baseUrl = sampleImage.url.split("?")[0]; // Remove query params
    const testUrls = [
      sampleImage.url, // Original URL
      baseUrl, // URL without query params
      baseUrl + "?t=" + Date.now(), // With cache buster
      baseUrl + "?download=true", // With download flag
    ];

    res.status(200).json({
      success: true,
      message: "Test URLs generated",
      data: {
        originalImage: sampleImage,
        testUrls: testUrls,
        instructions: "Try each URL in your browser to see which one works",
      },
    });
  } catch (error) {
    console.error("Error testing image access:", error);
    res.status(500).json({
      success: false,
      message: "Error testing image access",
      error: error.message,
    });
  }
};
