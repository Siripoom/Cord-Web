import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import "./App.css";

// Auth Pages
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";

// Admin Pages
import Dashboard from "./pages/Song/Song";

import Suppliers from "./pages/User/User";

function App() {
  const [sidebarVisible, setSidebarVisible] = useState(true);
  localStorage.setItem(
    "token",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Ijg4N2ZlMGYwLWUxZmYtNDBmNi1hZGIxLTNiNjk2OTNlNDk4NiIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc0NzIyODQ5MiwiZXhwIjoxNzQ5ODIwNDkyfQ.LzDW-_faQN_SssFMhjuVqSe1GnOKiDcN6156P4FNorA"
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

          {/* Admin Routes /admin/dashboard*/}
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
            path="/admin/suppliers"
            element={
              <Suppliers
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
