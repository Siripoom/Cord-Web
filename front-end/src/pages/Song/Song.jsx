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
  Spin,
  Divider,
  Popconfirm,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ClearOutlined,
} from "@ant-design/icons";
import Sidebar from "../../components/Sidebar/Sidebar";
import Header from "../../components/Header/Header";
import ChordDisplay from "../../components/ChordDisplay";
import ImageGallery from "../../components/ImageGallery/ImageGallery";
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

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const SongManagement = ({ sidebarVisible, toggleSidebar }) => {
  // State สำหรับข้อมูลทั้งหมด
  const [allSongs, setAllSongs] = useState([]); // เก็บข้อมูลเพลงทั้งหมด
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  // State สำหรับการค้นหาและกรอง
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);

  // State สำหรับการแสดงผลและ pagination
  const [filteredSongs, setFilteredSongs] = useState([]);
  const [displaySongs, setDisplaySongs] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // State สำหรับ Modal
  const [selectedSong, setSelectedSong] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isSongDetailVisible, setIsSongDetailVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchAllData();
  }, []);

  // ฟังก์ชันกรองและอัพเดตผลลัพธ์
  useEffect(() => {
    filterAndUpdateResults();
  }, [allSongs, searchText, selectedCategory, pagination.current]);

  // ฟังก์ชันเรียงลำดับภาษาไทย
  const sortThaiText = (a, b) => {
    return a.title.localeCompare(b.title, "th", {
      sensitivity: "base",
      numeric: true,
    });
  };

  // โหลดข้อมูลทั้งหมดครั้งเดียว
  const fetchAllData = async () => {
    setLoading(true);
    try {
      // โหลดเพลงทั้งหมด (เพิ่ม limit ให้สูงเพื่อดึงทั้งหมด)
      const songsResponse = await getAllSongs(1, 1000); // ดึงสูงสุด 1000 เพลง

      if (songsResponse.success) {
        // เรียงลำดับตามชื่อเพลง ก-ฮ
        const sortedSongs = (songsResponse.data || []).sort(sortThaiText);
        setAllSongs(sortedSongs);
      } else {
        console.error("Failed to fetch songs:", songsResponse.message);
        setAllSongs([]);
      }

      // โหลดหมวดหมู่
      const categoriesResponse = await getAllCategories();
      if (categoriesResponse.success) {
        setCategories(categoriesResponse.data || []);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setAllSongs([]);
      message.error("เกิดข้อผิดพลาดในการโหลดข้อมูล");
    } finally {
      setLoading(false);
    }
  };

  // ฟังก์ชันกรองข้อมูล
  const filterAndUpdateResults = () => {
    let filtered = [...allSongs];

    // กรองตามการค้นหา (ชื่อเพลง, ศิลปิน)
    if (searchText.trim()) {
      const searchLower = searchText.toLowerCase().trim();
      filtered = filtered.filter(
        (song) =>
          song.title.toLowerCase().includes(searchLower) ||
          song.artist.toLowerCase().includes(searchLower)
      );
    }

    // กรองตามหมวดหมู่
    if (selectedCategory) {
      filtered = filtered.filter(
        (song) => song.categoryId === selectedCategory
      );
    }

    // เรียงลำดับใหม่หลังกรอง (ก-ฮ)
    filtered.sort(sortThaiText);

    // อัพเดต filtered songs
    setFilteredSongs(filtered);

    // คำนวณ pagination
    const total = filtered.length;
    const startIndex = (pagination.current - 1) * pagination.pageSize;
    const endIndex = startIndex + pagination.pageSize;
    const currentPageSongs = filtered.slice(startIndex, endIndex);

    // อัพเดต display songs และ pagination
    setDisplaySongs(currentPageSongs);
    setPagination((prev) => ({
      ...prev,
      total: total,
    }));
  };

  // ฟังก์ชันการค้นหา
  const handleSearch = () => {
    // รีเซ็ต pagination กลับไปหน้าแรก
    setPagination((prev) => ({
      ...prev,
      current: 1,
    }));
  };

  // ฟังก์ชันกรองหมวดหมู่
  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    // รีเซ็ต pagination กลับไปหน้าแรก
    setPagination((prev) => ({
      ...prev,
      current: 1,
    }));
  };

  // ฟังก์ชันล้างการค้นหา
  const handleClearSearch = () => {
    setSearchText("");
    setSelectedCategory(null);
    setPagination((prev) => ({
      ...prev,
      current: 1,
    }));
  };

  // ฟังก์ชันเปลี่ยนหน้า
  const handlePaginationChange = (page, pageSize) => {
    setPagination((prev) => ({
      ...prev,
      current: page,
      pageSize: pageSize || prev.pageSize,
    }));
  };

  // ฟังก์ชันแสดง Modal เพิ่ม/แก้ไขเพลง
  const showSongModal = async (song = null) => {
    if (song) {
      try {
        setLoading(true);

        // Load full song data with lyrics if editing
        const response = await getSongById(song.id);
        if (response.success) {
          const fullSong = response.data;
          console.log("Full song data for editing:", fullSong);

          // Convert lyrics array back to raw format - รองรับทั้ง 2 รูปแบบ
          let lyricsRaw = "";
          if (fullSong.lyrics && Array.isArray(fullSong.lyrics)) {
            lyricsRaw = fullSong.lyrics
              .map((item) => {
                if (item.chord) {
                  // ตรวจสอบ chordType และใช้ bracket ที่เหมาะสม
                  if (item.chordType === "inline") {
                    return `{${item.chord}}${item.word}`;
                  } else {
                    // default หรือ "above"
                    return `[${item.chord}]${item.word}`;
                  }
                } else {
                  return item.word;
                }
              })
              .join("");
          }

          form.setFieldsValue({
            title: fullSong.title,
            artist: fullSong.artist,
            defaultKey: fullSong.defaultKey,
            categoryId: fullSong.categoryId,
            lyrics: lyricsRaw,
          });

          setSelectedSong(fullSong);
        } else {
          message.error("ไม่สามารถโหลดข้อมูลเพลงได้");
          return;
        }
      } catch (error) {
        console.error("Error loading song for edit:", error);
        message.error("เกิดข้อผิดพลาดในการโหลดข้อมูล");
        return;
      } finally {
        setLoading(false);
      }
    } else {
      form.resetFields();
      setSelectedSong(null);
    }
    setIsModalVisible(true);
  };

  // ฟังก์ชันบันทึกเพลง
  const handleSongSubmit = async (values) => {
    try {
      setLoading(true);
      const songData = {
        title: values.title.trim(),
        artist: values.artist.trim(),
        lyrics: values.lyrics.trim(),
        defaultKey: values.defaultKey,
        categoryId: values.categoryId || null,
      };

      const response = selectedSong
        ? await updateSong(selectedSong.id, songData)
        : await createSong(songData);

      if (response.success) {
        message.success(
          `เพลง${selectedSong ? "ได้รับการอัพเดต" : "ถูกสร้าง"}เรียบร้อยแล้ว`
        );

        // รีเฟรชข้อมูลทั้งหมด
        await fetchAllData();

        setIsModalVisible(false);
        setSelectedSong(null);
        form.resetFields();
      } else {
        message.error(response.message || "เกิดข้อผิดพลาด");
        if (response.errors && response.errors.length > 0) {
          response.errors.forEach((error) => {
            message.error(`${error.field}: ${error.message}`);
          });
        }
      }
    } catch (error) {
      console.error("Error saving song:", error);
      message.error("เกิดข้อผิดพลาดในการบันทึกเพลง");
    } finally {
      setLoading(false);
    }
  };

  // ฟังก์ชันลบเพลง
  const handleDeleteSong = async (song) => {
    try {
      setLoading(true);
      const response = await deleteSong(song.id);
      if (response.success) {
        message.success("ลบเพลงเรียบร้อยแล้ว");

        // รีเฟรชข้อมูลทั้งหมด
        await fetchAllData();
      } else {
        message.error(response.message || "เกิดข้อผิดพลาดในการลบ");
      }
    } catch (error) {
      console.error("Error deleting song:", error);
      message.error("เกิดข้อผิดพลาดในการลบเพลง");
    } finally {
      setLoading(false);
    }
  };

  // ฟังก์ชันดูรายละเอียดเพลง
  const viewSongDetails = async (song) => {
    try {
      setLoading(true);
      const response = await getSongById(song.id);
      if (response.success) {
        console.log("Song details loaded:", response.data);
        setSelectedSong(response.data);
        setIsSongDetailVisible(true);
      } else {
        message.error(response.message || "ไม่สามารถโหลดรายละเอียดเพลงได้");
      }
    } catch (error) {
      console.error("Error fetching song details:", error);
      message.error("ไม่สามารถโหลดรายละเอียดเพลงได้");
    } finally {
      setLoading(false);
    }
  };

  // สถิติการค้นหา
  const getSearchStats = () => {
    if (searchText || selectedCategory) {
      return {
        filtered: filteredSongs.length,
        total: allSongs.length,
        hasFilter: true,
      };
    }
    return {
      filtered: allSongs.length,
      total: allSongs.length,
      hasFilter: false,
    };
  };

  const searchStats = getSearchStats();

  // คอลัมน์ของตาราง
  const columns = [
    {
      title: "ชื่อเพลง",
      dataIndex: "title",
      key: "title",
      render: (text) => <Text strong>{text}</Text>,
      ellipsis: true,
    },
    {
      title: "ศิลปิน",
      dataIndex: "artist",
      key: "artist",
      ellipsis: true,
    },
    {
      title: "คีย์",
      dataIndex: "defaultKey",
      key: "defaultKey",
      render: (key) => <Tag color="blue">{key}</Tag>,
      width: 80,
    },
    {
      title: "หมวดหมู่",
      dataIndex: "category",
      key: "category",
      render: (category) =>
        category ? (
          <Tag color="green">{category.name}</Tag>
        ) : (
          <Tag>ไม่ระบุ</Tag>
        ),
      width: 120,
    },
    // {
    //   title: "จำนวนคำ",
    //   key: "wordCount",
    //   render: (_, record) => (
    //     <Text type="secondary">{record._count?.lyrics || 0} คำ</Text>
    //   ),
    //   width: 100,
    // },
    {
      title: "การจัดการ",
      key: "actions",
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => viewSongDetails(record)}
            title="ดูรายละเอียด"
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => showSongModal(record)}
            title="แก้ไข"
          />
          <Popconfirm
            title="ยืนยันการลบเพลง"
            description={`คุณแน่ใจหรือไม่ที่จะลบเพลง "${record.title}"?`}
            onConfirm={() => handleDeleteSong(record)}
            okText="ลบ"
            cancelText="ยกเลิก"
            okButtonProps={{ danger: true }}
          >
            <Button type="text" danger icon={<DeleteOutlined />} title="ลบ" />
          </Popconfirm>
        </Space>
      ),
      width: 150,
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
                <Title level={4}>
                  รายการเนื้อเพลงทั้งหมด
                  {searchStats.hasFilter && (
                    <Text
                      type="secondary"
                      style={{ marginLeft: 16, fontSize: 14 }}
                    >
                      ({searchStats.filtered} จาก {searchStats.total} เพลง)
                    </Text>
                  )}
                </Title>
                <div className="card-actions">
                  <Input
                    placeholder="ค้นหาเพลง, ศิลปิน..."
                    prefix={<SearchOutlined />}
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    onPressEnter={handleSearch}
                    style={{ width: 250 }}
                    allowClear
                  />
                  <Select
                    placeholder="หมวดหมู่เพลง"
                    style={{ width: 200 }}
                    allowClear
                    value={selectedCategory}
                    onChange={handleCategoryChange}
                  >
                    {categories.map((category) => (
                      <Option key={category.id} value={category.id}>
                        {category.name}
                      </Option>
                    ))}
                  </Select>
                  <Button onClick={handleSearch} icon={<SearchOutlined />}>
                    ค้นหา
                  </Button>
                  <Button
                    onClick={handleClearSearch}
                    icon={<ClearOutlined />}
                    disabled={!searchText && !selectedCategory}
                  >
                    ล้าง
                  </Button>
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
                dataSource={displaySongs}
                rowKey="id"
                pagination={false}
                loading={loading}
                size="middle"
                scroll={{ x: 800 }}
              />

              <div className="pagination-container">
                <Pagination
                  current={pagination.current}
                  total={pagination.total}
                  pageSize={pagination.pageSize}
                  onChange={handlePaginationChange}
                  showSizeChanger={true}
                  showQuickJumper
                  showTotal={(total, range) =>
                    `${range[0]}-${range[1]} จากทั้งหมด ${total} เพลง`
                  }
                  pageSizeOptions={["10", "20", "50", "100"]}
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
          setSelectedSong(null);
          form.resetFields();
        }}
        footer={null}
        width={900}
        destroyOnClose
      >
        <Spin spinning={loading}>
          <Form form={form} layout="vertical" onFinish={handleSongSubmit}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="title"
                  label="ชื่อเพลง"
                  rules={[
                    { required: true, message: "กรุณากรอกชื่อเพลง" },
                    { max: 200, message: "ชื่อเพลงต้องไม่เกิน 200 ตัวอักษร" },
                  ]}
                >
                  <Input placeholder="ชื่อเพลง" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="artist"
                  label="ศิลปิน"
                  rules={[
                    { required: true, message: "กรุณากรอกชื่อศิลปิน" },
                    { max: 200, message: "ชื่อศิลปินต้องไม่เกิน 200 ตัวอักษร" },
                  ]}
                >
                  <Input placeholder="ชื่อศิลปิน" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="defaultKey"
                  label="คีย์เดิม"
                  rules={[{ required: true, message: "กรุณาเลือกคีย์" }]}
                >
                  <Select placeholder="เลือกคีย์">
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
                  <Select allowClear placeholder="เลือกหมวดหมู่">
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
              extra="วางคอร์ดในวงเล็บเหลี่ยม เช่น [C]เนื้อเพลง [Am]เนื้อเพลง [F]บรรทัดใหม่"
            >
              <TextArea
                rows={15}
                placeholder="[C]ตัวอย่าง [G]เนื้อเพลง [Am]พร้อม [F]คอร์ด"
                style={{ fontFamily: "monospace" }}
              />
            </Form.Item>

            <Form.Item>
              <Space>
                <Button
                  onClick={() => {
                    setIsModalVisible(false);
                    setSelectedSong(null);
                    form.resetFields();
                  }}
                  disabled={loading}
                >
                  ยกเลิก
                </Button>
                <Button type="primary" htmlType="submit" loading={loading}>
                  {selectedSong ? "บันทึกการแก้ไข" : "เพิ่มเพลง"}
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Spin>
      </Modal>

      {/* Song Detail Modal with Image Gallery */}
      <Modal
        title={
          <Space>
            <span>{selectedSong?.title}</span>
            <Text type="secondary">- {selectedSong?.artist}</Text>
          </Space>
        }
        open={isSongDetailVisible}
        onCancel={() => {
          setIsSongDetailVisible(false);
          setSelectedSong(null);
        }}
        footer={[
          <Button
            key="close"
            onClick={() => {
              setIsSongDetailVisible(false);
              setSelectedSong(null);
            }}
          >
            ปิด
          </Button>,
          <Button
            key="edit"
            type="primary"
            onClick={() => {
              setIsSongDetailVisible(false);
              showSongModal(selectedSong);
            }}
            icon={<EditOutlined />}
            loading={loading}
          >
            แก้ไขเพลง
          </Button>,
        ]}
        width={1200}
        destroyOnClose
        className="song-detail-modal"
      >
        {selectedSong && (
          <div className="song-detail">
            <div className="song-header">
              <Row gutter={16}>
                <Col span={12}>
                  <p>
                    <strong>ศิลปิน:</strong> {selectedSong.artist}
                  </p>
                  <p>
                    <strong>คีย์เดิม:</strong>{" "}
                    <Tag color="blue">{selectedSong.defaultKey}</Tag>
                  </p>
                </Col>
                <Col span={12}>
                  {selectedSong.category && (
                    <p>
                      <strong>หมวดหมู่:</strong>{" "}
                      <Tag color="green">{selectedSong.category.name}</Tag>
                    </p>
                  )}
                  <p>
                    <strong>จำนวนคำ:</strong> {selectedSong.lyrics?.length || 0}{" "}
                    คำ
                  </p>
                </Col>
              </Row>
            </div>

            <Divider />

            {/* เนื้อเพลงและคอร์ด */}
            <Card title="เนื้อเพลงพร้อมคอร์ด" className="lyrics-card">
              <ChordDisplay
                lyrics={selectedSong.lyrics || []}
                defaultKey={selectedSong.defaultKey}
                showTransposeControls={true}
              />
            </Card>

            {/* Image Gallery สำหรับ Admin - แสดงการจัดการรูป */}
            <ImageGallery
              songId={selectedSong.id}
              showUpload={true}
              showControls={true}
              title="จัดการรูปภาพคอร์ด"
            />
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
