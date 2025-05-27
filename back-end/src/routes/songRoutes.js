import express from "express";
import {
  getAllSongs,
  getSongById,
  createSong,
  updateSong,
  deleteSong,
  searchSongs,
} from "../controllers/songController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import cleanupMiddleware from "../middlewares/cleanupMiddleware.js";
import { body, param, query } from "express-validator";

const router = express.Router();

// Validation rules for creating songs
const createSongValidation = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ min: 1, max: 200 })
    .withMessage("Title must be between 1 and 200 characters"),

  body("artist")
    .trim()
    .notEmpty()
    .withMessage("Artist is required")
    .isLength({ min: 1, max: 200 })
    .withMessage("Artist must be between 1 and 200 characters"),

  body("lyrics")
    .trim()
    .notEmpty()
    .withMessage("Lyrics are required")
    .isLength({ min: 1 })
    .withMessage("Lyrics cannot be empty"),

  body("defaultKey")
    .trim()
    .notEmpty()
    .withMessage("Default key is required")
    .isIn(["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"])
    .withMessage(
      "Invalid key. Must be one of: C, C#, D, D#, E, F, F#, G, G#, A, A#, B"
    ),

  body("categoryId")
    .optional({ nullable: true, checkFalsy: true })
    .custom((value) => {
      if (value === null || value === undefined || value === "") {
        return true; // Allow null/undefined/empty string
      }
      // Check if it's a valid UUID when value is provided
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(value)) {
        throw new Error("Category ID must be a valid UUID");
      }
      return true;
    }),
];

// Validation rules for updating songs (more flexible)
const updateSongValidation = [
  body("title")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Title cannot be empty if provided")
    .isLength({ min: 1, max: 200 })
    .withMessage("Title must be between 1 and 200 characters"),

  body("artist")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Artist cannot be empty if provided")
    .isLength({ min: 1, max: 200 })
    .withMessage("Artist must be between 1 and 200 characters"),

  body("lyrics")
    .optional()
    .trim()
    .isLength({ min: 0 })
    .withMessage("Lyrics must be a string"),

  body("defaultKey")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Default key cannot be empty if provided")
    .isIn(["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"])
    .withMessage(
      "Invalid key. Must be one of: C, C#, D, D#, E, F, F#, G, G#, A, A#, B"
    ),

  body("categoryId")
    .optional({ nullable: true, checkFalsy: true })
    .custom((value) => {
      if (value === null || value === undefined || value === "") {
        return true; // Allow null/undefined/empty string
      }
      // Check if it's a valid UUID when value is provided
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(value)) {
        throw new Error("Category ID must be a valid UUID");
      }
      return true;
    }),
];

// Validation for UUID parameters
const uuidValidation = [
  param("id").isUUID().withMessage("Invalid song ID format"),
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

// Public routes
router.get("/", searchValidation, getAllSongs);
router.get("/search", searchValidation, searchSongs);
router.get("/:id", uuidValidation, getSongById);

// Protected routes (require authentication)
router.post(
  "/",

  cleanupMiddleware,
  createSongValidation,
  createSong
);
router.put(
  "/:id",

  cleanupMiddleware,
  uuidValidation,
  updateSongValidation,
  updateSong
);
router.delete("/:id", uuidValidation, deleteSong);

export default router;
