import express from "express";
import {
  getAllSongs,
  getSongById,
  createSong,
  updateSong,
  deleteSong,



} from "../controllers/songController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import isAdmin from "../middlewares/authMiddleware.js";
import { body, query } from "express-validator";

const router = express.Router();

// Validation rules for songs
const songValidation = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ max: 200 })
    .withMessage("Title must be less than 200 characters"),

  body("artist")
    .trim()
    .notEmpty()
    .withMessage("Artist is required")
    .isLength({ max: 200 })
    .withMessage("Artist must be less than 200 characters"),

  body("lyrics").trim().notEmpty().withMessage("Lyrics are required"),

  body("defaultKey")
    .trim()
    .notEmpty()
    .withMessage("Default key is required")
    .isLength({ max: 5 })
    .withMessage("Default key must be less than 5 characters"),

  body("categoryId")
    .optional()
    .isUUID()
    .withMessage("Category ID must be a valid UUID"),
];

// Search validation
const searchValidation = [
  query("q").optional().isString().withMessage("Search query must be a string"),
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage("Limit must be between 1 and 50"),
];

// Pagination validation
const paginationValidation = [
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
router.get("/", paginationValidation, getAllSongs);



router.get("/:id", getSongById);

// Protected routes - Admin only
router.post("/", authMiddleware, isAdmin, songValidation, createSong);
router.put("/:id", authMiddleware, isAdmin, songValidation, updateSong);
router.delete("/:id", authMiddleware, isAdmin, deleteSong);

export default router;
