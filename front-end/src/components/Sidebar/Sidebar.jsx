import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  UserOutlined,
  LogoutOutlined,
  PieChartOutlined,
  TagsOutlined,
  AccountBookOutlined,
  TeamOutlined, // เพิ่มไอคอนนี้
} from "@ant-design/icons";
import "./Sidebar.css";
import logo from "../../assets/music.png"; // You may need to update this path

const Sidebar = () => {
  const navigate = useNavigate();
  const [activeItem, setActiveItem] = useState("dashboard");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("user_id");
    localStorage.removeItem("role");
    navigate("/songs");
  };

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <img src={logo} alt="Chord Style Logo" className="logo-icon" />
        <h2 className="logo-text">Yum Chord</h2>
      </div>

      <nav className="sidebar-nav">
        <NavLink
          to="/admin/dashboard"
          className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
          onClick={() => setActiveItem("dashboard")}
        >
          <AccountBookOutlined />
          <span>จัดการเนื้อเพลง</span>
        </NavLink>

        <NavLink
          to="/admin/categorie"
          className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
          onClick={() => setActiveItem("categories")}
        >
          <TagsOutlined />
          <span>จัดการหมวดหมู่</span>
        </NavLink>

        <NavLink
          to="/admin/users"
          className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
          onClick={() => setActiveItem("users")}
        >
          <TeamOutlined />
          <span>จัดการผู้ใช้งาน</span>
        </NavLink>

        <div className="nav-item logout-item" onClick={handleLogout}>
          <LogoutOutlined />
          <span>ออกจากระบบ</span>
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;
