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
  Divider,
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CarOutlined,
  DollarOutlined,
  CalendarOutlined,
  LineChartOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import Sidebar from "../../components/Sidebar/Sidebar";
import Header from "../../components/Header/Header";
import "./Costs.css";
import PropTypes from "prop-types";
import { addFuelCost, deleteFuelCost, getDrivers, getFuelCosts, getVehicles, updateFuelCost } from "../../services/api";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { Option } = Select;

const FuelCost = ({ sidebarVisible, toggleSidebar }) => {
  const [fuelRecords, setFuelRecords] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [driver, setDriver] = useState([]);
  const [vehicle, setVehicle] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [recordToDelete, setRecordToDelete] = useState(null);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [stats, setStats] = useState({
    totalRecords: 0,
    totalCost: 0,
    avgCostPerLiter: 0,
    totalLiters: 0,
    stations: [],
    vehicles: [],
  });

  const pageSize = 10;
  const token = localStorage.getItem("token");

  const fetchFuelCost = async () => {
    const res = await getFuelCosts(token)
    console.log(res)
    setFuelRecords(res.data);

    // Calculate statistics
    const totalRecords = res.data.length;
    const totalCost = res.data.reduce(
      (sum, record) => sum + record.cost,
      0
    );
    const totalLiters = res.data.reduce(
      (sum, record) => sum + record.liters,
      0
    );
    const avgCostPerLiter = totalLiters > 0 ? totalCost / totalLiters : 0;

    // Group by station
    const stationMap = {};
    res.data.forEach((record) => {
      if (!stationMap[record.fuelStation]) {
        stationMap[record.fuelStation] = {
          count: 0,
          totalCost: 0,
        };
      }
      stationMap[record.fuelStation].count += 1;
      stationMap[record.fuelStation].totalCost += record.cost;
    });

    const stations = Object.keys(stationMap).map((station) => ({
      name: station === "station_1" ? "ปั๊มน้ำมัน 1" : "ปั๊มน้ำมัน 2",
      count: stationMap[station].count,
      totalCost: stationMap[station].totalCost,
    }));

    // Group by vehicle
    const vehicleMap = {};
    res.data.forEach((record) => {
      if (!vehicleMap[record.vehiclePlate]) {
        vehicleMap[record.vehiclePlate] = {
          count: 0,
          totalCost: 0,
          totalLiters: 0,
        };
      }
      vehicleMap[record.vehiclePlate].count += 1;
      vehicleMap[record.vehiclePlate].totalCost += record.cost;
      vehicleMap[record.vehiclePlate].totalLiters += record.liters;
    });

    const vehicles = Object.keys(vehicleMap).map((plate) => ({
      plate,
      count: vehicleMap[plate].count,
      totalCost: vehicleMap[plate].totalCost,
      totalLiters: vehicleMap[plate].totalLiters,
      avgConsumption: vehicleMap[plate].totalCost / vehicleMap[plate].count,
    }));

    setStats({
      totalRecords,
      totalCost,
      avgCostPerLiter,
      totalLiters,
      stations,
      vehicles,
    });

  }

  const fetchVehicle = async () => {
    const res = await getVehicles(token);
    setVehicle(res.data);
  }

  const fetchDriver = async () => {
    const res = await getDrivers(token);
    const driverOptions = res.data.map((d) => ({
      label: d.name, // ชื่อคนขับ
      value: d.id,   // ID ของคนขับ
    }));
    setDriver(driverOptions);
  }
  // Load mock data
  useEffect(() => {
    fetchVehicle();
    fetchFuelCost()
    fetchDriver();

  }, []);

  // Filter records based on search text
  const filteredRecords = fuelRecords.filter(
    (record) =>
      (record.vehiclePlate?.toLowerCase() || "").includes(searchText.toLowerCase()) ||
      (record.driverName?.toLowerCase() || "").includes(searchText.toLowerCase())
  );

  // Show modal for adding/editing record
  const showModal = (record = null) => {
    setSelectedRecord(record);
    console.log(record)

    if (record) {
      form.setFieldsValue({
        vehicleId: record.vehicle.id,
        fuelStation: record.fuelStation,
        fuelType: record.fuelType,
        liters: record.liters,
        pricePerLiter: record.pricePerLiter,
        date: dayjs(record.date).format("YYYY-MM-DD"),
        driverId: record.driver.id,
      });
    } else {
      form.resetFields();
      // Set default values
      form.setFieldsValue({
        fuelStation: "station_1",
        fuelType: "ดีเซล",
        pricePerLiter: 29.5,
        date: new Date().toISOString().split("T")[0],
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

    const cost = values.liters * values.pricePerLiter;
    let data = {
      ...values,
      cost,
    }
    console.log(data)
    if (selectedRecord) {
      // Update existing record
      const res = await updateFuelCost(data, selectedRecord.id, token);
      const updatedRecords = fuelRecords.map((record) =>
        record.id === selectedRecord.id
          ? {
            ...record,
            ...values,
            cost,
          }
          : record
      );
      setFuelRecords(updatedRecords);
      message.success("อัพเดตข้อมูลน้ำมันเชื้อเพลิงเรียบร้อยแล้ว");
    } else {
      // Create new record
      const res = await addFuelCost(data, token);
      // const newRecord = {
      //   id: (fuelRecords.length + 1).toString(),
      //   vehicleId: Math.floor(Math.random() * 5) + 1, // Mock vehicleId
      //   ...values,
      //   cost,
      // };
      setFuelRecords([...fuelRecords, res.data]);
      message.success("เพิ่มข้อมูลน้ำมันเชื้อเพลิงเรียบร้อยแล้ว");
    }
    setIsModalVisible(false);
    fetchFuelCost();
  };

  // Show delete confirmation dialog
  const showDeleteConfirm = (record) => {
    setRecordToDelete(record);
    setIsDeleteModalVisible(true);
  };

  // Handle record deletion
  const handleDeleteConfirm = async () => {
    if (recordToDelete) {
      await deleteFuelCost(recordToDelete.id, token);
      const updatedRecords = fuelRecords.filter(
        (record) => record.id !== recordToDelete.id
      );
      setFuelRecords(updatedRecords);
      message.success("ลบข้อมูลน้ำมันเชื้อเพลิงเรียบร้อยแล้ว");
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
      render: (date) =>  dayjs(date).format("DD/MM/YYYY") ,
    },
    {
      title: "ทะเบียนรถ",
      dataIndex: "vehicle",
      key: "vehicle",
      render: (vehicle) => vehicle.plateNumber || "-",  
    },
    {
      title: "คนขับ",
      dataIndex: "driver",
      key: "driver",
      render: (driver) => driver.name || "-",
    },
    {
      title: "ปั๊มน้ำมัน",
      dataIndex: "fuelStation",
      key: "fuelStation",
      render: (text) =>
        text === "station_1" ? "ปั๊มน้ำมัน 1" : "ปั๊มน้ำมัน 2",
    },
    {
      title: "ประเภทน้ำมัน",
      dataIndex: "fuelType",
      key: "fuelType",
    },
    {
      title: "ปริมาณ (ลิตร)",
      dataIndex: "liters",
      key: "liters",
      render: (liters) => liters?.toFixed(1),
    },
    {
      title: "ราคา/ลิตร",
      dataIndex: "pricePerLiter",
      key: "pricePerLiter",
      render: (price) => `฿${price?.toFixed(2)}`,
    },
    {
      title: "รวมค่าใช้จ่าย",
      dataIndex: "cost",
      key: "cost",
      render: (cost) => `฿${cost.toFixed(2)}`,
    },
    {
      title: "ACTION",
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
              <HomeOutlined /> / ต้นทุน / น้ำมันเชื้อเพลิง
            </div>
            <Title level={4}>จัดการน้ำมันเชื้อเพลิง</Title>
          </div>

          {/* Statistics Section */}
          <Row gutter={[16, 16]} className="mb-4">
            <Col xs={24} sm={12} md={6}>
              <Card className="stat-card">
                <Statistic
                  title="รายการทั้งหมด"
                  value={stats.totalRecords}
                  prefix={<CalendarOutlined />}
                  suffix="รายการ"
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
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
            <Col xs={24} sm={12} md={6}>
              <Card className="stat-card">
                <Statistic
                  title="ปริมาณทั้งหมด"
                  value={stats.totalLiters}
                  precision={2}
                  suffix="ลิตร"
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card className="stat-card">
                <Statistic
                  title="ราคาเฉลี่ย/ลิตร"
                  value={stats.avgCostPerLiter}
                  precision={2}
                  valueStyle={{ color: "#3f8600" }}
                  prefix={<DollarOutlined />}
                  suffix="฿"
                />
              </Card>
            </Col>
          </Row>

          {/* Station Stats */}
          <Row gutter={[16, 16]} className="mb-4">
            <Col xs={24} md={12}>
              <Card className="stat-card" title="สถิติตามปั๊มน้ำมัน">
                <Row gutter={[16, 16]}>
                  {stats.stations.map((station, index) => (
                    <Col xs={24} sm={12} key={index}>
                      <Card size="small" className="category-card">
                        <div style={{ display: "flex", alignItems: "center" }}>
                          <LineChartOutlined
                            style={{
                              fontSize: "24px",
                              marginRight: "12px",
                              color: "#1890ff",
                            }}
                          />
                          <div>
                            <div style={{ fontWeight: "bold" }}>
                              {station.name}
                            </div>
                            <div>จำนวน: {station.count} รายการ</div>
                            <div>
                              ค่าใช้จ่ายรวม: ฿{station.totalCost.toFixed(2)}
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
              <Card className="stat-card" title="สถิติตามรถ (สูงสุด 3 อันดับ)">
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
                                color: "#f5a623",
                              }}
                            />
                            <div>
                              <div style={{ fontWeight: "bold" }}>
                                {vehicle.plate}
                              </div>
                              <div>เติมรวม: {vehicle.count} ครั้ง</div>
                              <div>
                                ค่าใช้จ่ายรวม: ฿{vehicle.totalCost.toFixed(2)}
                              </div>
                              <div>
                                ค่าเฉลี่ย/ครั้ง: ฿
                                {vehicle.avgConsumption.toFixed(2)}
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

          {/* Fuel Records List */}
          <Card className="data-card mb-4">
            <div className="card-header">
              <Title level={4}>รายการน้ำมันเชื้อเพลิง</Title>
              <div className="card-actions">
                <Input
                  placeholder="ค้นหาโดยทะเบียนรถหรือคนขับ..."
                  prefix={<SearchOutlined />}
                  onChange={(e) => setSearchText(e.target.value)}
                  style={{ width: 250, marginRight: 16 }}
                />
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => showModal()}
                >
                  เพิ่มรายการน้ำมัน
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

      {/* Add/Edit Fuel Record Modal */}
      <Modal
        title={
          selectedRecord
            ? "แก้ไขข้อมูลน้ำมันเชื้อเพลิง"
            : "เพิ่มข้อมูลน้ำมันเชื้อเพลิง"
        }
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={600}
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
                  {vehicle.map((v) => (
                    <Option key={v.id} value={v.id}>
                      {v.plateNumber}
                    </Option>
                  ))}
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
            <Col span={12}>
              <Form.Item
                name="fuelStation"
                label="ปั๊มน้ำมัน"
                rules={[{ required: true, message: "กรุณาเลือกปั๊มน้ำมัน" }]}
              >
                <Select placeholder="เลือกปั๊มน้ำมัน">
                  <Option value="station_1">ปั๊มน้ำมัน 1</Option>
                  <Option value="station_2">ปั๊มน้ำมัน 2</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="fuelType"
                label="ประเภทน้ำมัน"
                rules={[{ required: true, message: "กรุณาเลือกประเภทน้ำมัน" }]}
              >
                <Select placeholder="เลือกประเภทน้ำมัน">
                  <Option value="ดีเซล">ดีเซล</Option>
                  <Option value="เบนซิน 91">เบนซิน 91</Option>
                  <Option value="เบนซิน 95">เบนซิน 95</Option>
                  <Option value="แก๊สโซฮอล์ 91">แก๊สโซฮอล์ 91</Option>
                  <Option value="แก๊สโซฮอล์ 95">แก๊สโซฮอล์ 95</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="liters"
                label="ปริมาณ (ลิตร)"
                rules={[
                  { required: true, message: "กรุณากรอกปริมาณน้ำมัน" },
                  { type: "number", min: 0.1, message: "ปริมาณต้องมากกว่า 0" },
                ]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  precision={1}
                  placeholder="0.0"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="pricePerLiter"
                label="ราคาต่อลิตร (บาท)"
                rules={[
                  { required: true, message: "กรุณากรอกราคาต่อลิตร" },
                  { type: "number", min: 0.01, message: "ราคาต้องมากกว่า 0" },
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
          </Row>

          <Form.Item name="driverId" label="ชื่อคนขับ">
            <Select
              showSearch
              placeholder="เลือกคนขับ"
              options={driver}
              optionFilterProp="name"
              filterOption={(input, option) =>
                option.name.toLowerCase().includes(input.toLowerCase())
              }
            />
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
        <p>คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลน้ำมันเชื้อเพลิงนี้?</p>
        <p>วันที่: {recordToDelete?.date}</p>
        <p>ทะเบียนรถ: {recordToDelete?.vehiclePlate}</p>
        <p>จำนวนเงิน: ฿{recordToDelete?.cost.toFixed(2)}</p>
      </Modal>
    </div>
  );
};

FuelCost.propTypes = {
  sidebarVisible: PropTypes.bool.isRequired,
  toggleSidebar: PropTypes.func.isRequired,
};

export default FuelCost;
