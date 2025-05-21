import { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Typography,
  Button,
  Table,
  Pagination,
  Input,
  Space,
  Modal,
  Form,
  InputNumber,
  Select,
  DatePicker,
  message,
  Statistic,
  Tag,
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  DollarOutlined,
  CalendarOutlined,
  HomeOutlined,
  FileTextOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import Sidebar from "../../components/Sidebar/Sidebar";
import Header from "../../components/Header/Header";
import "./Costs.css";
import PropTypes from "prop-types";
import { getCosts, getDrivers, getVehicles, updateCost , addCost } from "../../services/api";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { Option } = Select;

const OtherExpenses = ({ sidebarVisible, toggleSidebar }) => {
  const [expenseRecords, setExpenseRecords] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [recordToDelete, setRecordToDelete] = useState(null);
  const [driverList, setDriverList] = useState([]);
  const [vehicleList, setVehicleList] = useState([]);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [stats, setStats] = useState({
    totalRecords: 0,
    totalCost: 0,
    avgCost: 0,
    expenseTypes: [],
  });

  const pageSize = 10;
  const token = localStorage.getItem("token");

  const fetchCosts = async () => {
    try {
      const res = await getCosts (token);
      console.log(res.data);
      setExpenseRecords(res.data);

    // Calculate statistics
    const approvedRecords = res.data.filter(
      (record) => record.status === "approved"
    );
    const totalRecords = res.data.length;
    const totalCost = approvedRecords.reduce(
      (sum, record) => sum + record.amount,
      0
    );
    const avgCost =
      approvedRecords.length > 0 ? totalCost / approvedRecords.length : 0;

    // Group by expense type
    const typeMap = {};
    approvedRecords.forEach((record) => {
      if (!typeMap[record.expenseType]) {
        typeMap[record.expenseType] = {
          count: 0,
          totalCost: 0,
        };
      }
      typeMap[record.expenseType].count += 1;
      typeMap[record.expenseType].totalCost += record.amount;
    });

    const expenseTypes = Object.keys(typeMap).map((type) => ({
      type,
      count: typeMap[type].count,
      totalCost: typeMap[type].totalCost,
    }));

    setStats({
      totalRecords,
      totalCost,
      avgCost,
      expenseTypes,
    });
    } catch (error) {
      console.error("Error fetching costs:", error);
      message.error("ไม่สามารถดึงข้อมูลค่าใช้จ่ายได้");
    }
  };

  const fetchDriver = async () => {
    try {
      const resDriver = await getDrivers(token);
      console.log(resDriver.data);
      setDriverList(resDriver.data);
    } catch (error) {
      console.error("Error fetching drivers:", error);
      message.error("ไม่สามารถดึงข้อมูลคนขับได้");
    }
  };
  const fetchVehicle = async () => {
    try {
      const resVehicle = await getVehicles(token);
      console.log(resVehicle.data);
      setVehicleList(resVehicle.data);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      message.error("ไม่สามารถดึงข้อมูลทะเบียนรถได้");
    }
  };
  // Load mock data
  useEffect(() => {
    fetchCosts();
    fetchDriver();
    fetchVehicle();
  }, []);

  // Filter records based on search text
  const filteredRecords = expenseRecords.filter(
    (record) =>
      record.costType.toLowerCase().includes(searchText.toLowerCase()) ||
      record.description.toLowerCase().includes(searchText.toLowerCase()) ||
      record.Vehicle.plateNumber.toLowerCase().includes(searchText.toLowerCase()) ||
      (record.Driver.name &&
        record.Driver.name.toLowerCase().includes(searchText.toLowerCase()))
  );

  // Show modal for adding/editing record
  const showModal = (record = null) => {
    setSelectedRecord(record);
    console.log(record)
    if (record) {
      form.setFieldsValue({
        costType: record.costType,
        date: dayjs(record.date).format("YYYY-MM-DD"),
        description: record.description,
        amount: record.amount,
        paymentBy: record.paymentBy,
        vehicleId: record.vehicleId,
        driverId: record.driverId,
        status: record.status,
        billNo: record.billNo,
      });
    } else {
      form.resetFields();
      // Set default values
      form.setFieldsValue({
        date: new Date().toISOString().split("T")[0],
        status: "pending",
        paymentBy: "company",
      });
    }
    setIsModalVisible(true);
  };

  // Close modal
  const handleCancel = () => {
    setIsModalVisible(false);
    setSelectedRecord(null);
  };

  // Handle form submission
  const handleSubmit = async (values) => {
    if (selectedRecord) {
      const res = await updateCost( values, selectedRecord.id, token);
      console.log(res.data)
      if (!res.success) {
        message.error("ไม่สามารถอัพเดตข้อมูลค่าใช้จ่ายได้");
        return;
      }
      const updatedRecords = expenseRecords.map((record) =>
        record.id === selectedRecord.id
          ? {
              ...record,
              ...values,
              approvedBy:
                values.status === "approved"
                  ? "Admin"
                  : values.status === "rejected"
                  ? "Admin"
                  : "",
            }
          : record
      );
      setExpenseRecords(updatedRecords);
      message.success("อัพเดตข้อมูลค่าใช้จ่ายเรียบร้อยแล้ว");
    } else {

      const res = await addCost(values, token);
      setExpenseRecords([...expenseRecords, res.data]);
      message.success("เพิ่มข้อมูลค่าใช้จ่ายเรียบร้อยแล้ว");
    }
    setIsModalVisible(false);
  };

  // Show delete confirmation dialog
  const showDeleteConfirm = (record) => {
    setRecordToDelete(record);
    setIsDeleteModalVisible(true);
  };

  // Handle record deletion
  const handleDeleteConfirm = () => {
    if (recordToDelete) {
      const updatedRecords = expenseRecords.filter(
        (record) => record.id !== recordToDelete.id
      );
      setExpenseRecords(updatedRecords);
      message.success("ลบข้อมูลค่าใช้จ่ายเรียบร้อยแล้ว");
      setIsDeleteModalVisible(false);
      setRecordToDelete(null);
    }
  };

  // Table columns
  const columns = [
    {
      title: "วันที่",
      dataIndex: "date",
      key: "date",
      sorter: (a, b) => new Date(a.date) - new Date(b.date),
      render: (date) => {
        return <Text>{dayjs(date).format("DD/MM/YYYY")}</Text>;
      },
    },
    {
      title: "ประเภท",
      dataIndex: "costType",
      key: "costType",
    },
    {
      title: "รายละเอียด",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
    },
    {
      title: "รถ",
      dataIndex: "Vehicle",
      key: "Vehicle",
      render: (vehicle) => vehicle?.plateNumber || "-",
    },
    {
      title: "คนขับ",
      dataIndex: "Driver",
      key: "Driver",
      render: (driver) => driver?.name || "-",
    },
    {
      title: "จ่ายโดย",
      dataIndex: "paymentBy",
      key: "paymentBy",
      render: (paymentBy) => {
        return (
          <Tag color={paymentBy === "company" ? "blue" : "green"}>
            {paymentBy === "company" ? "บริษัท" : "พนักงาน"}
          </Tag>
        );
      },
    },
    {
      title: "จำนวนเงิน",
      dataIndex: "amount",
      key: "amount",
      render: (amount) => `฿${amount.toFixed(2)}`,
    },
    {
      title: "สถานะ",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        let color =
          status === "approved"
            ? "green"
            : status === "rejected"
            ? "red"
            : "orange";
        let text =
          status === "approved"
            ? "อนุมัติแล้ว"
            : status === "rejected"
            ? "ไม่อนุมัติ"
            : "รอการอนุมัติ";
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: "จัดการ",
      key: "action",
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => showModal(record)}
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => showDeleteConfirm(record)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div className={`admin-layout ${sidebarVisible ? "" : "sidebar-closed"}`}>
      <div className="costs-container">
        <div className="content-wrapper">
          {/* Breadcrumb */}
          <div className="page-header">
            <div className="breadcrumb">
              <HomeOutlined /> / ต้นทุน / ค่าใช้จ่ายอื่นๆ
            </div>
            <Title level={4}>จัดการค่าใช้จ่ายอื่นๆ</Title>
          </div>

          {/* Statistics Section */}
          <Row gutter={[16, 16]} className="mb-4">
            <Col xs={24} sm={8}>
              <Card className="stat-card">
                <Statistic
                  title="รายการทั้งหมด"
                  value={stats.totalRecords}
                  prefix={<FileTextOutlined />}
                  suffix="รายการ"
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card className="stat-card">
                <Statistic
                  title="ค่าใช้จ่ายที่อนุมัติแล้ว"
                  value={stats.totalCost}
                  precision={2}
                  prefix={<DollarOutlined />}
                  suffix="฿"
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card className="stat-card">
                <Statistic
                  title="ค่าเฉลี่ยต่อรายการ"
                  value={stats.avgCost}
                  precision={2}
                  valueStyle={{ color: "#3f8600" }}
                  prefix={<DollarOutlined />}
                  suffix="฿"
                />
              </Card>
            </Col>
          </Row>

          {/* Expense Type Stats */}
          <Card className="mb-4" title="สถิติตามประเภทค่าใช้จ่าย">
            <Row gutter={[16, 16]}>
              {stats.expenseTypes
                .sort((a, b) => b.totalCost - a.totalCost)
                .map((type, index) => (
                  <Col xs={24} sm={12} md={8} lg={6} key={index}>
                    <Card size="small" className="category-card">
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <AppstoreOutlined
                          style={{
                            fontSize: "24px",
                            marginRight: "12px",
                            color: "#1890ff",
                          }}
                        />
                        <div>
                          <div style={{ fontWeight: "bold" }}>{type.type}</div>
                          <div>จำนวน: {type.count} รายการ</div>
                          <div>ค่าใช้จ่ายรวม: ฿{type.totalCost.toFixed(2)}</div>
                        </div>
                      </div>
                    </Card>
                  </Col>
                ))}
            </Row>
          </Card>

          {/* Expense Records List */}
          <Card className="data-card mb-4">
            <div className="card-header">
              <Title level={4}>รายการค่าใช้จ่ายอื่นๆ</Title>
              <div className="card-actions">
                <Input
                  placeholder="ค้นหา..."
                  prefix={<SearchOutlined />}
                  onChange={(e) => setSearchText(e.target.value)}
                  style={{ width: 250, marginRight: 16 }}
                />
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => showModal()}
                >
                  เพิ่มค่าใช้จ่าย
                </Button>
              </div>
            </div>

            <Table
              columns={columns}
              dataSource={filteredRecords.slice(
                (currentPage - 1) * pageSize,
                currentPage * pageSize
              )}
              rowKey="id"
              pagination={false}
            />

            <div className="pagination-container">
              <Pagination
                current={currentPage}
                total={filteredRecords.length}
                pageSize={pageSize}
                onChange={setCurrentPage}
                showSizeChanger={false}
              />
            </div>
          </Card>
        </div>
      </div>

      {/* Add/Edit Expense Record Modal */}
      <Modal
        title={
          selectedRecord ? "แก้ไขข้อมูลค่าใช้จ่าย" : "เพิ่มข้อมูลค่าใช้จ่าย"
        }
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={700}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="costType"
                label="ประเภทค่าใช้จ่าย"
                rules={[
                  { required: true, message: "กรุณาเลือกประเภทค่าใช้จ่าย" },
                ]}
              >
                <Select placeholder="เลือกประเภทค่าใช้จ่าย">
                  <Option value="ค่าทางด่วน">ค่าทางด่วน</Option>
                  <Option value="ค่าปรับจราจร">ค่าปรับจราจร</Option>
                  <Option value="ค่าที่พัก">ค่าที่พัก</Option>
                  <Option value="ค่าอาหาร">ค่าอาหาร</Option>
                  <Option value="ค่าจอดรถ">ค่าจอดรถ</Option>
                  <Option value="ค่าธรรมเนียม">ค่าธรรมเนียม</Option>
                  <Option value="อื่นๆ">อื่นๆ</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="date"
                label="วันที่"
                rules={[{ required: true, message: "กรุณาเลือกวันที่" }]}
              >
                <Input type="date" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="description"
                label="รายละเอียด"
                rules={[{ required: true, message: "กรุณากรอกรายละเอียด" }]}
              >
                <Input.TextArea rows={2} placeholder="รายละเอียดค่าใช้จ่าย" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="amount"
                label="จำนวนเงิน (บาท)"
                rules={[
                  { required: true, message: "กรุณากรอกจำนวนเงิน" },
                  { type: "number", min: 0, message: "จำนวนเงินต้องไม่ติดลบ" },
                ]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  precision={2}
                  placeholder="0.00"
                  prefix="฿"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="paymentBy"
                label="จ่ายโดย"
                rules={[{ required: true, message: "กรุณาเลือกผู้จ่าย" }]}
              >
                <Select placeholder="เลือกผู้จ่าย">
                  <Option value="company">บริษัท</Option> 
                  <Option value="driver">พนักงาน</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="status"
                label="สถานะ"
                rules={[{ required: true, message: "กรุณาเลือกสถานะ" }]}
              >
                <Select placeholder="เลือกสถานะ">
                  <Option value="pending">รอการอนุมัติ</Option>
                  <Option value="approved">อนุมัติแล้ว</Option>
                  <Option value="rejected">ไม่อนุมัติ</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="vehicleId"
                label="ทะเบียนรถ"
                rules={[{ required: true, message: "กรุณาเลือกทะเบียนรถ" }]}
              >
                <Select placeholder="เลือกทะเบียนรถ">
                  {vehicleList.map((vehicle) => (
                    <Option key={vehicle.id} value={vehicle.id}>
                      {vehicle.plateNumber}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="driverId" label="คนขับ">
                <Select placeholder="เลือกคนขับ (ไม่บังคับ)" allowClear>
                  {driverList.map((driver) => (
                    <Option key={driver.id} value={driver.id}>
                      {driver.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="billNo" label="เลขที่ใบเสร็จ">
            <Input placeholder="เลขที่ใบเสร็จ (ไม่บังคับ)" />
          </Form.Item>

          <Form.Item className="form-actions">
            <Space>
              <Button type="default" onClick={handleCancel}>
                ยกเลิก
              </Button>
              <Button type="primary" htmlType="submit">
                {selectedRecord ? "บันทึกการเปลี่ยนแปลง" : "บันทึกข้อมูล"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        title="ยืนยันการลบข้อมูล"
        visible={isDeleteModalVisible}
        onCancel={() => setIsDeleteModalVisible(false)}
        onOk={handleDeleteConfirm}
        okText="ลบ"
        cancelText="ยกเลิก"
        okButtonProps={{ danger: true }}
      >
        <p>คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลค่าใช้จ่ายนี้?</p>
        <p>วันที่: {recordToDelete?.date}</p>
        <p>ประเภท: {recordToDelete?.expenseType}</p>
        <p>รายละเอียด: {recordToDelete?.description}</p>
        <p>จำนวนเงิน: ฿{recordToDelete?.amount?.toFixed(2)}</p>
      </Modal>
    </div>
  );
};

OtherExpenses.propTypes = {
  sidebarVisible: PropTypes.bool.isRequired,
  toggleSidebar: PropTypes.func.isRequired,
};

export default OtherExpenses;
