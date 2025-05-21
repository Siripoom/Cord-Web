/**
 * @desc    Middleware to check if user is an admin or accountant
 * @access  Private
 */
const isAdminOrAccountant = (req, res, next) => {
  if (req.user.role === "admin" || req.user.role === "accountant") {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: "Access denied, Admin or Accountant only",
    });
  }
};

export default isAdminOrAccountant;
