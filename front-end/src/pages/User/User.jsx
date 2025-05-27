import { useState, useEffect } from "react";
import {
  Card,
  Typography,
  Button,
  Table,
  Input,
  Space,
  Modal,
  Form,
  message,
  Popconfirm,
  Tag,
  Select,
  Avatar,
  Tooltip,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  SearchOutlined,
  LockOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import Sidebar from "../../components/Sidebar/Sidebar";
import Header from "../../components/Header/Header";
import {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  searchUsers,
} from "../../services/userService";
import PropTypes from "prop-types";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { Option } = Select;

const UserManagement = ({ sidebarVisible, toggleSidebar }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [roleFilter, setRoleFilter] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [form] = Form.useForm();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async (page = 1, limit = 10, search = "") => {
    setLoading(true);
    try {
      const response = search
        ? await searchUsers(search, page, limit)
        : await getAllUsers(page, limit, search);

      if (response.success) {
        setUsers(response.data);
        if (response.pagination) {
          setPagination({
            current: response.pagination.page,
            pageSize: response.pagination.limit,
            total: response.pagination.totalUsers,
          });
        }
      } else {
        message.error(response.message || "Failed to fetch users");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      message.error("An error occurred while fetching users");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (searchText.trim()) {
      fetchUsers(1, pagination.pageSize, searchText.trim());
    } else {
      fetchUsers(1, pagination.pageSize);
    }
  };

  const handleClearSearch = () => {
    setSearchText("");
    setRoleFilter(null);
    fetchUsers(1, pagination.pageSize);
  };

  const handlePaginationChange = (page, pageSize) => {
    fetchUsers(page, pageSize, searchText);
  };

  const showUserModal = (user = null) => {
    setSelectedUser(user);
    if (user) {
      form.setFieldsValue({
        name: user.name,
        email: user.email,
        role: user.role,
      });
    } else {
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const showUserDetail = (user) => {
    setSelectedUser(user);
    setIsDetailModalVisible(true);
  };

  const handleUserSubmit = async (values) => {
    try {
      setLoading(true);
      const userData = {
        name: values.name.trim(),
        email: values.email.trim(),
        role: values.role,
        ...(values.password && { password: values.password }),
      };

      const response = selectedUser
        ? await updateUser(selectedUser.id, userData)
        : await createUser(userData);

      if (response.success) {
        message.success(
          `ผู้ใช้${selectedUser ? "ได้รับการอัพเดต" : "ถูกสร้าง"}เรียบร้อยแล้ว`
        );
        fetchUsers(pagination.current, pagination.pageSize, searchText);
        setIsModalVisible(false);
        setSelectedUser(null);
        form.resetFields();
      } else {
        message.error(response.message || "เกิดข้อผิดพลาด");
        if (response.errors && response.errors.length > 0) {
          response.errors.forEach((error) => {
            message.error(`${error.field || error.path}: ${error.message}`);
          });
        }
      }
    } catch (error) {
      console.error("Error saving user:", error);
      message.error("เกิดข้อผิดพลาดในการบันทึกผู้ใช้");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (user) => {
    try {
      setLoading(true);
      const response = await deleteUser(user.id);
      if (response.success) {
        message.success("ลบผู้ใช้เรียบร้อยแล้ว");
        fetchUsers(pagination.current, pagination.pageSize, searchText);
      } else {
        message.error(response.message || "เกิดข้อผิดพลาดในการลบ");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      message.error("เกิดข้อผิดพลาดในการลบผู้ใช้");
    } finally {
      setLoading(false);
    }
  };

  // Filter users based on search and filters (frontend filter for role)
  const filteredUsers = users.filter((user) => {
    const matchesRole = !roleFilter || user.role === roleFilter;
    return matchesRole;
  });

  const getRoleColor = (role) => {
    switch (role) {
      case "admin":
        return "red";
      case "user":
        return "blue";
      default:
        return "default";
    }
  };

  const columns = [
    {
      title: "ผู้ใช้",
      key: "user",
      render: (_, record) => (
        <Space>
          <Avatar
            style={{ backgroundColor: "#1890ff" }}
            icon={<UserOutlined />}
          >
            {record.name.charAt(0).toUpperCase()}
          </Avatar>
          <div>
            <Text strong>{record.name}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: "12px" }}>
              {record.email}
            </Text>
          </div>
        </Space>
      ),
      width: 250,
    },
    {
      title: "บทบาท",
      dataIndex: "role",
      key: "role",
      render: (role) => (
        <Tag color={getRoleColor(role)}>
          {role === "admin" ? "ผู้ดูแลระบบ" : "ผู้ใช้งาน"}
        </Tag>
      ),
      width: 120,
    },
    {
      title: "วันที่สร้าง",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => dayjs(date).format("DD/MM/YYYY"),
      width: 120,
    },
    {
      title: "การจัดการ",
      key: "actions",
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="ดูรายละเอียด">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => showUserDetail(record)}
            />
          </Tooltip>
          <Tooltip title="แก้ไข">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => showUserModal(record)}
            />
          </Tooltip>
          <Popconfirm
            title="ยืนยันการลบผู้ใช้"
            description={`คุณแน่ใจหรือไม่ที่จะลบผู้ใช้ "${record.name}"?`}
            onConfirm={() => handleDeleteUser(record)}
            okText="ลบ"
            cancelText="ยกเลิก"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="ลบ">
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
      width: 120,
    },
  ];

  return (
    <div className={`admin-layout ${sidebarVisible ? "" : "sidebar-closed"}`}>
      {sidebarVisible && <Sidebar />}

      <div className="content-area">
        <Header title="จัดการผู้ใช้งาน" toggleSidebar={toggleSidebar} />

        <div className="dashboard-container">
          <div className="content-wrapper">
            <Card className="song-management-card">
              <div className="card-header">
                <Title level={4}>รายการผู้ใช้งาน</Title>
                <div className="card-actions">
                  <Input
                    placeholder="ค้นหาชื่อหรืออีเมล..."
                    prefix={<SearchOutlined />}
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    style={{ width: 200 }}
                    allowClear
                  />
                  <Select
                    placeholder="บทบาท"
                    style={{ width: 120 }}
                    allowClear
                    value={roleFilter}
                    onChange={setRoleFilter}
                  >
                    <Option value="admin">ผู้ดูแลระบบ</Option>
                    {/* <Option value="user">ผู้ใช้งาน</Option> */}
                  </Select>
                  <Button onClick={handleSearch} icon={<SearchOutlined />}>
                    ค้นหา
                  </Button>
                  <Button
                    onClick={handleClearSearch}
                    disabled={!searchText && !roleFilter}
                  >
                    ล้าง
                  </Button>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => showUserModal()}
                  >
                    เพิ่มผู้ใช้ใหม่
                  </Button>
                </div>
              </div>

              <Table
                columns={columns}
                dataSource={filteredUsers}
                rowKey="id"
                loading={loading}
                pagination={{
                  current: pagination.current,
                  pageSize: pagination.pageSize,
                  total: pagination.total,
                  onChange: handlePaginationChange,
                  showSizeChanger: false,
                  showQuickJumper: true,
                  showTotal: (total, range) =>
                    `${range[0]}-${range[1]} จากทั้งหมด ${total} ผู้ใช้`,
                }}
                size="middle"
              />
            </Card>
          </div>
        </div>
      </div>

      {/* User Form Modal */}
      <Modal
        title={selectedUser ? "แก้ไขผู้ใช้" : "เพิ่มผู้ใช้ใหม่"}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setSelectedUser(null);
          form.resetFields();
        }}
        footer={null}
        width={600}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleUserSubmit}>
          <Form.Item
            name="name"
            label="ชื่อผู้ใช้"
            rules={[
              { required: true, message: "กรุณากรอกชื่อผู้ใช้" },
              { min: 2, message: "ชื่อต้องมีอย่างน้อย 2 ตัวอักษร" },
              { max: 50, message: "ชื่อต้องไม่เกิน 50 ตัวอักษร" },
            ]}
          >
            <Input placeholder="ชื่อผู้ใช้" prefix={<UserOutlined />} />
          </Form.Item>

          <Form.Item
            name="email"
            label="อีเมล"
            rules={[
              { required: true, message: "กรุณากรอกอีเมล" },
              { type: "email", message: "รูปแบบอีเมลไม่ถูกต้อง" },
            ]}
          >
            <Input placeholder="อีเมล" type="email" />
          </Form.Item>

          {!selectedUser && (
            <Form.Item
              name="password"
              label="รหัสผ่าน"
              rules={[
                { required: true, message: "กรุณากรอกรหัสผ่าน" },
                { min: 6, message: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร" },
              ]}
            >
              <Input.Password
                placeholder="รหัสผ่าน"
                prefix={<LockOutlined />}
              />
            </Form.Item>
          )}

          <Form.Item
            name="role"
            label="บทบาท"
            rules={[{ required: true, message: "กรุณาเลือกบทบาท" }]}
          >
            <Select placeholder="เลือกบทบาท">
              <Option value="admin">ผู้ดูแลระบบ</Option>
              {/* <Option value="user">ผู้ใช้งาน</Option> */}
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button
                onClick={() => {
                  setIsModalVisible(false);
                  setSelectedUser(null);
                  form.resetFields();
                }}
                disabled={loading}
              >
                ยกเลิก
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {selectedUser ? "บันทึกการแก้ไข" : "เพิ่มผู้ใช้"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* User Detail Modal */}
      <Modal
        title="รายละเอียดผู้ใช้"
        open={isDetailModalVisible}
        onCancel={() => {
          setIsDetailModalVisible(false);
          setSelectedUser(null);
        }}
        footer={[
          <Button
            key="close"
            onClick={() => {
              setIsDetailModalVisible(false);
              setSelectedUser(null);
            }}
          >
            ปิด
          </Button>,
          <Button
            key="edit"
            type="primary"
            onClick={() => {
              setIsDetailModalVisible(false);
              showUserModal(selectedUser);
            }}
            icon={<EditOutlined />}
          >
            แก้ไขผู้ใช้
          </Button>,
        ]}
        width={500}
      >
        {selectedUser && (
          <div style={{ padding: "20px 0" }}>
            <div style={{ textAlign: "center", marginBottom: "20px" }}>
              <Avatar
                size={80}
                style={{ backgroundColor: "#1890ff" }}
                icon={<UserOutlined />}
              >
                {selectedUser.name.charAt(0).toUpperCase()}
              </Avatar>
              <Title
                level={4}
                style={{ marginTop: "10px", marginBottom: "5px" }}
              >
                {selectedUser.name}
              </Title>
              <Tag color={getRoleColor(selectedUser.role)}>
                {selectedUser.role === "admin" ? "ผู้ดูแลระบบ" : "ผู้ใช้งาน"}
              </Tag>
            </div>

            <div>
              <p>
                <strong>อีเมล:</strong> {selectedUser.email}
              </p>
              <p>
                <strong>วันที่สร้างบัญชี:</strong>{" "}
                {dayjs(selectedUser.createdAt).format("DD/MM/YYYY HH:mm")}
              </p>
              <p>
                <strong>อัพเดตล่าสุด:</strong>{" "}
                {dayjs(selectedUser.updatedAt).format("DD/MM/YYYY HH:mm")}
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

UserManagement.propTypes = {
  sidebarVisible: PropTypes.bool.isRequired,
  toggleSidebar: PropTypes.func.isRequired,
};

export default UserManagement;
