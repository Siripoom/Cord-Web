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
} from "antd";
import {
  BarChartOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  DownOutlined,
} from "@ant-design/icons";
import Sidebar from "../../components/Sidebar/Sidebar";
import Header from "../../components/Header/Header";

import "./Song.css";
import PropTypes from "prop-types";

import { render } from "@react-pdf/renderer";
import dayjs from "dayjs";

const { Title } = Typography;

const Dashboard = ({ sidebarVisible, toggleSidebar }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const token = localStorage.getItem("token");
  const [driver, setDriver] = useState([
    {
      key: "1",
      name: "A",
      phone: "0000000009",
      date: "12/05/2568",
      time: "06:00",
    },
  ]);
  const [vehicle, setVehicle] = useState(null);
  const [carBoken, setCarBoken] = useState(null);
  const [totalCarBoken, setTotalCarBoken] = useState(0);
  const [totalCustomer, setTotalCustomer] = useState(0);
  const [invoiceCustomer, setInvoiceCustomer] = useState(null);
  const [invoiceSupplier, setInvoiceSupplier] = useState(null);
  const [truckQueue, setTruckQueue] = useState(null);
  const [totalSupplier, setTotalSupplier] = useState();
  const [fuelCost, setFuelCost] = useState();


  

  return (
    <div className={`admin-layout ${sidebarVisible ? "" : "sidebar-closed"}`}>
      {sidebarVisible && <Sidebar />}

      <div className="content-area">
        <Header title="จัดการเนื้อเพลง" toggleSidebar={toggleSidebar} />

        <div className="dashboard-container">
          <div className="content-wrapper"></div>
        </div>
      </div>
    </div>
  );
};

Dashboard.propTypes = {
  sidebarVisible: PropTypes.bool.isRequired,
  toggleSidebar: PropTypes.func.isRequired,
};

export default Dashboard;
