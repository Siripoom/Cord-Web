// back-end/src/middlewares/cleanupMiddleware.js

/**
 * Middleware to cleanup request body data
 * Converts empty strings to null for optional fields
 */
const cleanupMiddleware = (req, res, next) => {
  if (req.body && typeof req.body === "object") {
    // List of fields that should be null instead of empty string
    const nullableFields = ["categoryId", "description"];

    for (const field of nullableFields) {
      if (req.body[field] === "" || req.body[field] === undefined) {
        req.body[field] = null;
      }
    }

    // Trim string fields
    const stringFields = ["title", "artist", "lyrics", "name"];
    for (const field of stringFields) {
      if (typeof req.body[field] === "string") {
        req.body[field] = req.body[field].trim();
      }
    }
  }

  next();
};

export default cleanupMiddleware;
