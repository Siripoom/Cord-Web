import express from "express";
import {
  uploadSongImages,
  getSongImages,
  deleteSongImage,
  reorderSongImages,
} from "../controllers/songImageController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import upload from "../config/multer.js";
import { param, body } from "express-validator";

const router = express.Router();

// Validation rules
const songIdValidation = [
  param("id").isUUID().withMessage("Invalid song ID format"),
];

const imageIdValidation = [
  param("songId").isUUID().withMessage("Invalid song ID format"),
  param("imageId").isUUID().withMessage("Invalid image ID format"),
];

const reorderValidation = [
  param("id").isUUID().withMessage("Invalid song ID format"),
  body("imageIds")
    .isArray({ min: 1 })
    .withMessage("imageIds must be a non-empty array"),
  body("imageIds.*").isUUID().withMessage("Each imageId must be a valid UUID"),
];

// Public routes
router.get("/:id/images", songIdValidation, getSongImages);

// Protected routes - require authentication
router.post(
  "/:id/images",
  authMiddleware,
  songIdValidation,
  upload.array("images", 6), // Maximum 6 files
  uploadSongImages
);

router.delete(
  "/:songId/images/:imageId",
  authMiddleware,
  imageIdValidation,
  deleteSongImage
);

router.put(
  "/:id/images/reorder",
  authMiddleware,
  reorderValidation,
  reorderSongImages
);

export default router;
