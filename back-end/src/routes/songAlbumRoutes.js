// back-end/src/routes/songAlbumRoutes.js
import express from "express";
import {
  getSongAlbums,
  getAlbumById,
  createSongAlbum,
  updateSongAlbum,
  deleteSongAlbum,
  getAllAlbums,
  searchAlbums,
} from "../controllers/songAlbumController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import cleanupMiddleware from "../middlewares/cleanupMiddleware.js";
import { body, param, query } from "express-validator";

const router = express.Router();

// Validation rules for creating albums
const createAlbumValidation = [
  body("albumName")
    .trim()
    .notEmpty()
    .withMessage("Album name is required")
    .isLength({ min: 1, max: 200 })
    .withMessage("Album name must be between 1 and 200 characters"),

  body("artist")
    .optional({ nullable: true })
    .trim()
    .isLength({ min: 0, max: 200 })
    .withMessage("Artist name must not exceed 200 characters"),

  body("releaseDate")
    .optional({ nullable: true })
    .custom((value) => {
      if (value === null || value === undefined || value === "") {
        return true; // Allow null/undefined/empty string
      }
      // Check if it's a valid date
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        throw new Error("Release date must be a valid date");
      }
      return true;
    }),

  body("coverImage")
    .optional({ nullable: true })
    .trim()
    .isLength({ min: 0, max: 500 })
    .withMessage("Cover image URL must not exceed 500 characters")
    .custom((value) => {
      if (value === null || value === undefined || value === "") {
        return true; // Allow null/undefined/empty string
      }
      // Basic URL validation
      try {
        new URL(value);
        return true;
      } catch (error) {
        throw new Error("Cover image must be a valid URL");
      }
    }),
];

// Validation rules for updating albums (more flexible)
const updateAlbumValidation = [
  body("albumName")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Album name cannot be empty if provided")
    .isLength({ min: 1, max: 200 })
    .withMessage("Album name must be between 1 and 200 characters"),

  body("artist")
    .optional({ nullable: true })
    .trim()
    .isLength({ min: 0, max: 200 })
    .withMessage("Artist name must not exceed 200 characters"),

  body("releaseDate")
    .optional({ nullable: true })
    .custom((value) => {
      if (value === null || value === undefined || value === "") {
        return true; // Allow null/undefined/empty string
      }
      // Check if it's a valid date
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        throw new Error("Release date must be a valid date");
      }
      return true;
    }),

  body("coverImage")
    .optional({ nullable: true })
    .trim()
    .isLength({ min: 0, max: 500 })
    .withMessage("Cover image URL must not exceed 500 characters")
    .custom((value) => {
      if (value === null || value === undefined || value === "") {
        return true; // Allow null/undefined/empty string
      }
      // Basic URL validation
      try {
        new URL(value);
        return true;
      } catch (error) {
        throw new Error("Cover image must be a valid URL");
      }
    }),
];

// Validation for UUID parameters
const uuidValidation = [
  param("id").isUUID().withMessage("Invalid album ID format"),
];

const songIdValidation = [
  param("songId").isUUID().withMessage("Invalid song ID format"),
];

// Validation for search and pagination
const searchValidation = [
  query("q")
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage("Search query must not be empty"),

  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage("Limit must be between 1 and 50"),
];

// Public routes for albums
router.get("/", searchValidation, getAllAlbums);
router.get("/search", searchValidation, searchAlbums);
router.get("/:id", uuidValidation, getAlbumById);

// Public routes for song albums
router.get(
  "/songs/:songId/albums",
  songIdValidation,
  searchValidation,
  getSongAlbums
);

// Protected routes (require authentication)
router.post(
  "/songs/:songId/albums",
  authMiddleware,
  cleanupMiddleware,
  songIdValidation,
  createAlbumValidation,
  createSongAlbum
);

router.put(
  "/:id",
  authMiddleware,
  cleanupMiddleware,
  uuidValidation,
  updateAlbumValidation,
  updateSongAlbum
);

router.delete("/:id", authMiddleware, uuidValidation, deleteSongAlbum);

export default router;
