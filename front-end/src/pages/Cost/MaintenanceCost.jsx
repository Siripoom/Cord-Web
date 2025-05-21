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
  Tabs,
  Tag,
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CarOutlined,
  DollarOutlined,
  ToolOutlined,
  CalendarOutlined,
  HomeOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import Sidebar from "../../components/Sidebar/Sidebar";
import Header from "../../components/Header/Header";
import "./Costs.css";
import PropTypes from "prop-types";
import { addMaintenance, getMaintenance, getVehicles, updateMaintenance } from "../../services/api";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

const MaintenanceCost = ({ sidebarVisible, toggleSidebar }) => {
  const [maintenanceRecords, setMaintenanceRecords] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [recordToDelete, setRecordToDelete] = useState(null);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const [form] = Form.useForm();
  const [stats, setStats] = useState({
    totalRecords: 0,
    totalCost: 0,
    avgCost: 0,
    vehicles: [],
    maintenanceTypes: [],
  });
  const [activeTabKey, setActiveTabKey] = useState("all");
  const pageSize = 10;
  const token = localStorage.getItem("token");

  const fetchMaintenanceCost = async () => {
    const res = await getMaintenance(token);
    setMaintenanceRecords(res.data);

    // Calculate statistics
    const totalRecords = res.data.length;
    const completedRecords = res.data.filter(
      (record) => record.status === "completed"
    );
    const totalCost = completedRecords.reduce(
      (sum, record) => sum + record.cost,
      0
    );
    const avgCost =
      completedRecords.length > 0 ? totalCost / completedRecords.length : 0;

    // Group by vehicle
    const vehicleMap = {};
    completedRecords.forEach((record) => {
      if (!vehicleMap[record.vehicle.plateNumber]) {
        vehicleMap[record.vehicle.plateNumber] = {
          count: 0,
          totalCost: 0,
        };
      }
      vehicleMap[record.vehicle.plateNumber].count += 1;
      vehicleMap[record.vehicle.plateNumber].totalCost += record.cost;
    });

    const vehicles = Object.keys(vehicleMap).map((plate) => ({
      plate,
      count: vehicleMap[plate].count,
      totalCost: vehicleMap[plate].totalCost,
      avgCost: vehicleMap[plate].totalCost / vehicleMap[plate].count,
    }));

    // Group by maintenance type
    const typeMap = {};
    completedRecords.forEach((record) => {
      if (!typeMap[record.maintenanceType]) {
        typeMap[record.maintenanceType] = {
          count: 0,
          totalCost: 0,
        };
      }
      typeMap[record.maintenanceType].count += 1;
      typeMap[record.maintenanceType].totalCost += record.cost;
    });

    const maintenanceTypes = Object.keys(typeMap).map((type) => ({
      type,
      count: typeMap[type].count,
      totalCost: typeMap[type].totalCost,
    }));

    setStats({
      totalRecords,
      totalCost,
      avgCost,
      vehicles,
      maintenanceTypes,
    });
  }

  const fetchVehicle = async () => {
    const res = await getVehicles(token);
    setVehicles(res.data);
  }
  // Load mock data
  useEffect(() => {
    fetchMaintenanceCost();
    fetchVehicle();
  }, []);

  // Filter records based on search text and tab
  const filteredRecords = maintenanceRecords.filter((record) => {
    const matchesSearch =
      record.vehicle.plateNumber.toLowerCase().includes(searchText.toLowerCase()) ||
      record.maintenanceType.toLowerCase().includes(searchText.toLowerCase()) ||
      record.itemName.toLowerCase().includes(searchText.toLowerCase());

    if (activeTabKey === "all") {
      return matchesSearch;
    } else if (activeTabKey === "pending") {
      return matchesSearch && record.status === "pending";
    } else if (activeTabKey === "completed") {
      return matchesSearch && record.status === "completed";
    }

    return matchesSearch;
  });

  // Show modal for adding/editing record
  const showModal = (record = null) => {
    setSelectedRecord(record);
    if (record) {
      form.setFieldsValue({
        vehicleId: record.vehicle.id,
        maintenanceDate: dayjs(record.maintenanceDate).format("YYYY-MM-DD"),
        maintenanceType: record.maintenanceType,
        itemName: record.itemName,
        quantity: record.quantity,
        cost: record.cost,
        mileage: record.mileage,
        technician: record.technician,
        remark: record.remark,
        status: record.status,
      });
    } else {
      form.resetFields();
      // Set default values
      form.setFieldsValue({
        maintenanceDate: new Date().toISOString().split("T")[0],
        status: "pending",
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
      // Update existing record
      const res = await updateMaintenance(values, selectedRecord.id, token);
      if (!res.success) {
        message.error("เกิดข้อผิดพลาดในการอัพเดตข้อมูลซ่อมบำรุง");
        return;
      } 
      const updatedRecords = maintenanceRecords.map((record) =>
        record.id === selectedRecord.id
          ? {
              ...record,
              ...values,
            }
          : record
      );
      setMaintenanceRecords(updatedRecords);
      message.success("อัพเดตข้อมูลซ่อมบำรุงเรียบร้อยแล้ว");
    } else {
      // Create new record
      const res = await addMaintenance(values, token);
      if (!res.success) {
        message.error("เกิดข้อผิดพลาดในการเพิ่มข้อมูลซ่อมบำรุง");
        return;
      }
      const newRecord = {
        id: (maintenanceRecords.length + 1).toString(),
        vehicleId: Math.floor(Math.random() * 5) + 1, // Mock vehicleId
        ...values,
      };
      setMaintenanceRecords([...maintenanceRecords, newRecord]);
      message.success("เพิ่มข้อมูลซ่อมบำรุงเรียบร้อยแล้ว");
    }
    setIsModalVisible(false);
    fetchMaintenanceCost();
  };

  // Show delete confirmation dialog
  const showDeleteConfirm = (record) => {
    setRecordToDelete(record);
    setIsDeleteModalVisible(true);
  };

  // Handle record deletion
  const handleDeleteConfirm = () => {
    if (recordToDelete) {
      const updatedRecords = maintenanceRecords.filter(
        (record) => record.id !== recordToDelete.id
      );
      setMaintenanceRecords(updatedRecords);
      message.success("ลบข้อมูลซ่อมบำรุงเรียบร้อยแล้ว");
      setIsDeleteModalVisible(false);
      setRecordToDelete(null);
    }
  };

  // Table columns
  const columns = [
    {
      title: "วันที่",
      dataIndex: "maintenanceDate",
      key: "maintenanceDate",
      ellipsis : true,
      sorter: (a, b) =>
        new Date(a.maintenanceDate) - new Date(b.maintenanceDate),
    },
    {
      title: "ทะเบียนรถ",
      dataIndex: "vehicle",
      key: "vehicle",
      render: (vehicle) => vehicle.plateNumber || "-"
    },
    {
      title: "ประเภทการซ่อม",
      dataIndex: "maintenanceType",
      key: "maintenanceType",
    },
    {
      title: "รายการ",
      dataIndex: "itemName",
      key: "itemName",
    },
    {
      title: "จำนวน",
      dataIndex: "quantity",
      key: "quantity",
    },
    {
      title: "เลขไมล์",
      dataIndex: "mileage",
      key: "mileage",
    },
    {
      title: "ค่าใช้จ่าย",
      dataIndex: "cost",
      key: "cost",
      render: (cost) => `฿${cost.toFixed(2)}`,
    },
    {
      title: "สถานะ",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        let color = status === "completed" ? "green" : "orange";
        let text = status === "completed" ? "เสร็จสิ้น" : "รอดำเนินการ";
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
              <HomeOutlined /> / ต้นทุน / ซ่อมบำรุง
            </div>
            <Title level={4}>จัดการซ่อมบำรุง</Title>
          </div>

          {/* Statistics Section */}
          <Row gutter={[16, 16]} className="mb-4">
            <Col xs={24} sm={12} md={8}>
              <Card className="stat-card">
                <Statistic
                  title="รายการทั้งหมด"
                  value={stats.totalRecords}
                  prefix={<ToolOutlined />}
                  suffix="รายการ"
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Card className="stat-card">
                <Statistic
                  title="ค่าใช้จ่ายทั้งหมด"
                  value={stats.totalCost}
                  precision={2}
                  prefix={<DollarOutlined />}
                  suffix="฿"
                />
              </Card>
            </Col>
            <Col xs={24} sm={24} md={8}>
              <Card className="stat-card">
                <Statistic
                  title="ค่าเฉลี่ยต่อครั้ง"
                  value={stats.avgCost}
                  precision={2}
                  valueStyle={{ color: "#3f8600" }}
                  prefix={<DollarOutlined />}
                  suffix="฿"
                />
              </Card>
            </Col>
          </Row>

          {/* Maintenance Stats */}
          <Row gutter={[16, 16]} className="mb-4">
            <Col xs={24} md={12}>
              <Card
                className="stat-card"
                title="สถิติค่าซ่อมตามรถ (สูงสุด 3 อันดับ)"
              >
                <Row gutter={[16, 16]}>
                  {stats.vehicles
                    .sort((a, b) => b.totalCost - a.totalCost)
                    .slice(0, 3)
                    .map((vehicle, index) => (
                      <Col xs={24} sm={12} key={index}>
                        <Card size="small" className="category-card">
                          <div
                            style={{ display: "flex", alignItems: "center" }}
                          >
                            <CarOutlined
                              style={{
                                fontSize: "24px",
                                marginRight: "12px",
                                color: "#1890ff",
                              }}
                            />
                            <div>
                              <div style={{ fontWeight: "bold" }}>
                                {vehicle.plate}
                              </div>
                              <div>จำนวน: {vehicle.count} ครั้ง</div>
                              <div>
                                ค่าใช้จ่ายรวม: ฿{vehicle.totalCost.toFixed(2)}
                              </div>
                              <div>
                                ค่าเฉลี่ย/ครั้ง: ฿{vehicle.avgCost.toFixed(2)}
                              </div>
                            </div>
                          </div>
                        </Card>
                      </Col>
                    ))}
                </Row>
              </Card>
            </Col>

            <Col xs={24} md={12}>
              <Card
                className="stat-card"
                title="สถิติตามประเภทการซ่อม (สูงสุด 3 อันดับ)"
              >
                <Row gutter={[16, 16]}>
                  {stats.maintenanceTypes
                    .sort((a, b) => b.totalCost - a.totalCost)
                    .slice(0, 3)
                    .map((type, index) => (
                      <Col xs={24} sm={12} key={index}>
                        <Card size="small" className="category-card">
                          <div
                            style={{ display: "flex", alignItems: "center" }}
                          >
                            <SettingOutlined
                              style={{
                                fontSize: "24px",
                                marginRight: "12px",
                                color: "#f5a623",
                              }}
                            />
                            <div>
                              <div style={{ fontWeight: "bold" }}>
                                {type.type}
                              </div>
                              <div>จำนวน: {type.count} ครั้ง</div>
                              <div>
                                ค่าใช้จ่ายรวม: ฿{type.totalCost.toFixed(2)}
                              </div>
                            </div>
                          </div>
                        </Card>
                      </Col>
                    ))}
                </Row>
              </Card>
            </Col>
          </Row>

          {/* Maintenance Records List */}
          <Card className="data-card mb-4">
            <div className="card-header">
              <Title level={4}>รายการซ่อมบำรุง</Title>
              <div className="card-actions">
                <Input
                  placeholder="ค้นหาโดยทะเบียนรถหรือประเภทการซ่อม..."
                  prefix={<SearchOutlined />}
                  onChange={(e) => setSearchText(e.target.value)}
                  style={{ width: 280, marginRight: 16 }}
                />
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => showModal()}
                >
                  เพิ่มรายการซ่อม
                </Button>
              </div>
            </div>

            <Tabs defaultActiveKey="all" onChange={setActiveTabKey}>
              <TabPane tab="ทั้งหมด" key="all" />
              <TabPane tab="รอดำเนินการ" key="pending" />
              <TabPane tab="เสร็จสิ้น" key="completed" />
            </Tabs>

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

      {/* Add/Edit Maintenance Record Modal */}
      <Modal
        title={selectedRecord ? "แก้ไขข้อมูลซ่อมบำรุง" : "เพิ่มข้อมูลซ่อมบำรุง"}
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={700}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="vehicleId"
                label="ทะเบียนรถ"
                rules={[{ required: true, message: "กรุณาเลือกทะเบียนรถ" }]}
              >
                <Select placeholder="เลือกทะเบียนรถ">
                  {vehicles.map((vehicle) => (
                    <Option key={vehicle.id} value={vehicle.id}>
                      {vehicle.plateNumber} ({vehicle.model})
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="maintenanceDate"
                label="วันที่ซ่อม"
                rules={[{ required: true, message: "กรุณาเลือกวันที่" }]}
              >
                <Input type="date" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="maintenanceType"
                label="ประเภทการซ่อม"
                rules={[{ required: true, message: "กรุณาเลือกประเภทการซ่อม" }]}
              >
                <Select placeholder="เลือกประเภทการซ่อม">
                  <Option value="เปลี่ยนถ่ายน้ำมันเครื่อง">
                    เปลี่ยนถ่ายน้ำมันเครื่อง
                  </Option>
                  <Option value="ซ่อมระบบเบรก">ซ่อมระบบเบรก</Option>
                  <Option value="ซ่อมระบบช่วงล่าง">ซ่อมระบบช่วงล่าง</Option>
                  <Option value="เปลี่ยนยาง">เปลี่ยนยาง</Option>
                  <Option value="ตรวจเช็คระบบไฟฟ้า">ตรวจเช็คระบบไฟฟ้า</Option>
                  <Option value="เปลี่ยนไส้กรอง">เปลี่ยนไส้กรอง</Option>
                  <Option value="ตรวจเช็คทั่วไป">ตรวจเช็คทั่วไป</Option>
                  <Option value="ซ่อมตัวถัง">ซ่อมตัวถัง</Option>
                  <Option value="อื่นๆ">อื่นๆ</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="status"
                label="สถานะ"
                rules={[{ required: true, message: "กรุณาเลือกสถานะ" }]}
              >
                <Select placeholder="เลือกสถานะ">
                  <Option value="pending">รอดำเนินการ</Option>
                  <Option value="completed">เสร็จสิ้น</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={16}>
              <Form.Item
                name="itemName"
                label="รายการ"
                rules={[{ required: true, message: "กรุณากรอกรายการ" }]}
              >
                <Input placeholder="รายการซ่อม/อะไหล่" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="quantity"
                label="จำนวน"
                rules={[
                  { required: true, message: "กรุณากรอกจำนวน" },
                  { type: "number", min: 1, message: "จำนวนต้องมากกว่า 0" },
                ]}
              >
                <InputNumber style={{ width: "100%" }} placeholder="จำนวน" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="cost"
                label="ค่าใช้จ่าย (บาท)"
                rules={[
                  { required: true, message: "กรุณากรอกค่าใช้จ่าย" },
                  { type: "number", min: 0, message: "ค่าใช้จ่ายต้องไม่ติดลบ" },
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
            <Col span={12}>
              <Form.Item name="mileage" label="เลขไมล์">
                <Input placeholder="เช่น 45600 กม." />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item name="technician" label="ช่าง/อู่/ศูนย์บริการ">
                <Input placeholder="ช่าง/อู่/ศูนย์บริการ" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="remark" label="หมายเหตุ">
            <Input.TextArea rows={3} placeholder="รายละเอียดเพิ่มเติม" />
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
        <p>คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลซ่อมบำรุงนี้?</p>
        <p>วันที่: {recordToDelete?.maintenanceDate}</p>
        <p>ทะเบียนรถ: {recordToDelete?.vehiclePlate}</p>
        <p>ประเภท: {recordToDelete?.maintenanceType}</p>
        <p>ค่าใช้จ่าย: ฿{recordToDelete?.cost?.toFixed(2)}</p>
      </Modal>
    </div>
  );
};

MaintenanceCost.propTypes = {
  sidebarVisible: PropTypes.bool.isRequired,
  toggleSidebar: PropTypes.func.isRequired,
};

export default MaintenanceCost;
