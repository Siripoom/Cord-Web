import express from "express";
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  changeUserPassword,
  searchUsers,
  getUserStats,
} from "../controllers/userController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import isAdminOrAccountant from "../middlewares/isAdminOrAccountant.js";
import { body, param, query } from "express-validator";

const router = express.Router();

// Validation rules for creating users
const createUserValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),

  body("password")
    .trim()
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),

  body("role")
    .optional()
    .isIn(["admin", "user"])
    .withMessage("Invalid role specified"),
];

// Validation rules for updating users
const updateUserValidation = [
  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Name cannot be empty if provided")
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters"),

  body("email")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Email cannot be empty if provided")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),

  body("role")
    .optional()
    .isIn(["admin", "user"])
    .withMessage("Invalid role specified"),
];

// Password change validation
const passwordChangeValidation = [
  body("currentPassword")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Current password is required"),

  body("newPassword")
    .trim()
    .notEmpty()
    .withMessage("New password is required")
    .isLength({ min: 6 })
    .withMessage("New password must be at least 6 characters long"),
];

// UUID validation for parameters
const uuidValidation = [
  param("id").isUUID().withMessage("Invalid user ID format"),
];

// Search validation
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

  query("role")
    .optional()
    .isIn(["admin", "user"])
    .withMessage("Invalid role filter"),
];

// Admin only routes
router.get("/", authMiddleware, isAdminOrAccountant, getAllUsers);
router.get("/stats", authMiddleware, isAdminOrAccountant, getUserStats);
router.get(
  "/search",
  authMiddleware,
  isAdminOrAccountant,
  searchValidation,
  searchUsers
);
router.post(
  "/",
  authMiddleware,
  isAdminOrAccountant,
  createUserValidation,
  createUser
);

// Routes that can be accessed by admin or the user themselves
router.get("/:id", authMiddleware, uuidValidation, getUserById);
router.put(
  "/:id",
  authMiddleware,
  uuidValidation,
  updateUserValidation,
  updateUser
);
router.patch(
  "/:id/password",
  authMiddleware,
  uuidValidation,
  passwordChangeValidation,
  changeUserPassword
);

// Admin only routes for sensitive operations
router.delete(
  "/:id",
  authMiddleware,
  isAdminOrAccountant,
  uuidValidation,
  deleteUser
);

export default router;
