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

import "./Dashboard.css";
import PropTypes from "prop-types";
import { getDrivers, getFuelCosts, getInvoiceCustomer, getInvoiceSupplier, getMaintenance, getTruckQueues, getUser, getVehicles } from "../../services/api";
import { render } from "@react-pdf/renderer";
import dayjs from "dayjs";

const { Title } = Typography;

const Dashboard = ({ sidebarVisible, toggleSidebar }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const token = localStorage.getItem("token")
  const [driver, setDriver] = useState([
    {
      key: "1",
      name: "A",
      phone: "0000000009",
      date: "12/05/2568",
      time: "06:00",
    },
  ]);
  const [vehicle , setVehicle] = useState(null)
  const [carBoken , setCarBoken] = useState(null);
  const [totalCarBoken , setTotalCarBoken] = useState(0);
  const [totalCustomer , setTotalCustomer] = useState(0);
  const [invoiceCustomer , setInvoiceCustomer] = useState(null);
  const [invoiceSupplier , setInvoiceSupplier] = useState(null);
  const [truckQueue , setTruckQueue] = useState(null);
  const [totalSupplier , setTotalSupplier] = useState();
  const [fuelCost , setFuelCost] = useState();

  const findUserDriver = async () => {
    const res = await getDrivers(token);
    setDriver(res.data)
  }

  const findVehicle = async () => {
    const res = await getVehicles(token);
    setVehicle(res.data)
  }

  const findMaintananceCost = async () => {
    const res = await getMaintenance(token);
    const total = res.data.reduce((sum , item) => sum + item.cost , 0)
    setTotalCarBoken(total)
    const boken = res.data.filter(item => item.status == 'pending')
    setCarBoken(boken)
  }

  const findInvoiceCustomer = async () => {
    const res = await getInvoiceCustomer(token);
    setInvoiceCustomer(res.data);
  
    const total = res.data.reduce((sum, item) => sum + item.totalAmount, 0);
    setTotalCustomer(total);
  };

  const findFuelCost = async () => {
    const res = await getFuelCosts(token);
    const cost = res.data.reduce((sum,item) => sum + item.cost , 0)
    setFuelCost(cost)
  }

  const findInvoiceSupplier = async () => {
    const res = await getInvoiceSupplier(token)
    setInvoiceSupplier(res.data);
    const total = res.data.reduce((sum,item) => sum + item.totalAmount , 0)
    setTotalSupplier(total)
  }

  const findTruckQueue = async () => {
    const res = await getTruckQueues(token);
    setTruckQueue(res.data);
  }
  

  useEffect(() => {
    findUserDriver();
    findVehicle();
    findMaintananceCost();
    findInvoiceCustomer();
    findFuelCost();
    findInvoiceSupplier();
    findTruckQueue();
  }, []);

  const items = [
    {
      label: "Today",
      key: "1",
    },
    {
      label: "Yesterday",
      key: "2",
    },
    {
      label: "Last 7 days",
      key: "3",
    },
    {
      label: "Last 30 days",
      key: "4",
    },
    {
      label: "Custom",
      key: "5",
    },
  ];

  const columns = [
    {
      title: "ชื่อคนขับรถ",
      dataIndex: "driver",
      key: "driver",
      render:(render) => render.name

    },
    {
      title: "เบอร์โทร",
      dataIndex: "driver",
      key: "driver",
      render:(render) => render.phone
    },
    {
      title: "วันที่ขับ",
      dataIndex: "dueDate",
      key: "dueDate",
      render:(date) => dayjs(date).format("DD/MM/YYYY")
    },
    {
      title: "จำนวนเที่ยว",
      dataIndex: "dueDate",
      key: "dueDate",
      render:(date) => (<span>{ dayjs(date).format("HH:mm")} น.</span> )
    },
  ];
  const menuProps = {
    items,
  };

  return (
    <div className={`admin-layout ${sidebarVisible ? "" : "sidebar-closed"}`}>
      {sidebarVisible && <Sidebar />}

      <div className="content-area">
        <Header title="ภาพรวม" toggleSidebar={toggleSidebar} />

        <div className="dashboard-container">
          <div className="content-wrapper">
            {/* Data Section */}
            <div className="dashboard-section">
              <div className="section-header">
                <Title level={5} className="section-title">
                  ข้อมูล
                </Title>
              </div>

              <Row gutter={[16, 16]}>
                <Col xs={24} sm={16} md={16}>
                  <Card className="stat-card yellow-card">
                    <div className="stat-icon">
                      <FileTextOutlined />
                    </div>
                    <div className="stat-value">{vehicle && vehicle.length}</div>
                    <div className="stat-desc">จำนวนรถ</div>
                  </Card>
                </Col>
                <Col xs={24} sm={8} md={8}>
                  <Card className="stat-card green-card">
                    <div className="stat-icon">
                      <CheckCircleOutlined />
                    </div>
                    <div className="stat-value">{invoiceCustomer && invoiceCustomer.length}</div>
                    <div className="stat-desc">ส่งสำเร็จ</div>
                  </Card>
                </Col>
              </Row>
            </div>

            {/* Row with Cost and Invoice Sections */}
            <Row gutter={[16, 16]}>
              {/* ต้นทุนรถ Section */}
              <Col xs={24} md={12}>
                <div className="dashboard-section">
                  <div className="section-header">
                    <Title level={5} className="section-title">
                      ต้นทุนรถ
                    </Title>

                  </div>

                  <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12}>
                      <Card className="stat-card pink-card">
                        <div className="stat-icon">
                          <BarChartOutlined />
                        </div>
                        <div className="stat-value">{fuelCost && fuelCost} ฿ </div>
                        <div className="stat-desc">เชื้อเพลง</div>
                      </Card>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Card className="stat-card yellow-card">
                        <div className="stat-icon">
                          <FileTextOutlined />
                        </div>
                        <div className="stat-value">{totalCarBoken && totalCarBoken} ฿</div>
                        <div className="stat-desc">ค่าซ่อมบำรุง</div>
                      </Card>
                    </Col>
                  </Row>
                </div>
              </Col>

              {/* ยอดใบขนขีส Section */}
              <Col xs={24} md={12}>
                <div className="dashboard-section">
                  <div className="section-header">
                    <Title level={5} className="section-title">
                      ยอดใบวางบิล
                    </Title>

                  </div>

                  <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12}>
                      <Card className="stat-card purple-card">
                        <div className="stat-icon">
                          <BarChartOutlined />
                        </div>
                        <div className="stat-value">{totalCustomer && totalCustomer}฿</div>
                        <div className="stat-desc">ยอด(ลูกค้า)</div>
                      </Card>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Card className="stat-card yellow-card">
                        <div className="stat-icon " >
                          <FileTextOutlined />
                        </div>
                        <div className="stat-value">{totalSupplier && totalSupplier}฿</div>
                        <div className="stat-desc">ยอด(ซัพพลายเออร์)</div>
                      </Card>
                    </Col>
                  </Row>
                </div>
              </Col>
            </Row>
            {/* Transport Report Section */}
            <div className="dashboard-section">
              <div className="section-header">
                <Title level={5}>รายการการเดินรถของหน่วยงานขับรถบรรทุก</Title>
              </div>

              <Row gutter={[16, 16]}>
                <Col xs={24} md={14}>
                  <Card className="table-card">
                    <Table
                      dataSource={truckQueue}
                      columns={columns}
                      pagination={false}
                      size="middle"
                    />
                    <div className="custom-pagination">
                      <Pagination
                        current={currentPage}
                        onChange={setCurrentPage}
                        total={50}
                        showSizeChanger={false}
                        size="small"
                        itemRender={(page, type) => {
                          if (type === "prev") {
                            return <Button size="small">&lt;</Button>;
                          }
                          if (type === "next") {
                            return <Button size="small">&gt;</Button>;
                          }
                          return <Button size="small">{page}</Button>;
                        }}
                      />
                    </div>
                  </Card>
                </Col>
                <Col xs={24} md={10}>
                  <Row gutter={[16, 16]}>
                    <Col span={24}>
                      <Card className="stat-summary-card success-card">
                        <div className="stat-summary-content">
                          <span className="stat-summary-value">{vehicle && vehicle.length}</span>
                          <div className="stat-summary-badge">รถ</div>
                        </div>
                        <div className="stat-summary-label">จำนวนรถทั้งหมด</div>
                      </Card>
                    </Col>
                    <Col span={24}>
                      <Card className="stat-summary-card failed-card">
                        <div className="stat-summary-content">
                          <span className="stat-summary-value">{carBoken && carBoken.length}</span>
                          <div className="stat-summary-badge">รถ</div>
                        </div>
                        <div className="stat-summary-label">จำนวนเสียหาย</div>
                      </Card>
                    </Col>
                  </Row>
                </Col>
              </Row>
            </div>
          </div>
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
