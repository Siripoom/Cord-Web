import React from "react";
import { Button, Space } from "antd";
import { LoginOutlined, UserOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import "./PublicNavbar.css";
import logo from "../../assets/music.png";

const PublicNavbar = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate("/auth/login");
  };

  const handleRegister = () => {
    navigate("/auth/register");
  };

  return (
    <nav className="public-navbar">
      <div className="navbar-container">
        {/* Logo Section */}
        <div className="navbar-logo">
          <Link to="/public" className="logo-link">
            <img src={logo} alt="Chord Style Logo" className="logo-icon" />
            <span className="logo-text">Chord Style</span>
          </Link>
        </div>

        {/* Navigation Links */}
        <div className="navbar-nav">
          <Link to="/public" className="nav-link">
            หน้าหลัก
          </Link>
        </div>

        {/* Auth Buttons */}
        <div className="navbar-auth">
          <Space>
            <Button
              type="primary"
              icon={<LoginOutlined />}
              onClick={handleLogin}
              className="login-btn"
            >
              เข้าสู่ระบบ
            </Button>
          </Space>
        </div>
      </div>
    </nav>
  );
};

export default PublicNavbar;
