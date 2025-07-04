// 1. ติดตั้ง package ที่จำเป็น
// npm install react-helmet-async

// 2. อัพเดต App.jsx - เพิ่ม HelmetProvider
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { HelmetProvider } from "react-helmet-async"; // เพิ่มบรรทัดนี้
import "./App.css";

// Auth Pages
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";

// Admin Pages
import Dashboard from "./pages/Song/Song";
import Category from "./pages/Categorys/Category";
import Suppliers from "./pages/User/User";
import UserManagement from "./pages/User/User";

// Public Pages
import PublicSongs from "./pages/Public/PublicSongs";
import PublicSongDetail from "./pages/Public/PublicSongDetail";

function App() {
  const [sidebarVisible, setSidebarVisible] = useState(true);

  // Handle screen resizing
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarVisible(false);
      } else {
        setSidebarVisible(true);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  // Protected Route Component สำหรับผู้ใช้ที่เข้าสู่ระบบแล้ว
  const ProtectedUserRoute = ({ children }) => {
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const checkAuth = () => {
        const token = localStorage.getItem("token");
        if (!token) {
          setIsAuthorized(false);
          setLoading(false);
          return;
        }

        try {
          const decoded = jwtDecode(token);
          setIsAuthorized(true);
        } catch (error) {
          console.error("Invalid token:", error);
          localStorage.removeItem("token");
          setIsAuthorized(false);
        }
        setLoading(false);
      };

      checkAuth();
    }, []);

    if (loading) {
      return <div>กำลังตรวจสอบสิทธิ์...</div>;
    }

    return isAuthorized ? children : <Navigate to="/auth/login" replace />;
  };

  // Protected Route Component สำหรับ Admin
  const ProtectedAdminRoute = ({ children }) => {
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const checkAuth = () => {
        const token = localStorage.getItem("token");
        if (!token) {
          setIsAuthorized(false);
          setLoading(false);
          return;
        }

        try {
          const decoded = jwtDecode(token);
          if (decoded.role === "admin") {
            setIsAuthorized(true);
          } else {
            setIsAuthorized(false);
          }
        } catch (error) {
          console.error("Invalid token:", error);
          localStorage.removeItem("token");
          setIsAuthorized(false);
        }
        setLoading(false);
      };

      checkAuth();
    }, []);

    if (loading) {
      return <div>กำลังตรวจสอบสิทธิ์...</div>;
    }

    return isAuthorized ? children : <Navigate to="/" replace />;
  };

  // Component สำหรับ redirect ผู้ใช้ที่เข้าสู่ระบบแล้วออกจากหน้า login/register
  const AuthRedirectRoute = ({ children }) => {
    const token = localStorage.getItem("token");

    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.role === "admin") {
          return <Navigate to="/admin/dashboard" replace />;
        }
        return <Navigate to="/" replace />;
      } catch (error) {
        localStorage.removeItem("token");
      }
    }

    return children;
  };

  return (
    <HelmetProvider>
      {" "}
      {/* เพิ่ม HelmetProvider ครอบทั้ง App */}
      <BrowserRouter>
        <div
          className={`app-container ${
            sidebarVisible ? "sidebar-open" : "sidebar-closed"
          }`}
        >
          <Routes>
            {/* Public Routes - No Auth Required */}
            <Route path="/" element={<PublicSongs />} />
            <Route path="/songs" element={<PublicSongs />} />
            <Route path="/song/:id" element={<PublicSongDetail />} />

            {/* Auth Routes - Redirect if already logged in */}
            <Route
              path="/auth/register"
              element={
                <AuthRedirectRoute>
                  <Register />
                </AuthRedirectRoute>
              }
            />
            <Route
              path="/auth/login"
              element={
                <AuthRedirectRoute>
                  <Login />
                </AuthRedirectRoute>
              }
            />

            {/* Admin Routes - Require Admin Role */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedAdminRoute>
                  <Dashboard
                    sidebarVisible={sidebarVisible}
                    toggleSidebar={toggleSidebar}
                  />
                </ProtectedAdminRoute>
              }
            />
            <Route
              path="/admin/categorie"
              element={
                <ProtectedAdminRoute>
                  <Category
                    sidebarVisible={sidebarVisible}
                    toggleSidebar={toggleSidebar}
                  />
                </ProtectedAdminRoute>
              }
            />
            <Route
              path="/admin/suppliers"
              element={
                <ProtectedAdminRoute>
                  <Suppliers
                    sidebarVisible={sidebarVisible}
                    toggleSidebar={toggleSidebar}
                  />
                </ProtectedAdminRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedAdminRoute>
                  <UserManagement
                    sidebarVisible={sidebarVisible}
                    toggleSidebar={toggleSidebar}
                  />
                </ProtectedAdminRoute>
              }
            />

            {/* Catch all route - Redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </BrowserRouter>
    </HelmetProvider>
  );
}

export default App;
