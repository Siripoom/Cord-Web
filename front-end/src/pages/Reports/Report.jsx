import { useEffect, useState } from "react";
import {
  Card,
  Row,
  Col,
  Typography,
  Statistic,
  Button,
  Space,
  Dropdown,
  Table,
  Pagination,
  Tabs,
} from "antd";
import {
  BarChartOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  DownOutlined,
  FileWordOutlined,
} from "@ant-design/icons";
import Sidebar from "../../components/Sidebar/Sidebar";
import Header from "../../components/Header/Header";

import "./Report.css";
import PropTypes from "prop-types";
import { getUser } from "../../services/api";
import TabPane from "antd/es/tabs/TabPane";
import InvoiceSupplier from "./InvoiceSupplier";
import InvoiceCustomer from "./InvoiceCustomer";

const { Title } = Typography;

const Report = ({ sidebarVisible, toggleSidebar }) => {
  const [activeKey, setActiveKey] = useState("products");

  const handleTabChange = (key) => {
    setActiveKey(key);
  };

  return (
    <div className={`admin-layout ${sidebarVisible ? "" : "sidebar-closed"}`}>
      {sidebarVisible && <Sidebar />}

      <div className="content-area">
        <Header title="รายงาน-ส่งออก" toggleSidebar={toggleSidebar} />

        <div className="report-container">
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
                    <FileWordOutlined />
                    ใบวางบิล (ลูกค้า)
                  </span>
                }
                key="products"
              >
                {activeKey === "products" && (
                  <InvoiceCustomer />
                )}
              </TabPane>

              <TabPane
                tab={
                  <span>
                    <FileWordOutlined />
                    ใบวางบิล (ซัพพลายเออร์)
                  </span>
                }
                key="fuel"
              >
                {activeKey === "fuel" && (
                  <InvoiceSupplier />
                )}
              </TabPane>
            </Tabs>
        </div>
      </div>
    </div>
  );
};

Report.propTypes = {
  sidebarVisible: PropTypes.bool.isRequired,
  toggleSidebar: PropTypes.func.isRequired,
};

export default Report;
