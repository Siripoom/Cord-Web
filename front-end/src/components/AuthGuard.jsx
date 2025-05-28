import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Spin } from "antd";
import { jwtDecode } from "jwt-decode";
import PropTypes from "prop-types";

const AuthGuard = ({
  children,
  requireAuth = true,
  requiredRoles = [],
  redirectTo = "/auth/login",
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [user, setUser] = useState(null);
  const location = useLocation();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      // Decode and validate token
      try {
        const decodedToken = jwtDecode(token);
        const currentTime = Date.now() / 1000;

        // Check if token is expired
        if (decodedToken.exp < currentTime) {
          // Token expired, remove it
          localStorage.removeItem("token");
          localStorage.removeItem("username");
          localStorage.removeItem("user_id");
          localStorage.removeItem("role");
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        // Token is valid
        setIsAuthenticated(true);
        setUserRole(decodedToken.role);
        setUser({
          id: decodedToken.id,
          name: decodedToken.name,
          role: decodedToken.role,
        });
      } catch (decodeError) {
        console.error("Error decoding token:", decodeError);
        // Invalid token, remove it
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        localStorage.removeItem("user_id");
        localStorage.removeItem("role");
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("Auth check error:", error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          background:
            "linear-gradient(135deg, #667eea 0%, #764ba2 35%, #f093fb 70%, #f5576c 100%)",
        }}
      >
        <div
          style={{
            textAlign: "center",
            padding: "40px",
            background: "rgba(255, 255, 255, 0.95)",
            borderRadius: "20px",
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
          }}
        >
          <Spin size="large" />
          <p style={{ marginTop: "16px", color: "#666", fontSize: "16px" }}>
            กำลังตรวจสอบสิทธิ์การเข้าใช้งาน...
          </p>
        </div>
      </div>
    );
  }

  // If authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    // Save the attempted location for redirect after login
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // If user is authenticated but doesn't have required role
  if (requireAuth && isAuthenticated && requiredRoles.length > 0) {
    if (!requiredRoles.includes(userRole)) {
      // Redirect based on user role
      if (userRole === "admin") {
        return <Navigate to="/admin/dashboard" replace />;
      } else {
        return <Navigate to="/" replace />;
      }
    }
  }

  // If authentication is not required but user is authenticated,
  // redirect them to appropriate dashboard
  if (!requireAuth && isAuthenticated) {
    // This is useful for login/register pages
    if (userRole === "admin") {
      return <Navigate to="/admin/dashboard" replace />;
    } else {
      return <Navigate to="/" replace />;
    }
  }

  // All checks passed, render the protected component
  return children;
};

AuthGuard.propTypes = {
  children: PropTypes.node.isRequired,
  requireAuth: PropTypes.bool,
  requiredRoles: PropTypes.arrayOf(PropTypes.string),
  redirectTo: PropTypes.string,
};

export default AuthGuard;
