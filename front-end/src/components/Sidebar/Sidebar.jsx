import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  UserOutlined,
  BoxPlotOutlined,
  CarOutlined,
  TeamOutlined,
  BarChartOutlined,
  FileTextOutlined,
  LogoutOutlined,
  PieChartOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import "./Sidebar.css";
import logo from "../../assets/truck 1.jpg"; // You may need to update this path

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
        <h2 className="logo-text">TransTrack</h2>
      </div>

      <nav className="sidebar-nav">
        <NavLink
          to="/"
          className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
          onClick={() => setActiveItem("dashboard")}
        >
          <PieChartOutlined />
          <span>ภาพรวม</span>
        </NavLink>

        <NavLink
          to="/admin/customers"
          className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
          onClick={() => setActiveItem("customers")}
        >
          <UserOutlined />
          <span>การจัดการลูกค้า</span>
        </NavLink>

        <NavLink
          to="/admin/suppliers"
          className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
          onClick={() => setActiveItem("suppliers")}
        >
          <BoxPlotOutlined />
          <span>การจัดการซัพพลายเออร์</span>
        </NavLink>

        <NavLink
          to="/admin/truck-queues"
          className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
          onClick={() => setActiveItem("truck-queues")}
        >
          <CarOutlined />
          <span>การจัดการคิวรถบรรทุก</span>
        </NavLink>

        <NavLink
          to="/admin/user-and-truck"
          className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
          onClick={() => setActiveItem("drivers")}
        >
          <TeamOutlined />
          <span>การจัดการรถ-พนักงานขับ</span>
        </NavLink>

        <NavLink
          to="/admin/costs"
          className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
          onClick={() => setActiveItem("costs")}
        >
          <DollarOutlined />
          <span>ต้นทุน</span>
        </NavLink>

        <NavLink
          to="/admin/finance"
          className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
          onClick={() => setActiveItem("finance")}
        >
          <BarChartOutlined />
          <span>การจัดการเงิน-บัญชี</span>
        </NavLink>

        <NavLink
          to="/admin/reports"
          className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
          onClick={() => setActiveItem("reports")}
        >
          <FileTextOutlined />
          <span>รายงาน-การส่งออก</span>
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
