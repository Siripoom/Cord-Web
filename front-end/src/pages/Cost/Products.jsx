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
  Tag,
  Popconfirm,
  message,
  Statistic,
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ShopOutlined,
  DollarOutlined,
  BarcodeOutlined,
  TagsOutlined,
} from "@ant-design/icons";

import "./Products.css";
import PropTypes from "prop-types";
import { addProduct, deleteProduct, getProducts, getSuppliers, updateProduct } from "../../services/api";

const { Title, Text } = Typography;
const { Option } = Select;

const Products = ({ sidebarVisible }) => {
  const [products, setProducts] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);
  const [suppliers, setSuppliers] = useState([]);
  const [form] = Form.useForm();
  const [stats, setStats] = useState({
    totalProducts: 0,
    avgCostPrice: 0,
    avgSellingPrice: 0,
    avgProfit: 0,
    categories: [],
  });

  const pageSize = 10;
  const token = localStorage.getItem("token");
  let totalProducts = 0;
  let totalCostPrice = 0;
  let totalSellingPrice = 0;
  // Load mock data for products
  const fetchProduct = async () => {
    try {
      const res = await getProducts(token);
      console.log(res)
      totalProducts = res.data.length;
      totalCostPrice = res.data.reduce(
        (sum, product) => sum + product.costPrice,
        0
      );
      totalSellingPrice = res.data.reduce(
        (sum, product) => sum + product.sellingPrice,
        0
      );

      const categoryMap = {};
      res.data.forEach((product) => {
        if (!categoryMap[product.category]) {
          categoryMap[product.category] = {
            count: 0,
            totalCost: 0,
            totalSelling: 0,
          };
        }
        categoryMap[product.category].count += 1;
        categoryMap[product.category].totalCost += product.costPrice;
        categoryMap[product.category].totalSelling += product.sellingPrice;
      });

      const categories = Object.keys(categoryMap).map((category) => ({
        name: category,
        count: categoryMap[category].count,
        avgPrice:
          categoryMap[category].totalSelling / categoryMap[category].count,
      }));

      setStats({
        totalProducts,
        avgCostPrice: totalCostPrice / totalProducts,
        avgSellingPrice: totalSellingPrice / totalProducts,
        avgProfit: (totalSellingPrice - totalCostPrice) / totalProducts,
        categories,
      });

      setProducts(res.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };
  const fetchSuppliers = async () => {
    try {
      const res = await getSuppliers(token);
      console.log(res)
      setSuppliers(res.data);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
    }
  };
  useEffect(() => {
    fetchProduct();
    fetchSuppliers();
  }, []);


  // Filter products based on search text
  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchText.toLowerCase()) ||
      product.category.toLowerCase().includes(searchText.toLowerCase())
  );

  // Show modal for adding/editing product
  const showModal = (product = null) => {
    setSelectedProduct(product);
   
    if (product) {
      form.setFieldsValue({
        name: product.name,
        category: product.category,
        costPrice: product.costPrice,
        sellingPrice: product.sellingPrice,
        supplierId: product.supplier.id,
      });
    } else {
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  // Close modal
  const handleCancel = () => {
    setIsModalVisible(false);
    setSelectedProduct(null);
  };

  // Handle form submission
  const handleSubmit = async (values) => {
    if (selectedProduct) {
      // Update existing product
      const res = await updateProduct(
        values,
        selectedProduct.id,
        token
      );
      if (!res.success) {
        message.error("เกิดข้อผิดพลาดในการอัพเดตสินค้า");
        return;
      }
      const updatedProducts = products.map((p) =>
        p.id === selectedProduct.id
          ? {
            ...p,
            ...values,
            updatedAt: new Date().toISOString().split("T")[0],
          }
          : p
      );
      setProducts(updatedProducts);
      message.success("อัพเดตข้อมูลสินค้าเรียบร้อยแล้ว");
    } else {
      // Create new product
      const res = await addProduct(values, token);
      console.log(res)
      if (!res.success) {
        message.error("เกิดข้อผิดพลาดในการเพิ่มสินค้า");
        return;
      }
      setProducts([...products, res.data]);
      fetchProduct();
      message.success("เพิ่มสินค้าใหม่เรียบร้อยแล้ว");
    }
    setIsModalVisible(false);
  };

  // Show delete confirmation dialog
  const showDeleteConfirm = (product) => {
    setProductToDelete(product);
    setIsDeleteModalVisible(true);
  };

  // Handle product deletion
  const handleDeleteConfirm = async () => {
    if (productToDelete) {
      const res = await deleteProduct(
        productToDelete.id,
        token
      );
      if (!res.success) {
        message.error("เกิดข้อผิดพลาดในการลบสินค้า");
        return;
      }
      const updatedProducts = products.filter(
        (p) => p.id !== productToDelete.id
      );
      setProducts(updatedProducts);
      message.success("ลบสินค้าเรียบร้อยแล้ว");
      setIsDeleteModalVisible(false);
      setProductToDelete(null);
    }
  };

  // Table columns
  const columns = [
    {
      title: "รหัสสินค้า",
      dataIndex: "id",
      key: "id",
      width: 100,
    },
    {
      title: "ชื่อสินค้า",
      dataIndex: "name",
      key: "name",
      ellipsis: true,
    },
    {
      title: "ซัพพลายเออร์",
      dataIndex: "supplier",
      key: "supplier",
      render: (supplirer) => (
        <Text
          style={{
            fontWeight: "bold",
            color: "#1890ff",
            textDecoration: "underline",
          }}
        >
          {supplirer? supplirer.name : '-'}
        </Text>
      ),
    },
    {
      title: "หมวดหมู่",
      dataIndex: "category",
      key: "category",
      render: (category) => <Tag color="blue">{category}</Tag>,
    },
    {
      title: "ราคาต้นทุน",
      dataIndex: "costPrice",
      key: "costPrice",
      render: (price) => `฿${price.toFixed(2)}`,
      sorter: (a, b) => a.costPrice - b.costPrice,
    },
    {
      title: "ราคาขาย",
      dataIndex: "sellingPrice",
      key: "sellingPrice",
      render: (price) => `฿${price.toFixed(2)}`,
      sorter: (a, b) => a.sellingPrice - b.sellingPrice,
    },
    {
      title: "กำไร",
      key: "profit",
      render: (_, record) => {
        const profit = record.sellingPrice - record.costPrice;
        const profitPercent = ((profit / record.costPrice) * 100).toFixed(0);
        return (
          <span style={{ color: profit > 0 ? "#52c41a" : "#f5222d" }}>
            ฿{profit.toFixed(2)} ({profitPercent}%)
          </span>
        );
      },
      sorter: (a, b) =>
        a.sellingPrice - a.costPrice - (b.sellingPrice - b.costPrice),
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
          <Popconfirm
            title="คุณแน่ใจหรือไม่ที่จะลบสินค้านี้?"
            onConfirm={() => showDeleteConfirm(record)}
            okText="ใช่"
            cancelText="ไม่"
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className={`admin-layout ${sidebarVisible ? "" : "sidebar-closed"}`}>
      <div className="costs-container">
        <div className="content-wrapper">
          {/* Statistics Section */}
          <Row gutter={[16, 16]} className="mb-4">
            <Col xs={24} sm={12} md={6}>
              <Card className="stat-card">
                <Statistic
                  title="จำนวนสินค้าทั้งหมด"
                  value={stats.totalProducts}
                  prefix={<BarcodeOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card className="stat-card">
                <Statistic
                  title="ราคาต้นทุนเฉลี่ย"
                  value={stats.avgCostPrice}
                  precision={2}
                  prefix={<DollarOutlined />}
                  suffix="฿"
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card className="stat-card">
                <Statistic
                  title="ราคาขายเฉลี่ย"
                  value={stats.avgSellingPrice}
                  precision={2}
                  prefix={<DollarOutlined />}
                  suffix="฿"
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card className="stat-card">
                <Statistic
                  title="กำไรเฉลี่ย"
                  value={stats.avgProfit}
                  precision={2}
                  valueStyle={{ color: "#3f8600" }}
                  prefix={<DollarOutlined />}
                  suffix="฿"
                />
              </Card>
            </Col>
          </Row>

          {/* Category Stats */}
          <Card className="mb-4" title="สถิติตามหมวดหมู่">
            <Row gutter={[16, 16]}>
              {stats.categories.map((category, index) => (
                <Col xs={24} sm={12} md={8} key={index}>
                  <Card size="small" className="category-card">
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <TagsOutlined
                        style={{
                          fontSize: "24px",
                          marginRight: "12px",
                          color: "#1890ff",
                        }}
                      />
                      <div>
                        <div style={{ fontWeight: "bold" }}>
                          {category.name}
                        </div>
                        <div>จำนวน: {category.count} รายการ</div>
                        <div>ราคาเฉลี่ย: ฿{category.avgPrice.toFixed(2)}</div>
                      </div>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>

          {/* Product List Card */}
          <Card className="product-card">
            <div className="card-header">
              <Title level={4}>รายการสินค้า</Title>
              <div className="card-actions">
                <Input
                  placeholder="ค้นหาสินค้า..."
                  prefix={<SearchOutlined />}
                  onChange={(e) => setSearchText(e.target.value)}
                  style={{ width: 250, marginRight: 16 }}
                />
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => showModal()}
                >
                  เพิ่มสินค้า
                </Button>
              </div>
            </div>

            <Table
              columns={columns}
              dataSource={filteredProducts.slice(
                (currentPage - 1) * pageSize,
                currentPage * pageSize
              )}
              rowKey="id"
              pagination={false}
            />

            <div className="pagination-container">
              <Pagination
                current={currentPage}
                total={filteredProducts.length}
                pageSize={pageSize}
                onChange={setCurrentPage}
                showSizeChanger={false}
              />
            </div>
          </Card>
        </div>
      </div>

      {/* Add/Edit Product Modal */}
      <Modal
        title={selectedProduct ? "แก้ไขสินค้า" : "เพิ่มสินค้าใหม่"}
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="name"
                label="ชื่อสินค้า"
                rules={[{ required: true, message: "กรุณากรอกชื่อสินค้า" }]}
              >
                <Input prefix={<ShopOutlined />} placeholder="ชื่อสินค้า" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="category"
                label="หมวดหมู่"
                rules={[{ required: true, message: "กรุณาเลือกหมวดหมู่" }]}
              >
                <Select placeholder="เลือกหมวดหมู่">
                  <Option value="อะไหล่รถยนต์">อะไหล่รถยนต์</Option>
                  <Option value="น้ำมันและสารหล่อลื่น">
                    น้ำมันและสารหล่อลื่น
                  </Option>
                  <Option value="ยางรถยนต์">ยางรถยนต์</Option>
                  <Option value="อุปกรณ์ตกแต่ง">อุปกรณ์ตกแต่ง</Option>
                  <Option value="อุปกรณ์ตกแต่งภายใน">อุปกรณ์ตกแต่งภายใน</Option>
                  <Option value="อื่นๆ">อื่นๆ</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="supplierId"
                label="ซัพพลายเออร์" 
                rules={[{ required: true, message: "กรุณาเลือกซัพพลายเออร์" }]}
              >
                <Select placeholder="เลือกหมวดหมู่">
                  {suppliers.map((supplier) => (
                    <Option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="costPrice"
                label="ราคาต้นทุน (บาท)"
                rules={[
                  { required: true, message: "กรุณากรอกราคาต้นทุน" },
                  { type: "number", min: 0, message: "ราคาต้องเป็นจำนวนบวก" },
                ]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  prefix="฿"
                  precision={2}
                  placeholder="0.00"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="sellingPrice"
                label="ราคาขาย (บาท)"
                rules={[
                  { required: true, message: "กรุณากรอกราคาขาย" },
                  { type: "number", min: 0, message: "ราคาต้องเป็นจำนวนบวก" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("costPrice") <= value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        new Error("ราคาขายต้องมากกว่าหรือเท่ากับราคาต้นทุน")
                      );
                    },
                  }),
                ]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  prefix="฿"
                  precision={2}
                  placeholder="0.00"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item className="form-actions">
            <Space>
              <Button type="default" onClick={handleCancel}>
                ยกเลิก
              </Button>
              <Button type="primary" htmlType="submit">
                {selectedProduct ? "บันทึกการเปลี่ยนแปลง" : "เพิ่มสินค้า"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        title="ยืนยันการลบสินค้า"
        visible={isDeleteModalVisible}
        onCancel={() => setIsDeleteModalVisible(false)}
        onOk={handleDeleteConfirm}
        okText="ลบ"
        cancelText="ยกเลิก"
        okButtonProps={{ danger: true }}
      >
        <p>คุณแน่ใจหรือไม่ที่จะลบสินค้า "{productToDelete?.name}"?</p>
        <p>การกระทำนี้ไม่สามารถย้อนกลับได้</p>
      </Modal>
    </div>
  );
};

Products.propTypes = {
  sidebarVisible: PropTypes.bool.isRequired,
  toggleSidebar: PropTypes.func.isRequired,
};

export default Products;
