import multer from "multer";
import { v4 as uuidv4 } from "uuid";

// Configure multer for memory storage
const storage = multer.memoryStorage();

// File filter function
const fileFilter = (req, file, cb) => {
  // Check if file is an image
  if (file.mimetype.startsWith("image/")) {
    // Allowed image types
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPEG, PNG, and WebP images are allowed"), false);
    }
  } else {
    cb(new Error("Only image files are allowed"), false);
  }
};

// Multer configuration
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 6, // Maximum 6 files at once
  },
});

// Generate unique filename
export const generateFilename = (originalName) => {
  const timestamp = Date.now();
  const uuid = uuidv4().split("-")[0]; // Short UUID
  const extension = originalName.split(".").pop().toLowerCase();
  return `${timestamp}-${uuid}.${extension}`;
};

export default upload;
