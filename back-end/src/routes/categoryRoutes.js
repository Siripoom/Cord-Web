import express from "express";
import {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getSongsByCategory,
} from "../controllers/categoryController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import isAdmin from "../middlewares/authMiddleware.js";
import { body, query } from "express-validator";

const router = express.Router();

// Validation rules for categories
const categoryValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ max: 100 })
    .withMessage("Name must be less than 100 characters"),

  body("description")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Description must be less than 500 characters"),
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
router.get("/", getAllCategories);
router.get("/:id", getCategoryById);
router.get("/:id/songs", paginationValidation, getSongsByCategory);

// Protected routes - Admin only
router.post("/", authMiddleware, isAdmin, categoryValidation, createCategory);
router.put("/:id", authMiddleware, isAdmin, categoryValidation, updateCategory);
router.delete("/:id", authMiddleware, isAdmin, deleteCategory);

export default router;
