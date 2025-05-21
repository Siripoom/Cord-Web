// Updated songRoutes.js with improved validation

import express from "express";
import {
  getAllSongs,
  getSongById,
  createSong,
  updateSong,
  deleteSong,
} from "../controllers/songController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import { body, param } from "express-validator";

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
    .optional({ nullable: true })
    .isString()
    .withMessage("Category ID must be a string"),
];

// Less strict validation for updates
const updateValidation = [
  body("title")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Title cannot be empty if provided")
    .isLength({ max: 200 })
    .withMessage("Title must be less than 200 characters"),

  body("artist")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Artist cannot be empty if provided")
    .isLength({ max: 200 })
    .withMessage("Artist must be less than 200 characters"),

  body("lyrics")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Lyrics cannot be empty if provided"),

  body("defaultKey")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Default key cannot be empty if provided")
    .isLength({ max: 5 })
    .withMessage("Default key must be less than 5 characters"),

  body("categoryId")
    .optional({ nullable: true })
    .isString()
    .withMessage("Category ID must be a string"),
];

// Public routes
router.get("/", getAllSongs);
router.get("/:id", getSongById);

// Protected routes
router.post("/", authMiddleware, songValidation, createSong);
router.put("/:id", authMiddleware, updateValidation, updateSong);
router.delete("/:id", authMiddleware, deleteSong);

export default router;
