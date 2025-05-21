import { useState } from "react";
import { Tabs } from "antd";
import {
  ShopOutlined,
  DollarOutlined,
  ToolOutlined,
  AppstoreOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import Sidebar from "../../components/Sidebar/Sidebar";
import Header from "../../components/Header/Header";
import Products from "./Products";
import FuelCost from "./FuelCost";
import MaintenanceCost from "./MaintenanceCost";
import OtherExpenses from "./OtherExpenses";

import "./Costs.css";
import PropTypes from "prop-types";

const { TabPane } = Tabs;

const Costs = ({ sidebarVisible, toggleSidebar }) => {
  const [activeKey, setActiveKey] = useState("products");

  const handleTabChange = (key) => {
    setActiveKey(key);
  };

  return (
    <div className={`admin-layout ${sidebarVisible ? "" : "sidebar-closed"}`}>
      {sidebarVisible && <Sidebar />}

      <div className="content-area">
        <Header title="ต้นทุน" toggleSidebar={toggleSidebar} />

        <div className="costs-container">
          <div className="content-wrapper">
            <div className="breadcrumb mb-4">
              <HomeOutlined /> / ต้นทุน /{activeKey === "products" && " สินค้า"}
              {activeKey === "fuel" && " น้ำมันเชื้อเพลิง"}
              {activeKey === "maintenance" && " ซ่อมบำรุง"}
              {activeKey === "other" && " ค่าใช้จ่ายอื่นๆ"}
            </div>

            <Tabs
              activeKey={activeKey}
              onChange={handleTabChange}
              className="costs-tabs"
              tabPosition="top"
              type="card"
            >
              <TabPane
                tab={
                  <span>
                    <ShopOutlined />
                    สินค้า
                  </span>
                }
                key="products"
              >
                {activeKey === "products" && (
                  <Products
                    sidebarVisible={sidebarVisible}
                    toggleSidebar={toggleSidebar}
                  />
                )}
              </TabPane>

              <TabPane
                tab={
                  <span>
                    <DollarOutlined />
                    น้ำมันเชื้อเพลิง
                  </span>
                }
                key="fuel"
              >
                {activeKey === "fuel" && (
                  <FuelCost
                    sidebarVisible={sidebarVisible}
                    toggleSidebar={toggleSidebar}
                  />
                )}
              </TabPane>

              <TabPane
                tab={
                  <span>
                    <ToolOutlined />
                    ซ่อมบำรุง
                  </span>
                }
                key="maintenance"
              >
                {activeKey === "maintenance" && (
                  <MaintenanceCost
                    sidebarVisible={sidebarVisible}
                    toggleSidebar={toggleSidebar}
                  />
                )}
              </TabPane>

              <TabPane
                tab={
                  <span>
                    <AppstoreOutlined />
                    ค่าใช้จ่ายอื่นๆ
                  </span>
                }
                key="other"
              >
                {activeKey === "other" && (
                  <OtherExpenses
                    sidebarVisible={sidebarVisible}
                    toggleSidebar={toggleSidebar}
                  />
                )}
              </TabPane>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

Costs.propTypes = {
  sidebarVisible: PropTypes.bool.isRequired,
  toggleSidebar: PropTypes.func.isRequired,
};

export default Costs;
