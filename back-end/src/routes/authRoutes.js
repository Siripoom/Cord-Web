import express from "express";
import {
  register,
  login,
  getUserProfile,
  changePassword,
  refreshToken,
} from "../controllers/authController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import { body } from "express-validator";

const router = express.Router();

// Validation rules
const registerValidation = [
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
    .isIn(["admin", "driver", "accountant", "customer"])
    .withMessage("Invalid role specified"),

  body("citizen_id")
    .optional()
    .isLength({ min: 13, max: 13 })
    .withMessage("Citizen ID must be 13 digits")
    .matches(/^[0-9]{13}$/)
    .withMessage("Citizen ID must contain only numbers"),
];

const loginValidation = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),

  body("password").trim().notEmpty().withMessage("Password is required"),
];

const passwordChangeValidation = [
  body("currentPassword")
    .trim()
    .notEmpty()
    .withMessage("Current password is required"),

  body("newPassword")
    .trim()
    .notEmpty()
    .withMessage("New password is required")
    .isLength({ min: 6 })
    .withMessage("New password must be at least 6 characters long")
    .not()
    .equals(body("currentPassword").toString())
    .withMessage("New password must be different from current password"),
];

// Public routes
router.post("/register", registerValidation, register);
router.post("/login", loginValidation, login);

// Protected routes - require authentication
router.get("/profile", authMiddleware, getUserProfile);
router.put(
  "/change-password",
  authMiddleware,
  passwordChangeValidation,
  changePassword
);
router.post("/refresh-token", authMiddleware, refreshToken);

export default router;
