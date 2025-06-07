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
          // Save to database
          const imageRecord = await prisma.songImage.create({
            data: {
              songId: songId,
              filename: file.originalname,
              url: uploadResult.url,
              size: optimizedBuffer.length,
              mimeType: "image/jpeg",
              order: currentImageCount + i,
              storagePath: uploadResult.key, // เก็บ path สำหรับ Supabase
            },
          });

          uploadResults.push(imageRecord);
        } else {
          failedUploads.push({
            filename: file.originalname,
            error: uploadResult.error,
          });
        }
      } catch (error) {
        console.error(`Error processing file ${file.originalname}:`, error);
        failedUploads.push({
          filename: file.originalname,
          error: error.message,
        });
      }
    }

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

    res.status(200).json({
      success: true,
      data: images,
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

    // Extract key from URL for Backblaze deletion
    const urlParts = image.url.split("/");
    const key = urlParts.slice(-2).join("/"); // Get "song-images/filename"

    // Delete from Backblaze
    const deleteResult = await deleteFromBackblaze(key);

    if (!deleteResult.success) {
      console.error("Failed to delete from Backblaze:", deleteResult.error);
      // Continue with database deletion even if Backblaze deletion fails
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

    // Return updated images
    const updatedImages = await prisma.songImage.findMany({
      where: { songId },
      orderBy: { order: "asc" },
    });

    res.status(200).json({
      success: true,
      message: "Images reordered successfully",
      data: updatedImages,
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
