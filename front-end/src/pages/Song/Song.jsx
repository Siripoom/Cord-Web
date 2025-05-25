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
  message,
  Tag,
  Select,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import Sidebar from "../../components/Sidebar/Sidebar";
import Header from "../../components/Header/Header";
import ChordDisplay from "../../components/ChordDisplay"; // นำเข้าคอมโพเนนต์ใหม่
import {
  getAllSongs,
  getSongById,
  createSong,
  updateSong,
  deleteSong,
  getAllCategories,
} from "../../services/songService";
import "./Song.css";
import PropTypes from "prop-types";

const { Title } = Typography;
const { Option } = Select;

const SongManagement = ({ sidebarVisible, toggleSidebar }) => {
  const [songs, setSongs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selectedSong, setSelectedSong] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isSongDetailVisible, setIsSongDetailVisible] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [form] = Form.useForm();

  useEffect(() => {
    fetchSongs();
    fetchCategories();
  }, []);

  const fetchSongs = async (page = 1, limit = 10) => {
    setLoading(true);
    try {
      const response = await getAllSongs(page, limit);
      if (response.success) {
        setSongs(response.data);
        setPagination({
          current: response.pagination.page,
          pageSize: response.pagination.limit,
          total: response.pagination.totalSongs,
        });
      } else {
        message.error("Failed to fetch songs");
      }
    } catch (error) {
      console.error("Error fetching songs:", error);
      message.error("An error occurred while fetching songs");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await getAllCategories();
      if (response.success) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleSearch = () => {
    fetchSongs();
  };

  const showSongModal = (song = null) => {
    setSelectedSong(song);
    if (song) {
      form.setFieldsValue(song);
    } else {
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleSongSubmit = async (values) => {
    try {
      const songData = {
        title: values.title.trim(),
        artist: values.artist.trim(),
        lyrics: values.lyrics.trim(),
        defaultKey: values.defaultKey,
        categoryId: values.categoryId,
      };

      const response = selectedSong
        ? await updateSong(selectedSong.id, songData)
        : await createSong(songData);

      if (response.success) {
        message.success(
          `Song ${selectedSong ? "updated" : "created"} successfully`
        );
        fetchSongs(pagination.current, pagination.pageSize);
        setIsModalVisible(false);
        form.resetFields();
      } else {
        message.error(response.message || "An error occurred");
      }
    } catch (error) {
      console.error("Error saving song:", error);
      message.error("An error occurred while saving the song");
    }
  };

  const handleDeleteSong = async () => {
    try {
      const response = await deleteSong(selectedSong.id);
      if (response.success) {
        message.success("Song deleted successfully");
        fetchSongs(pagination.current, pagination.pageSize);
        setIsDeleteModalVisible(false);
      } else {
        message.error(response.message || "An error occurred while deleting");
      }
    } catch (error) {
      console.error("Error deleting song:", error);
      message.error("An error occurred while deleting the song");
    }
  };

  const viewSongDetails = async (song) => {
    try {
      const response = await getSongById(song.id);
      if (response.success) {
        setSelectedSong(response.data);
        setIsSongDetailVisible(true);
      } else {
        message.error(response.message || "Failed to load song details");
      }
    } catch (error) {
      console.error("Error fetching song details:", error);
      message.error("Failed to load song details");
    }
  };

  const columns = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: "Artist",
      dataIndex: "artist",
      key: "artist",
    },
    {
      title: "Key",
      dataIndex: "defaultKey",
      key: "defaultKey",
      render: (key) => <Tag color="blue">{key}</Tag>,
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      render: (category) => (category ? category.name : "-"),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => viewSongDetails(record)}
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => showSongModal(record)}
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => {
              setSelectedSong(record);
              setIsDeleteModalVisible(true);
            }}
          />
        </Space>
      ),
    },
  ];

  return (
    <div className={`admin-layout ${sidebarVisible ? "" : "sidebar-closed"}`}>
      {sidebarVisible && <Sidebar />}

      <div className="content-area">
        <Header title="จัดการเนื้อเพลง" toggleSidebar={toggleSidebar} />

        <div className="dashboard-container">
          <div className="content-wrapper">
            <Card className="song-management-card">
              <div className="card-header">
                <Title level={4}>รายการเนื้อเพลงทั้งหมด</Title>
                <div className="card-actions">
                  <Input
                    placeholder="ค้นหาเพลง..."
                    prefix={<SearchOutlined />}
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    onPressEnter={handleSearch}
                    style={{ width: 250 }}
                  />
                  <Select
                    placeholder="หมวดหมู่เพลง"
                    style={{ width: 200 }}
                    allowClear
                  >
                    {categories.map((category) => (
                      <Option key={category.id} value={category.id}>
                        {category.name}
                      </Option>
                    ))}
                  </Select>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => showSongModal()}
                  >
                    เพิ่มเพลงใหม่
                  </Button>
                </div>
              </div>

              <Table
                columns={columns}
                dataSource={songs}
                rowKey="id"
                pagination={false}
                loading={loading}
              />

              <div className="pagination-container">
                <Pagination
                  current={pagination.current}
                  total={pagination.total}
                  pageSize={pagination.pageSize}
                  onChange={(page, pageSize) => fetchSongs(page, pageSize)}
                  showSizeChanger={false}
                />
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Song Form Modal */}
      <Modal
        title={selectedSong ? "แก้ไขเพลง" : "เพิ่มเพลงใหม่"}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={800}
      >
        <Form form={form} layout="vertical" onFinish={handleSongSubmit}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="title"
                label="ชื่อเพลง"
                rules={[{ required: true, message: "กรุณากรอกชื่อเพลง" }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="artist"
                label="ศิลปิน"
                rules={[{ required: true, message: "กรุณากรอกชื่อศิลปิน" }]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="defaultKey"
                label="คีย์"
                rules={[{ required: true, message: "กรุณาเลือกคีย์" }]}
              >
                <Select>
                  {[
                    "C",
                    "C#",
                    "D",
                    "D#",
                    "E",
                    "F",
                    "F#",
                    "G",
                    "G#",
                    "A",
                    "A#",
                    "B",
                  ].map((key) => (
                    <Option key={key} value={key}>
                      {key}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="categoryId" label="หมวดหมู่">
                <Select allowClear>
                  {categories.map((category) => (
                    <Option key={category.id} value={category.id}>
                      {category.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="lyrics"
            label="เนื้อเพลงพร้อมคอร์ด"
            rules={[{ required: true, message: "กรุณากรอกเนื้อเพลง" }]}
            extra="วางคอร์ดในวงเล็บเหลี่ยม เช่น [C]เนื้อเพลง [Am]เนื้อเพลง"
          >
            <Input.TextArea rows={15} />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button
                onClick={() => {
                  setIsModalVisible(false);
                  form.resetFields();
                }}
              >
                ยกเลิก
              </Button>
              <Button type="primary" htmlType="submit">
                {selectedSong ? "บันทึกการแก้ไข" : "เพิ่มเพลง"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        title="ยืนยันการลบเพลง"
        open={isDeleteModalVisible}
        onOk={handleDeleteSong}
        onCancel={() => setIsDeleteModalVisible(false)}
        okText="ลบ"
        cancelText="ยกเลิก"
        okButtonProps={{ danger: true }}
      >
        <p>คุณแน่ใจหรือไม่ที่จะลบเพลง "{selectedSong?.title}"?</p>
      </Modal>

      {/* Song Detail Modal */}
      <Modal
        title={selectedSong?.title}
        open={isSongDetailVisible}
        onCancel={() => setIsSongDetailVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsSongDetailVisible(false)}>
            ปิด
          </Button>,
          <Button
            key="edit"
            type="primary"
            onClick={() => {
              setIsSongDetailVisible(false);
              showSongModal(selectedSong);
            }}
          >
            แก้ไขเพลง
          </Button>,
        ]}
        width={800}
      >
        {selectedSong && (
          <div className="song-detail">
            <div className="song-header">
              <h2>{selectedSong.title}</h2>
              <p>ศิลปิน: {selectedSong.artist}</p>
              <p>
                คีย์: <Tag color="blue">{selectedSong.defaultKey}</Tag>
              </p>
              {selectedSong.category && (
                <p>
                  หมวดหมู่:{" "}
                  <Tag color="green">{selectedSong.category.name}</Tag>
                </p>
              )}
            </div>

            <Card title="เนื้อเพลงพร้อมคอร์ด" className="lyrics-card">
              {/* ใช้คอมโพเนนต์ ChordDisplay ที่สร้างขึ้นใหม่ */}
              <ChordDisplay
                lyrics={selectedSong.lyrics || []}
                defaultKey={selectedSong.defaultKey}
              />
            </Card>
          </div>
        )}
      </Modal>
    </div>
  );
};

SongManagement.propTypes = {
  sidebarVisible: PropTypes.bool.isRequired,
  toggleSidebar: PropTypes.func.isRequired,
};

export default SongManagement;
