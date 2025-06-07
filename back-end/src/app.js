import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import prisma from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import songRoutes from "./routes/songRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import songImageRoutes from "./routes/songImageRoutes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/songs", songRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/users", userRoutes);
app.use("/api/songs", songImageRoutes);

// Health check endpoint
app.get("/", async (req, res) => {
  try {
    await prisma.$connect();
    res.json({
      message: "API is running!",
      version: "1.0.0",
      timestamp: new Date(),
    });
  } catch (error) {
    res.status(500).json({
      error: "Database connection failed",
      message: error.message,
    });
  }
});

// Not found middleware
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Endpoint not found",
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error:
      process.env.NODE_ENV === "production"
        ? "An unexpected error occurred"
        : err.message,
  });
});

export default app;
