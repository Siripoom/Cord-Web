import { useEffect, useState } from "react";
import {
  Card, Row, Col, Typography, Button, Input, Table, Pagination, 
  Space, Select, Modal, Form, message, Tag, Tabs, Dropdown, Menu
} from "antd";
import {
  PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, 
  EyeOutlined, DownOutlined, FileTextOutlined, SwapOutlined
} from "@ant-design/icons";
import Sidebar from "../../components/Sidebar/Sidebar";
import Header from "../../components/Header/Header";
import { 
  getAllSongs, getSongById, createSong, updateSong, 
  deleteSong, searchSongs, getAllCategories 
} from "../../services/songService";
import "./Song.css";
import PropTypes from "prop-types";

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;
const { TextArea } = Input;

const SongManagement = ({ sidebarVisible, toggleSidebar }) => {
  // State
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
    total: 0
  });
  const [form] = Form.useForm();
  const token = localStorage.getItem("token");

  // Effect to load songs and categories on component mount
  useEffect(() => {
    fetchSongs();
    fetchCategories();
  }, []);

  // Fetch songs function
  const fetchSongs = async (page = 1, limit = 10) => {
    setLoading(true);
    try {
      const response = await getAllSongs(page, limit, token);
      if (response.success) {
        setSongs(response.data);
        setPagination({
          current: response.pagination.page,
          pageSize: response.pagination.limit,
          total: response.pagination.totalSongs
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

  // Fetch categories function
  const fetchCategories = async () => {
    try {
      const response = await getAllCategories(token);
      if (response.success) {
        setCategories(response.data);
      } else {
        message.error("Failed to fetch categories");
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      message.error("An error occurred while fetching categories");
    }
  };

  // Handle search
  const handleSearch = async () => {
    if (!searchText) {
      return fetchSongs();
    }
    
    setLoading(true);
    try {
      const response = await searchSongs(searchText, 1, 10, token);
      if (response.success) {
        setSongs(response.data);
        setPagination({
          current: response.pagination.page,
          pageSize: response.pagination.limit,
          total: response.pagination.totalSongs
        });
      } else {
        message.error("Search failed");
      }
    } catch (error) {
      console.error("Error searching songs:", error);
      message.error("An error occurred while searching");
    } finally {
      setLoading(false);
    }
  };

  // Show song modal (create/edit)
  const showSongModal = (song = null) => {
    setSelectedSong(song);
    
    if (song) {
      form.setFieldsValue({
        title: song.title,
        artist: song.artist,
        lyrics: song.lyrics,
        defaultKey: song.defaultKey,
        categoryId: song.categoryId
      });
    } else {
      form.resetFields();
    }
    
    setIsModalVisible(true);
  };

  // Handle song form submission
  const handleSongSubmit = async (values) => {
    try {
      let response;
      
      if (selectedSong) {
        // Update song
        response = await updateSong(selectedSong.id, values, token);
        if (response.success) {
          message.success("Song updated successfully");
          fetchSongs(pagination.current, pagination.pageSize);
        } else {
          message.error("Failed to update song");
        }
      } else {
        // Create song
        response = await createSong(values, token);
        if (response.success) {
          message.success("Song created successfully");
          fetchSongs(pagination.current, pagination.pageSize);
        } else {
          message.error("Failed to create song");
        }
      }
      
      setIsModalVisible(false);
      setSelectedSong(null);
    } catch (error) {
      console.error("Error saving song:", error);
      message.error("An error occurred while saving the song");
    }
  };

  // Delete song confirmation
  const showDeleteConfirm = (song) => {
    setSelectedSong(song);
    setIsDeleteModalVisible(true);
  };

  // Handle song deletion
  const handleDeleteSong = async () => {
    if (!selectedSong) return;
    
    try {
      const response = await deleteSong(selectedSong.id, token);
      if (response.success) {
        message.success("Song deleted successfully");
        fetchSongs(pagination.current, pagination.pageSize);
      } else {
        message.error("Failed to delete song");
      }
      
      setIsDeleteModalVisible(false);
      setSelectedSong(null);
    } catch (error) {
      console.error("Error deleting song:", error);
      message.error("An error occurred while deleting the song");
    }
  };

  // View song details
  const viewSongDetails = async (song) => {
    try {
      const response = await getSongById(song.id, token);
      if (response.success) {
        setSelectedSong(response.data);
        setIsSongDetailVisible(true);
      } else {
        message.error("Failed to load song details");
      }
    } catch (error) {
      console.error("Error fetching song details:", error);
      message.error("An error occurred while loading song details");
    }
  };

  // Handle pagination change
  const handlePageChange = (page, pageSize) => {
    fetchSongs(page, pageSize);
  };

  // Song table columns
  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: 'Artist',
      dataIndex: 'artist',
      key: 'artist',
    },
    {
      title: 'Key',
      dataIndex: 'defaultKey',
      key: 'defaultKey',
      render: (key) => <Tag color="blue">{key}</Tag>,
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (category) => category ? category.name : '-',
    },
    {
      title: 'Actions',
      key: 'actions',
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
            onClick={() => showDeleteConfirm(record)}
          />
        </Space>
      ),
    },
  ];

  // Render chords in lyrics for display
  const renderLyricsWithChords = (lyrics) => {
    // Basic rendering - you can enhance this later
    return lyrics.split('\n').map((line, i) => (
      <div key={i} className="lyrics-line">
        {line}
      </div>
    ));
  };

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
                    style={{ width: 250, marginRight: 16 }}
                  />
                  <Select
                    placeholder="หมวดหมู่เพลง"
                    style={{ width: 200, marginRight: 16 }}
                    allowClear
                    onChange={(value) => {
                      // Filter by category - can implement later
                    }}
                  >
                    {categories.map(category => (
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
                  pageSize={pagination.pageSize}
                  total={pagination.total}
                  onChange={handlePageChange}
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
        visible={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setSelectedSong(null);
        }}
        footer={null}
        width={800}
      >
        <Form 
          form={form} 
          layout="vertical" 
          onFinish={handleSongSubmit}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="title"
                label="ชื่อเพลง"
                rules={[{ required: true, message: "กรุณากรอกชื่อเพลง" }]}
              >
                <Input placeholder="ชื่อเพลง" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="artist"
                label="ศิลปิน"
                rules={[{ required: true, message: "กรุณากรอกชื่อศิลปิน" }]}
              >
                <Input placeholder="ศิลปิน" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="defaultKey"
                label="คีย์เริ่มต้น"
                rules={[{ required: true, message: "กรุณากรอกคีย์เริ่มต้น" }]}
              >
                <Select placeholder="เลือกคีย์เริ่มต้น">
                  {['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'].map(key => (
                    <Option key={key} value={key}>{key}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="categoryId"
                label="หมวดหมู่"
              >
                <Select placeholder="เลือกหมวดหมู่" allowClear>
                  {categories.map(category => (
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
            extra="วางคอร์ดไว้ในวงเล็บเหลี่ยม เช่น [C], [Em], [F], [G7]"
          >
            <TextArea 
              rows={15} 
              placeholder="เนื้อเพลงพร้อมคอร์ด เช่น [C]เธอจะจาก[G]ฉันไปแล้ว" 
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button 
                onClick={() => {
                  setIsModalVisible(false);
                  setSelectedSong(null);
                }}
              >
                ยกเลิก
              </Button>
              <Button type="primary" htmlType="submit">
                {selectedSong ? "บันทึกการเปลี่ยนแปลง" : "เพิ่มเพลง"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        title="ยืนยันการลบเพลง"
        visible={isDeleteModalVisible}
        onCancel={() => {
          setIsDeleteModalVisible(false);
          setSelectedSong(null);
        }}
        onOk={handleDeleteSong}
        okText="ลบ"
        cancelText="ยกเลิก"
        okButtonProps={{ danger: true }}
      >
        <p>คุณแน่ใจหรือว่าต้องการลบเพลง "{selectedSong?.title}" ของ {selectedSong?.artist}?</p>
        <p>การกระทำนี้ไม่สามารถเรียกคืนได้</p>
      </Modal>

      {/* Song Detail Modal */}
      <Modal
        title={selectedSong?.title}
        visible={isSongDetailVisible}
        onCancel={() => {
          setIsSongDetailVisible(false);
          setSelectedSong(null);
        }}
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
          </Button>
        ]}
        width={800}
      >
        {selectedSong && (
          <div className="song-detail">
            <div className="song-header">
              <h2>{selectedSong.title}</h2>
              <p>ศิลปิน: {selectedSong.artist}</p>
              <p>คีย์: <Tag color="blue">{selectedSong.defaultKey}</Tag></p>
              {selectedSong.category && (
                <p>หมวดหมู่: <Tag color="green">{selectedSong.category.name}</Tag></p>
              )}
            </div>
            
            <Card title="เนื้อเพลงพร้อมคอร์ด" className="lyrics-card">
              <div className="lyrics-content">
                {renderLyricsWithChords(selectedSong.lyrics)}
              </div>
              
              <div className="chord-controls" style={{ marginTop: 16 }}>
                <Space>
                  <Button type="primary" icon={<SwapOutlined />}>
                    เปลี่ยนคีย์
                  </Button>
                  <Select defaultValue={selectedSong.defaultKey} style={{ width: 80 }}>
                    {['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'].map(key => (
                      <Option key={key} value={key}>{key}</Option>
                    ))}
                  </Select>
                </Space>
              </div>
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