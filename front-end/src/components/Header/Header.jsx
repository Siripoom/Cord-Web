import { Avatar, Dropdown, Menu, Breadcrumb, Button } from "antd";
import { MenuOutlined } from "@ant-design/icons";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { HomeOutlined } from "@ant-design/icons";
import { jwtDecode } from "jwt-decode";
import "./Header.css";
import PropTypes from "prop-types";

const Header = ({ title, toggleSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check for user info in localStorage
    const token = localStorage.getItem("token");
    const decodedToken = token ? JSON.parse(atob(token.split(".")[1])) : null;
    const username = jwtDecode(token)?.name;
    if (token && username) {
      setUser(username);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("user_id");
    localStorage.removeItem("role");
    setUser(null);
    navigate("/");
  };

  const menu = (
    <Menu>
      <Menu.Item key="profile">โปรไฟล์</Menu.Item>
      <Menu.Item key="settings">ตั้งค่า</Menu.Item>
      <Menu.Item key="logout" onClick={handleLogout}>
        ออกจากระบบ
      </Menu.Item>
    </Menu>
  );

  // Generate breadcrumb from current path
  const generateBreadcrumb = () => {
    const pathSnippets = location.pathname.split("/").filter((i) => i);
    return (
      <Breadcrumb>
        <Breadcrumb.Item>
          <Link to="/admin/dashboard">
            <HomeOutlined />
          </Link>
        </Breadcrumb.Item>
        {pathSnippets.map((value, index) => {
          const url = `/${pathSnippets.slice(0, index + 1).join("/")}`;
          return (
            <Breadcrumb.Item key={url}>
              <Link to={url}>
                {value.charAt(0).toUpperCase() + value.slice(1)}
              </Link>
            </Breadcrumb.Item>
          );
        })}
      </Breadcrumb>
    );
  };

  return (
    <div className="dashboard-header">
      <div className="header-left">
        <Button
          icon={<MenuOutlined />}
          onClick={toggleSidebar}
          className="sidebar-toggle"
        />
        <h3 className="title">{title}</h3>
        {generateBreadcrumb()}
      </div>

      <div className="header-user">
        <Dropdown overlay={menu} trigger={["click"]}>
          <div className="user-info">
            <Avatar style={{ backgroundColor: "#f5a623" }}>
              {user ? user.charAt(0).toUpperCase() : "U"}
            </Avatar>
            <div className="user-details">
              <span className="user-name">{user || "ผู้ใช้งาน"}</span>
            </div>
          </div>
        </Dropdown>
      </div>
    </div>
  );
};

Header.propTypes = {
  title: PropTypes.string.isRequired,
  toggleSidebar: PropTypes.func.isRequired,
};

export default Header;
