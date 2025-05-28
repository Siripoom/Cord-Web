import AuthGuard from "./AuthGuard";
import PropTypes from "prop-types";

// Wrapper component for protected routes
const ProtectedRoute = ({
  children,
  requireAuth = true,
  adminOnly = false,
  userOnly = false,
  allowedRoles = [],
  redirectTo,
}) => {
  let requiredRoles = [];

  // Determine required roles based on props
  if (adminOnly) {
    requiredRoles = ["admin"];
  } else if (userOnly) {
    requiredRoles = ["user"];
  } else if (allowedRoles.length > 0) {
    requiredRoles = allowedRoles;
  }

  return (
    <AuthGuard
      requireAuth={requireAuth}
      requiredRoles={requiredRoles}
      redirectTo={redirectTo}
    >
      {children}
    </AuthGuard>
  );
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  requireAuth: PropTypes.bool,
  adminOnly: PropTypes.bool,
  userOnly: PropTypes.bool,
  allowedRoles: PropTypes.arrayOf(PropTypes.string),
  redirectTo: PropTypes.string,
};

export default ProtectedRoute;
