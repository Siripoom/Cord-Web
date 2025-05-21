import { useEffect, useState } from "react";
import {
  Card,
  Row,
  Col,
  Typography,
  Button,
  Space,
  Dropdown,
  Flex,
  Table,
  Drawer,
} from "antd";
import {
  BarChartOutlined,
  DeleteFilled,
  DownOutlined,
  EyeOutlined,
  PrinterOutlined,
} from "@ant-design/icons";
import Sidebar from "../../components/Sidebar/Sidebar";
import Header from "../../components/Header/Header";
import dayjs from "dayjs";
import "./Account.css";
import PropTypes from "prop-types";
import SalesComparisonChart from "../../components/Chart/SalesComparisonChart";
import { getInvoiceCustomer, getInvoiceSupplier } from "../../services/api";
import isBetween from "dayjs/plugin/isBetween";
import InvoiceCustomerPDF from "../../components/PDF/InvoiceCustomerPDF";
import { PDFDownloadLink } from "@react-pdf/renderer";
import InvoiceSupplierPDF from "../../components/PDF/InvoiceSupplierPDF";


dayjs.extend(isBetween);
const { Title } = Typography;

const Account = ({ sidebarVisible, toggleSidebar }) => {
  const [selectedRange, setSelectedRange] = useState(() => {
    console.log(dayjs().month() + 1)
    return dayjs().month() + 1; // เพราะ month() เริ่มที่ 0
  });
  const [filterCustomer, setFilterCustomer] = useState([]);
  const [filterSupplier, setFilterSupplier] = useState([]);
  const [totalCustomer, setTotalCustomer] = useState(0);
  const [totalSupplier, setTotalSupplier] = useState(0);
  const [selectedInvoice, setSelectedInvoice] = useState(null)
  const [showDeawer, setShowDeawer] = useState(false)
  const [showDarwerS, setShowDarwerS] = useState(false)
  const [chartData, setChartData] = useState([]);
  const token = localStorage.getItem("token");


  const items = Array.from({ length: 12 }, (_, i) => {
    const month = dayjs().month(i).format("MMMM"); // ชื่อเดือน
    return { label: month, key: String(i + 1) }; // key = 1-12
  });
  const fetchInvoices = async () => {
    const [resCustomer, resSupplier] = await Promise.all([
      getInvoiceCustomer(token),
      getInvoiceSupplier(token),
    ]);

    const selectedMonth = parseInt(selectedRange); // 1-12
    const today = dayjs();
    const year = today.year();
    const startDate = dayjs(`${year}-${selectedMonth}-01`).startOf("month");
    const endDate = startDate.endOf("month");

    const filteredCustomer = resCustomer.data.filter(item =>
      dayjs(item.date).isBetween(startDate, endDate, null, "[]")
    );
    const filteredSupplier = resSupplier.data.filter(item =>
      dayjs(item.date).isBetween(startDate, endDate, null, "[]")
    );

    // สร้างวันที่ของเดือน
    const days = [];
    for (
      let d = dayjs(startDate);
      d.isBefore(endDate) || d.isSame(endDate, "day");
      d = d.add(1, "day")
    ) {
      days.push(d.format("YYYY-MM-DD"));
    }

    const customerMap = {};
    const supplierMap = {};
    days.forEach(day => {
      customerMap[day] = 0;
      supplierMap[day] = 0;
    });

    filteredCustomer.forEach(item => {
      const date = dayjs(item.date).format("YYYY-MM-DD");
      if (customerMap[date] !== undefined) {
        customerMap[date] += item.totalAmount;
      }
    });

    filteredSupplier.forEach(item => {
      const date = dayjs(item.date).format("YYYY-MM-DD");
      if (supplierMap[date] !== undefined) {
        supplierMap[date] += item.totalAmount;
      }
    });

    const result = days.map(date => ({
      date,
      customer: customerMap[date],
      supplier: supplierMap[date],
    }));

    setChartData(result);
    setFilterCustomer(filteredCustomer);
    setFilterSupplier(filteredSupplier);

    setTotalCustomer(
      filteredCustomer.reduce((sum, item) => sum + item.totalAmount, 0)
    );
    setTotalSupplier(
      filteredSupplier.reduce((sum, item) => sum + item.totalAmount, 0)
    );
  };

  const columnsCustomer = [
    {
      title: 'เลขที่ใบวางบิล',
      dataIndex: 'id',
      key: 'id',
      ellipsis: true,
    },
    {
      title: 'วันที่',
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (date) => dayjs(date).locale('th').format('MMMM YYYY')

    },
    {
      title: 'ชื่อลูกค้า',
      dataIndex: 'customer',
      key: 'customer',
      render: (customer) => customer.name || '-'
    },
    {
      title: 'ราคารวม',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
    },
    {
      title: 'ACTIONS',
      key: 'actions',
      render: (_, record) => (
        <Flex>
          <Button style={{ color: '#000', marginRight: '5px' }} onClick={() => showDrawer(record)}><EyeOutlined /></Button>
        </Flex>

      )
    }
  ]

  const columnDetail = [
    {
      title: 'ชื่อสินค้า',
      dataIndex: 'product',
      key: 'product',
      render: (product) => product.name || '-'
    },
    {
      title: 'ราคา',
      dataIndex: 'price',
      key: 'price',
    },
    {
      title: 'จำนวน',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: 'น้ำหนักสุทธิ',
      dataIndex: 'weight',
      key: 'weight',
    },
    {
      title: 'ราคารวม',
      dataIndex: 'amount',
      key: 'amount',
    },
  ]

  const columnsSupplier = [
    {
      title: 'เลขที่ใบวางบิล',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'วันที่',
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (date) => dayjs(date).format('DD/MM/YYYY')

    },
    {
      title: 'ชื่อสินค้า',
      dataIndex: 'product',
      key: 'product',
      render: (product) => product.name || '-'
    },
    {
      title: 'ราคารวม',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
    },
    {
      title: 'ACTIONS',
      key: 'actions',
      render: (_, record) => (
        <Flex>
          <Button style={{ color: '#000', marginRight: '5px' }} onClick={() => showDrawerS(record)}><EyeOutlined /></Button>
        </Flex>

      )
    }
  ]

  useEffect(() => {
    fetchInvoices();
  }, [selectedRange]);


  const showDrawerS = (record) => {
    setSelectedInvoice(record)
    setShowDarwerS(true)
  }

  const showDrawer = (record) => {
    setSelectedInvoice(record)
    setShowDeawer(true)
  }

  const closeDrawer = () => {
    setShowDeawer(false)
    setSelectedInvoice(null)
  }

  const closeDrawerS = () => {
    setShowDarwerS(false)
    setSelectedInvoice(null)
  }

  return (
    <div className={`admin-layout ${sidebarVisible ? "" : "sidebar-closed"}`}>
      {sidebarVisible && <Sidebar />}
      <div className="content-area">
        <Header title="การจัดการเงิน-บัญชี" toggleSidebar={toggleSidebar} />
        <div className="account-container">
          <div className="content-wrapper">
            <Flex justify="end">
              <Dropdown
                menu={{
                  items: items.map(item => ({
                    ...item,
                    onClick: () => setSelectedRange(item.key),
                  })),
                }}
              >
                <Button size="small" className="date-filter-btn">
                  <Space>
                    {items.find(i => i.key === String(selectedRange)).label || "เลือกเดือน"}
                    <DownOutlined />
                  </Space>
                </Button>
              </Dropdown>
            </Flex>

            <Row gutter={[16, 16]} style={{ marginTop: "10px" }}>
              <Col xs={24} sm={12} md={12}>
                <Card className="stat-card pink-card">
                  <div className="stat-icon">
                    <BarChartOutlined />
                  </div>
                  <div className="stat-value">{totalSupplier} ฿</div>
                  <div className="stat-desc">ยอดรวมใบวางบิล (ซัพพรายเออร์)</div>
                </Card>
              </Col>
              <Col xs={24} sm={12} md={12}>
                <Card className="stat-card yellow-card">
                  <div className="stat-icon">
                    <BarChartOutlined />
                  </div>
                  <div className="stat-value">{totalCustomer} ฿</div>
                  <div className="stat-desc">ยอดรวมใบวางบิล (ลูกค้า)</div>
                </Card>
              </Col>
              <Col span={24} style={{ width: "100%", height: "400px" }} className="h-auto">
                <Card className="stat-card green-card">
                  <SalesComparisonChart
                    data={chartData}
                    selectedRange={selectedRange}
                    style={{ width: "100%", height: "100%" }}
                  />
                </Card>
              </Col>
              <Col span={12} className="h-auto ">
                <Card title={'ลูกค้า'} className="stat-card white-card" style={{ padding: "0px" }}>
                  <Table
                    columns={columnsCustomer}
                    dataSource={filterCustomer}
                  />
                </Card>
              </Col>
              <Col span={12} className="h-auto">
                <Card title={'ซัพพลายเออร์'} className="stat-card white-card">
                  <Table
                    columns={columnsSupplier}
                    dataSource={filterSupplier}
                  />
                </Card>
              </Col>
            </Row>
          </div>
        </div>
      </div>
      {showDeawer ? (
        <Drawer
          visible={showDeawer}
          onClose={closeDrawer}
          width={800}
        >
          <div style={{ padding: '20px' }}>
            <Title level={3}>รายละเอียดใบวางบิล</Title>

            <Row gutter={[16, 16]}>
              <Col span={12}>
                <p>เลขที่ใบวางบิล : {selectedInvoice && selectedInvoice.id}</p>
              </Col>
              <Col span={12}>
                <p>เดือน : {selectedInvoice && dayjs(selectedInvoice.dueDate).locale('th').format('MMMM YYYY')}</p>

              </Col>
            </Row>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <p>ชื่อลูกค้า : {selectedInvoice && selectedInvoice.customer.name}</p>
              </Col>
              <Col span={12}>
                <p>ราคารวม : {selectedInvoice && selectedInvoice.totalAmount}</p>
              </Col>
            </Row>
          </div>

          <Table
            columns={columnDetail}
            dataSource={selectedInvoice && selectedInvoice.InvoiceCustomer}
            rowKey="id"
            pagination={false}
            scroll={{ x: 800 }}
          />
          <Flex justify="end" style={{ marginTop: '20px' }}>
            {selectedInvoice ?
              <PDFDownloadLink
                document={<InvoiceCustomerPDF data={selectedInvoice} />}
                fileName={
                  'ใบวางบิล_' +
                  (selectedInvoice ? selectedInvoice.customer.name : '') + '_' +
                  (selectedInvoice ? dayjs(selectedInvoice.dueDate).locale('th').format('MMMM-YYYY') : '') +
                  '.pdf'
                }

              >
                <Button type='primary' style={{ marginRight: "10px" }} ><PrinterOutlined /></Button>
              </PDFDownloadLink>
              : ''}

            <Button onClick={closeDrawer}>ปิด</Button>
          </Flex>
        </Drawer>
      ) : ''}
      {showDarwerS ? (
        <Drawer
          visible={showDarwerS}
          onClose={closeDrawerS}
          width={800}
        >
          <div style={{ padding: '20px' }}>
            <Card >
              <Title level={3}>รายละเอียดใบวางบิล</Title>

              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <p>เลขที่ใบวางบิล : {selectedInvoice && selectedInvoice.id}</p>
                </Col>
                <Col span={12}>
                  <p>วันที่ : {selectedInvoice && dayjs(selectedInvoice.dueDate).format('DD/MM/YYYY')}</p>
                </Col>
              </Row>
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <p>ชื่อซัพพลายเออร์ : {selectedInvoice && selectedInvoice.supplier.name}</p>
                </Col>
                <Col span={12}>
                  <p>ราคารวม : {selectedInvoice && selectedInvoice.totalAmount}</p>
                </Col>
              </Row>
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <p>ระยะทาง : {selectedInvoice && selectedInvoice.truckQueue.distanceKm}</p>
                </Col>
              </Row>
            </Card>

            <Card
              title={"รถและผู้ขับขี่"}
              style={{ margin: '20px 0px' }}
            >
              <Row gutter={['16', '16']}>
                <Col span={12}>
                  <p>ประเภทรถ : {selectedInvoice && selectedInvoice.truckQueue.vehicle.model}</p>
                  <p>ทะเบียนรถ : {selectedInvoice && selectedInvoice.truckQueue.vehicle.plateNumber}</p>
                  <p>น้ำมันเชื้อเพลง : {selectedInvoice && selectedInvoice.truckQueue.vehicle.type}</p>
                </Col>
                <Col span={12}>
                  <p>ผู้ขับขี่ : {selectedInvoice && selectedInvoice.truckQueue.driver.name}</p>
                  <p>เลขใบขับขี่ : {selectedInvoice && selectedInvoice.truckQueue.driver.licenseNo}</p>
                  <p>ประเภทใบขับขี่ : {selectedInvoice && selectedInvoice.truckQueue.driver.licenseType}</p>
                  <p>วันหมดอายุใบขับขี่ : {selectedInvoice && selectedInvoice.truckQueue.driver.licenseExpire}</p>
                  <p>เบอร์โทร : {selectedInvoice && selectedInvoice.truckQueue.driver.phone}</p>
                  <p>ที่อยู่ : {selectedInvoice && selectedInvoice.truckQueue.driver.address}</p>
                </Col>
              </Row>
            </Card>

            <Card
              title={"สินค้า"}

            >
              <p>ชื่อสินค้า : {selectedInvoice && selectedInvoice.product.name} </p>
              <p>ราคาต้นทุน : {selectedInvoice && selectedInvoice.product.costPrice} </p>
              <p>น้ำหนักเข้า : {selectedInvoice && selectedInvoice.weightIn}</p>
              <p>น้ำหนักออก : {selectedInvoice && selectedInvoice.weightOut}</p>
              <p>น้ำหนักสุทธิ : {selectedInvoice && (selectedInvoice.weightOut - selectedInvoice.weightIn)}</p>
            </Card>

          </div>


          <Flex justify="end" style={{ marginTop: '20px' }}>

            {selectedInvoice ?
              <PDFDownloadLink
                document={<InvoiceSupplierPDF data={selectedInvoice} />}
                fileName={
                  'ใบวางบิล_' +
                  (selectedInvoice ? selectedInvoice.supplier.name : '') + '_' +
                  (selectedInvoice ? dayjs(selectedInvoice.dueDate).locale('th').format('MMMM-YYYY') : '') +
                  '.pdf'
                }
              >
                <Button type='primary' style={{ marginRight: "10px" }}><PrinterOutlined /></Button>
              </PDFDownloadLink>
              : ''}
            <Button onClick={closeDrawer}>ปิด</Button>
          </Flex>
        </Drawer>
      ) : ''}
    </div>
  );
};

Account.propTypes = {
  sidebarVisible: PropTypes.bool.isRequired,
  toggleSidebar: PropTypes.func.isRequired,
};

export default Account;
