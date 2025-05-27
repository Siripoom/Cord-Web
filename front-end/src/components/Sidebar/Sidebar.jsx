import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  UserOutlined,
  LogoutOutlined,
  PieChartOutlined,
  TagsOutlined,
  AccountBookOutlined,
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
    navigate("/");
  };

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <img src={logo} alt="TransTrack Logo" className="logo-icon" />
        <h2 className="logo-text">Chord Style</h2>
      </div>

      <nav className="sidebar-nav">
        <NavLink
          to="/"
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
          to="/admin/customers"
          className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
          onClick={() => setActiveItem("customers")}
        >
          <UserOutlined />
          <span>จัดการผู้ใช้งาน</span>
        </NavLink>

        <div className="nav-item" onClick={handleLogout}>
          <LogoutOutlined />
          <span>ออกจากระบบ</span>
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;
