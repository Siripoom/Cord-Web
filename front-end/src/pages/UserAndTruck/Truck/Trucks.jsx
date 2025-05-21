import { useRef, useState } from "react";
import {
  Card,
  Typography,
  Button,
  Table,
  Pagination,
  Input,
  Space,
  Modal,
  Form,
  Select,
  Divider,
  message,
  Row,
  Col,
  Descriptions,
  Tag,
  Avatar,
  Statistic,
  Empty,
  Drawer,
  Timeline,
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CarOutlined,
  CalendarOutlined,
  ToolOutlined,
  PhoneOutlined,
  UserOutlined,
  PrinterFilled,
} from "@ant-design/icons";

import "../User.css";
import PropTypes from "prop-types";
import { addVehicle, deleteVehicle, updateVehicle } from "../../../services/api";
import VehicleExportCSV from "../../../components/CSV/VehicleExportCSV";

const { Title } = Typography;
const { Option } = Select;

const Trucks = ({ drivers, setTrucks, trucks, searchText, setSearchText }) => {
  const [currentTruckPage, setCurrentTruckPage] = useState(1);
  const [isTruckModalVisible, setIsTruckModalVisible] = useState(false);
  const [selectedTruck, setSelectedTruck] = useState(null);
  const [truckForm] = Form.useForm();
  const [isDeleteTruckModalVisible, setIsDeleteTruckModalVisible] =
    useState(false);
  const [truckToDelete, setTruckToDelete] = useState(null);
  const [truckDetailVisible, setTruckDetailVisible] = useState(false);
  const [viewingTruck, setViewingTruck] = useState(null);
  const csvRef = useRef();
  const pageSize = 5;
  const token = localStorage.getItem("token");


  // Filter trucks based on search text
  const filteredTrucks = trucks.filter(
    (truck) =>
      truck.plateNumber.toLowerCase().includes(searchText.toLowerCase()) ||
      truck.model.toLowerCase().includes(searchText.toLowerCase()) ||
      truck.type.toLowerCase().includes(searchText.toLowerCase())
  );

  // Function to show truck details
  const showTruckDetails = (truck) => {
    setViewingTruck(truck);
    setTruckDetailVisible(true);
  };

  // Close truck details drawer
  const closeTruckDetails = () => {
    setTruckDetailVisible(false);
    setViewingTruck(null);
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case "กำลังใช้งาน":
        return "green";
      case "ซ่อมบำรุง":
        return "orange";
      case "ว่าง":
        return "blue";
      default:
        return "default";
    }
  };

  // Truck columns for table
  const truckColumns = [
    {
      title: "ทะเบียนรถ",
      dataIndex: "plateNumber",
      key: "plateNumber",
      render: (text, record) => (
        <a onClick={() => showTruckDetails(record)}>{text}</a>
      ),
    },
    {
      title: "เลขไมล์",
      dataIndex: "capacity",
      key: "capacity",
      render: (mileage) => (mileage ? mileage : "-"),
    },

    {
      title: "ประเภท",
      dataIndex: "type",
      key: "type",
    },

    {
      title: "คนขับประจำ",
      dataIndex: "assignedDriver",
      key: "assignedDriver",
      render: (driver) => (driver ? driver.name : "-"),
    },
    {
      title: "จัดการ",
      key: "action",
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            onClick={() => showTruckModal(record)}
          />
          <Button
            type="primary"
            danger
            icon={<DeleteOutlined />}
            size="small"
            onClick={() => showDeleteTruckConfirm(record)}
          />
        </Space>
      ),
    },
  ];

  // Truck details modal
  const showTruckModal = (truck = null) => {
    setSelectedTruck(truck);
    if (truck) {
      truckForm.setFieldsValue({
        plateNumber: truck.plateNumber,
        model: truck.model,
        type: truck.type,
        capacity: truck.capacity,
        manufactureYear: truck.manufactureYear,
        status: truck.status,
        lastMaintenance: truck.lastMaintenance,
        nextMaintenance: truck.nextMaintenance,
        fuelType: truck.fuelType,
        fuelConsumption: truck.fuelConsumption,
        mileage: truck.mileage,
        assignedDriverId: truck.assignedDriver ? truck.assignedDriver.id : null,
      });
    } else {
      truckForm.resetFields();
    }
    setIsTruckModalVisible(true);
  };

  // Close truck modal
  const handleTruckModalCancel = () => {
    setIsTruckModalVisible(false);
    setSelectedTruck(null);
  };

  // Handle truck form submission
  const handleTruckFormSubmit = async (values) => {
    const preload = {
      ...values, driverId: values.assignedDriverId,
    }
    console.log(preload)
    if (selectedTruck) {
      // Update existing truck
      const res = await updateVehicle(preload, selectedTruck.id, token);
      if (!res.success) {
        message.error("ไม่สามารถอัพเดตข้อมูลรถบรรทุกได้ในขณะนี้");
        return;
      }

      const updatedTruck = {
        ...selectedTruck,
        ...values,
        assignedDriver: values.assignedDriverId
          ? drivers.find((driver) => driver.id === values.assignedDriverId)
          : null,
      };

      const updatedTrucks = trucks.map((truck) =>
        truck.id === selectedTruck.id ? updatedTruck : truck
      );

      setTrucks(updatedTrucks);
      message.success("อัพเดตข้อมูลรถบรรทุกสำเร็จ");
    } else {
      // Add new truck
      const res = await addVehicle(preload, token)
      if (!res.success) {
        message.error("ไม่สามารถเพิ่มรถบรรทุกได้ในขณะนี้");
        return;
      }


      setTrucks([...trucks, res.data]);
      message.success("เพิ่มรถบรรทุกสำเร็จ");
    }

    setIsTruckModalVisible(false);
    setSelectedTruck(null);
  };

  // Show delete truck confirmation
  const showDeleteTruckConfirm = (truck) => {
    setTruckToDelete(truck);
    setIsDeleteTruckModalVisible(true);
  };

  // Delete truck
  const handleDeleteTruck = async () => {
    if (truckToDelete) {
      await deleteVehicle(truckToDelete.id, token);
      const updatedTrucks = trucks.filter(
        (truck) => truck.id !== truckToDelete.id
      );
      setTrucks(updatedTrucks);

      message.success("ลบรถบรรทุกสำเร็จ");
      setIsDeleteTruckModalVisible(false);
      setTruckToDelete(null);
    }
  };

  return (
    <>
      <div className="section-header">
        <Title level={4}>รายการรถบรรทุก</Title>
        <Space>
          <Input
            placeholder="ค้นหารถบรรทุก..."
            prefix={<SearchOutlined />}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 200 }}
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => showTruckModal()}
          >
            เพิ่มรถบรรทุก
          </Button>
          <Button
            onClick={() => csvRef.current.link.click()}
            type="primary"
            icon={<PrinterFilled />}
          >Export to excel
          </Button>
          <VehicleExportCSV ref={csvRef} data={trucks} />
        </Space>
      </div>

      <Card className="data-card">
        <Table
          columns={truckColumns}
          dataSource={filteredTrucks.slice(
            (currentTruckPage - 1) * pageSize,
            currentTruckPage * pageSize
          )}
          pagination={false}
          rowKey="id"
        />
        <div className="pagination-container">
          <Pagination
            current={currentTruckPage}
            onChange={setCurrentTruckPage}
            total={filteredTrucks.length}
            pageSize={pageSize}
            showSizeChanger={false}
          />
        </div>
      </Card>

      {/* Truck Form Modal */}
      <Modal
        title={selectedTruck ? "แก้ไขข้อมูลรถบรรทุก" : "เพิ่มรถบรรทุกใหม่"}
        visible={isTruckModalVisible}
        onCancel={handleTruckModalCancel}
        footer={null}
        width={700}
      >
        <Form
          form={truckForm}
          layout="vertical"
          onFinish={handleTruckFormSubmit}
        >
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="plateNumber"
                label="ทะเบียนรถ"
                rules={[{ required: true, message: "กรุณากรอกทะเบียนรถ" }]}
              >
                <Input prefix={<CarOutlined />} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="type"
                label="ประเภทเชื้อเพลิง"
                rules={[
                  { required: true, message: "กรุณาเลือกประเภทเชื้อเพลิง" },
                ]}
              >
                <Select>
                  <Option value="ดีเซล">ดีเซล</Option>
                  <Option value="เบนซิน">เบนซิน</Option>
                  <Option value="NGV">NGV</Option>
                  <Option value="LPG">LPG</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item name="assignedDriverId" label="คนขับประจำ">
                <Select allowClear placeholder="เลือกคนขับประจำ">
                  <Option value={null}>ไม่มีคนขับประจำ</Option>
                  {drivers.map((driver) => (
                    <Option key={driver.id} value={driver.id}>
                      {driver.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="model"
                label="ประเภท"
                rules={[{ required: true, message: "กรุณาเลือกประเภทรถ" }]}
              >
                <Select>
                  <Option value="รถบรรทุก 4 ล้อ">รถบรรทุก 4 ล้อ</Option>
                  <Option value="รถบรรทุก 6 ล้อ">รถบรรทุก 6 ล้อ</Option>
                  <Option value="รถบรรทุก 10 ล้อ">รถบรรทุก 10 ล้อ</Option>
                  <Option value="รถพ่วง">รถพ่วง</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="capacity"
                label="เลขไมล์ (กม.)"
                rules={[{ required: true, message: "กรุณากรอกเลขไมล์" }]}
              >
                <Input type="number" />
              </Form.Item>
            </Col>
          </Row>

          <Divider />

          <Form.Item className="form-actions">
            <Button
              type="default"
              onClick={handleTruckModalCancel}
              style={{ marginRight: 8 }}
            >
              ยกเลิก
            </Button>
            <Button type="primary" htmlType="submit">
              {selectedTruck ? "อัพเดต" : "บันทึก"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Delete Truck Confirmation Modal */}
      <Modal
        title="ยืนยันการลบรถบรรทุก"
        visible={isDeleteTruckModalVisible}
        onCancel={() => setIsDeleteTruckModalVisible(false)}
        onOk={handleDeleteTruck}
        okText="ลบ"
        cancelText="ยกเลิก"
        okButtonProps={{ danger: true }}
      >
        <p>
          คุณแน่ใจหรือไม่ที่จะลบรถบรรทุกทะเบียน &quot;
          {truckToDelete?.plateNumber}&quot;?
        </p>
        <p>การดำเนินการนี้ไม่สามารถยกเลิกได้</p>
      </Modal>

      {/* Truck Details Drawer */}
      <Drawer
        title="ข้อมูลรถบรรทุก"
        width={700}
        placement="right"
        onClose={closeTruckDetails}
        visible={truckDetailVisible}
        extra={
          <Space>
            <Button
              type="primary"
              onClick={() => {
                closeTruckDetails();
                showTruckModal(viewingTruck);
              }}
            >
              แก้ไข
            </Button>
          </Space>
        }
      >
        {viewingTruck && (
          <>
            <div style={{ textAlign: "center", margin: "20px 0" }}>
              <Avatar
                size={100}
                icon={
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "100%",
                      height: "100%",
                    }}
                  >
                    <CarOutlined style={{ fontSize: "48px" }} />
                  </div>
                }
                style={{
                  backgroundColor: "#f5a623",
                }}
              />
              <div style={{ marginTop: "15px" }}>
                <Typography.Title level={3}>
                  {viewingTruck.plateNumber}
                </Typography.Title>
              </div>
            </div>

            <Divider />

            <Row gutter={[24, 24]}>
              <Col span={24}>
                <Card title="ข้อมูลทั่วไป" bordered={false}>
                  <Descriptions column={{ xs: 1, sm: 2 }} layout="vertical">
                    <Descriptions.Item label="ทะเบียนรถ">
                      {viewingTruck.plateNumber}
                    </Descriptions.Item>

                    <Descriptions.Item label="ประเภท">
                      {viewingTruck.type}
                    </Descriptions.Item>

                    <Descriptions.Item label="เลขไมล์">
                      {viewingTruck.mileage.toLocaleString()} กม.
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>

              <Col span={24}>
                <Card title="ข้อมูลเชื้อเพลิงและการซ่อมบำรุง" bordered={false}>
                  <Row gutter={[16, 16]}>
                    <Col xs={24} sm={8}>
                      <Statistic
                        title="อัตราสิ้นเปลืองเชื้อเพลิง"
                        value={viewingTruck.fuelConsumption}
                      />
                    </Col>
                    <Col xs={24} sm={8}>
                      <Statistic
                        title="ประเภทเชื้อเพลิง"
                        value={viewingTruck.fuelType}
                      />
                    </Col>
                    <Col xs={24} sm={8}>
                      <Statistic
                        title="ซ่อมบำรุงครั้งล่าสุด"
                        value={viewingTruck.lastMaintenance}
                      />
                    </Col>
                  </Row>

                  <Divider style={{ margin: "16px 0" }} />

                  <div>
                    <Typography.Title level={5}>
                      ประวัติการซ่อมบำรุง
                    </Typography.Title>
                    {viewingTruck.maintenanceHistory &&
                      viewingTruck.maintenanceHistory.length > 0 ? (
                      <Timeline style={{ marginTop: "16px" }}>
                        {viewingTruck.maintenanceHistory.map((item, index) => (
                          <Timeline.Item key={index}>
                            <p>
                              <strong>{item.date}</strong>: {item.type}
                            </p>
                            <p>ค่าใช้จ่าย: ฿{item.cost.toLocaleString()}</p>
                          </Timeline.Item>
                        ))}
                      </Timeline>
                    ) : (
                      <Empty description="ไม่มีประวัติการซ่อมบำรุง" />
                    )}
                  </div>
                </Card>
              </Col>

              <Col span={24}>
                <Card title="คนขับประจำ" bordered={false}>
                  {viewingTruck.assignedDriver ? (
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <Avatar
                        icon={<UserOutlined />}
                        style={{
                          backgroundColor: "#1890ff",
                          marginRight: "16px",
                        }}
                      />
                      <div>
                        <Typography.Title level={5} style={{ margin: 0 }}>
                          {viewingTruck.assignedDriver.name}
                        </Typography.Title>
                        <p>
                          <PhoneOutlined /> {viewingTruck.assignedDriver.phone}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <Empty description="ไม่มีคนขับประจำ" />
                  )}
                </Card>
              </Col>
            </Row>
          </>
        )}
      </Drawer>
    </>
  );
};

Trucks.propTypes = {
  drivers: PropTypes.array.isRequired,
  trucks: PropTypes.array.isRequired,
  setTrucks: PropTypes.func.isRequired,
  searchText: PropTypes.string.isRequired,
  setSearchText: PropTypes.func.isRequired,
};

export default Trucks;
