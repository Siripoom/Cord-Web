import jwt from "jsonwebtoken";

/**
 * Generate JWT token for authentication
 * @param {string} userId - The user's ID
 * @param {string} role - The user's role (admin, driver, accountant, customer)
 * @param {string} name - Optional secret key for signing the token
 * @returns {string} JWT token
 */
export const generateToken = (userId, role, name) => {
  return jwt.sign(
    {
      id: userId,
      role: role,
      name: name,
    },
    process.env.JWT_SECRET || "your-secret-key",
    { expiresIn: "30d" }
  );
};

/**
 * Verify JWT token
 * @param {string} token - JWT token to verify
 * @returns {object} Decoded token payload
 */
export const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");
};
