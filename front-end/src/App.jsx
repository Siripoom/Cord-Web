import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import "./App.css";

// Auth Pages
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";

// Admin Pages
import Dashboard from "./pages/Song/Song";
import Category from "./pages/Categorys/Category";
import UserManagement from "./pages/User/User";

function App() {
  const [sidebarVisible, setSidebarVisible] = useState(true);
  localStorage.setItem(
    "token",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjAwMDkwNTQ3LTUwMzQtNDBiMC05YTg2LWRlYmMyMDU3MzAyZiIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc0ODE5NDUyNCwiZXhwIjoxNzUwNzg2NTI0fQ.nv-CIUxGJItsk1dc1_fhm9UTANpWXSO882vo4bGVHtg"
  );

  // Handle screen resizing
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarVisible(false);
      } else {
        setSidebarVisible(true);
      }
    };

    // Set initial state
    handleResize();

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Clean up
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  return (
    <BrowserRouter>
      <div
        className={`app-container ${
          sidebarVisible ? "sidebar-open" : "sidebar-closed"
        }`}
      >
        <Routes>
          {/* Public Routes */}
          <Route path="/auth/register" element={<Register />} />
          <Route path="/auth/login" element={<Login />} />

          {/* Admin Routes */}
          <Route
            path="/"
            element={
              <Dashboard
                sidebarVisible={sidebarVisible}
                toggleSidebar={toggleSidebar}
              />
            }
          />
          <Route
            path="/admin/categorie"
            element={
              <Category
                sidebarVisible={sidebarVisible}
                toggleSidebar={toggleSidebar}
              />
            }
          />

          <Route
            path="/admin/users"
            element={
              <UserManagement
                sidebarVisible={sidebarVisible}
                toggleSidebar={toggleSidebar}
              />
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
