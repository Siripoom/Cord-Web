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
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  TagsOutlined,
} from "@ant-design/icons";
import Sidebar from "../../components/Sidebar/Sidebar";
import Header from "../../components/Header/Header";
import {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../../services/songService";
import PropTypes from "prop-types";

const { Title, Text } = Typography;
const { TextArea } = Input;

const CategoryManagement = ({ sidebarVisible, toggleSidebar }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await getAllCategories();
      if (response.success) {
        setCategories(response.data);
      } else {
        message.error(response.message || "Failed to fetch categories");
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      message.error("An error occurred while fetching categories");
    } finally {
      setLoading(false);
    }
  };

  const showCategoryModal = (category = null) => {
    setSelectedCategory(category);
    if (category) {
      form.setFieldsValue({
        name: category.name,
        description: category.description,
      });
    } else {
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleCategorySubmit = async (values) => {
    try {
      setLoading(true);
      const categoryData = {
        name: values.name.trim(),
        description: values.description?.trim() || null,
      };

      const response = selectedCategory
        ? await updateCategory(selectedCategory.id, categoryData)
        : await createCategory(categoryData);

      if (response.success) {
        message.success(
          `หมวดหมู่${
            selectedCategory ? "ได้รับการอัพเดต" : "ถูกสร้าง"
          }เรียบร้อยแล้ว`
        );
        fetchCategories();
        setIsModalVisible(false);
        setSelectedCategory(null);
        form.resetFields();
      } else {
        message.error(response.message || "เกิดข้อผิดพลาด");
      }
    } catch (error) {
      console.error("Error saving category:", error);
      message.error("เกิดข้อผิดพลาดในการบันทึกหมวดหมู่");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (category) => {
    try {
      setLoading(true);
      const response = await deleteCategory(category.id);
      if (response.success) {
        message.success("ลบหมวดหมู่เรียบร้อยแล้ว");
        fetchCategories();
      } else {
        message.error(response.message || "เกิดข้อผิดพลาดในการลบ");
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      message.error("เกิดข้อผิดพลาดในการลบหมวดหมู่");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "ชื่อหมวดหมู่",
      dataIndex: "name",
      key: "name",
      render: (text) => (
        <Space>
          <TagsOutlined style={{ color: "#1890ff" }} />
          <Text strong>{text}</Text>
        </Space>
      ),
    },
    {
      title: "คำอธิบาย",
      dataIndex: "description",
      key: "description",
      render: (text) => text || <Text type="secondary">ไม่มีคำอธิบาย</Text>,
      ellipsis: true,
    },
    {
      title: "จำนวนเพลง",
      key: "songCount",
      render: (_, record) => (
        <Tag color="blue">{record._count?.songs || 0} เพลง</Tag>
      ),
      width: 120,
    },
    {
      title: "วันที่สร้าง",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => new Date(date).toLocaleDateString("th-TH"),
      width: 120,
    },
    {
      title: "การจัดการ",
      key: "actions",
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => showCategoryModal(record)}
            title="แก้ไข"
          />
          <Popconfirm
            title="ยืนยันการลบหมวดหมู่"
            description={
              record._count?.songs > 0
                ? `หมวดหมู่นี้มีเพลง ${record._count.songs} เพลง คุณแน่ใจหรือไม่ที่จะลบ?`
                : `คุณแน่ใจหรือไม่ที่จะลบหมวดหมู่ "${record.name}"?`
            }
            onConfirm={() => handleDeleteCategory(record)}
            okText="ลบ"
            cancelText="ยกเลิก"
            okButtonProps={{ danger: true }}
            disabled={record._count?.songs > 0}
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              title={
                record._count?.songs > 0
                  ? "ไม่สามารถลบได้เนื่องจากมีเพลงในหมวดหมู่นี้"
                  : "ลบ"
              }
              disabled={record._count?.songs > 0}
            />
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
        <Header title="จัดการหมวดหมู่เพลง" toggleSidebar={toggleSidebar} />

        <div className="dashboard-container">
          <div className="content-wrapper">
            <Card className="song-management-card">
              <div className="card-header">
                <Title level={4}>รายการหมวดหมู่เพลง</Title>
                <div className="card-actions">
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => showCategoryModal()}
                  >
                    เพิ่มหมวดหมู่ใหม่
                  </Button>
                </div>
              </div>

              <Table
                columns={columns}
                dataSource={categories}
                rowKey="id"
                loading={loading}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: false,
                  showQuickJumper: true,
                  showTotal: (total, range) =>
                    `${range[0]}-${range[1]} จากทั้งหมด ${total} หมวดหมู่`,
                }}
                size="middle"
              />
            </Card>
          </div>
        </div>
      </div>

      {/* Category Form Modal */}
      <Modal
        title={selectedCategory ? "แก้ไขหมวดหมู่" : "เพิ่มหมวดหมู่ใหม่"}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setSelectedCategory(null);
          form.resetFields();
        }}
        footer={null}
        width={600}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleCategorySubmit}>
          <Form.Item
            name="name"
            label="ชื่อหมวดหมู่"
            rules={[
              { required: true, message: "กรุณากรอกชื่อหมวดหมู่" },
              { max: 100, message: "ชื่อหมวดหมู่ต้องไม่เกิน 100 ตัวอักษร" },
            ]}
          >
            <Input placeholder="ชื่อหมวดหมู่" prefix={<TagsOutlined />} />
          </Form.Item>

          <Form.Item
            name="description"
            label="คำอธิบาย (ไม่บังคับ)"
            rules={[{ max: 500, message: "คำอธิบายต้องไม่เกิน 500 ตัวอักษร" }]}
          >
            <TextArea rows={4} placeholder="คำอธิบายเกี่ยวกับหมวดหมู่นี้..." />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button
                onClick={() => {
                  setIsModalVisible(false);
                  setSelectedCategory(null);
                  form.resetFields();
                }}
                disabled={loading}
              >
                ยกเลิก
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {selectedCategory ? "บันทึกการแก้ไข" : "เพิ่มหมวดหมู่"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

CategoryManagement.propTypes = {
  sidebarVisible: PropTypes.bool.isRequired,
  toggleSidebar: PropTypes.func.isRequired,
};

export default CategoryManagement;
