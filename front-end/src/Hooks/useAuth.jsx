import { useState, useEffect, createContext, useContext } from "react";
import { jwtDecode } from "jwt-decode";
import PropTypes from "prop-types";

// Create Auth Context
const AuthContext = createContext();

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setIsAuthenticated(false);
        setUser(null);
        setLoading(false);
        return;
      }

      const decodedToken = jwtDecode(token);
      const currentTime = Date.now() / 1000;

      if (decodedToken.exp < currentTime) {
        // Token expired
        logout();
        return;
      }

      // Token is valid
      setIsAuthenticated(true);
      setUser({
        id: decodedToken.id,
        name: decodedToken.name,
        role: decodedToken.role,
        email: decodedToken.email,
      });
      setLoading(false);
    } catch (error) {
      console.error("Auth check error:", error);
      logout();
    }
  };

  const login = (token) => {
    try {
      localStorage.setItem("token", token);
      const decodedToken = jwtDecode(token);

      setIsAuthenticated(true);
      setUser({
        id: decodedToken.id,
        name: decodedToken.name,
        role: decodedToken.role,
        email: decodedToken.email,
      });

      return true;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("user_id");
    localStorage.removeItem("role");
    setIsAuthenticated(false);
    setUser(null);
    setLoading(false);
  };

  const isAdmin = () => {
    return user?.role === "admin";
  };

  const isUser = () => {
    return user?.role === "user";
  };

  const hasRole = (roles) => {
    if (!user) return false;
    if (Array.isArray(roles)) {
      return roles.includes(user.role);
    }
    return user.role === roles;
  };

  const value = {
    isAuthenticated,
    user,
    loading,
    login,
    logout,
    isAdmin,
    isUser,
    hasRole,
    checkAuthStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// HOC for protecting components
export const withAuth = (Component, options = {}) => {
  const { requireAuth = true, requiredRoles = [] } = options;

  return function AuthenticatedComponent(props) {
    const { isAuthenticated, user, loading } = useAuth();

    if (loading) {
      return <div>Loading...</div>;
    }

    if (requireAuth && !isAuthenticated) {
      return <div>Access Denied</div>;
    }

    if (requiredRoles.length > 0 && !requiredRoles.includes(user?.role)) {
      return <div>Insufficient Permissions</div>;
    }

    return <Component {...props} />;
  };
};
