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
  DatePicker,
  Tabs,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ClearOutlined,
  BookOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
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
  getSongAlbums,
  createSongAlbum,
  updateAlbum,
  getAllAlbums,
  deleteAlbum,
} from "../../services/songService";
import "./Song.css";
import PropTypes from "prop-types";

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;

const SongManagement = ({ sidebarVisible, toggleSidebar }) => {
  // State สำหรับข้อมูลทั้งหมด
  const [allSongs, setAllSongs] = useState([]);
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

  // State สำหรับการจัดการอัลบั้ม
  const [albums, setAlbums] = useState([]);
  const [isAlbumModalVisible, setIsAlbumModalVisible] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [albumForm] = Form.useForm();
  const [albumLoading, setAlbumLoading] = useState(false);
  const [allAlbums, setAllAlbums] = useState([]); // เพิ่มบรรทัดนี้
  useEffect(() => {
    fetchAllData();
  }, []);

  // ฟังก์ชันกรองและอัพเดตผลลัพธ์
  // แก้ไข useEffect - เพิ่ม allAlbums ใน dependency
  useEffect(() => {
    filterAndUpdateResults();
  }, [allSongs, allAlbums, searchText, selectedCategory, pagination.current]); // เพิ่ม allAlbums

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
      const songsResponse = await getAllSongs(1, 1000);

      if (songsResponse.success) {
        const sortedSongs = (songsResponse.data || []).sort(sortThaiText);
        setAllSongs(sortedSongs);
      } else {
        console.error("Failed to fetch songs:", songsResponse.message);
        setAllSongs([]);
      }

      const categoriesResponse = await getAllCategories();
      if (categoriesResponse.success) {
        setCategories(categoriesResponse.data || []);
      }
      // เพิ่มส่วนนี้ - โหลดอัลบั้มทั้งหมด
      const albumsResponse = await getAllAlbums(1, 1000);
      if (albumsResponse.success) {
        setAllAlbums(albumsResponse.data || []);
      } else {
        console.error("Failed to fetch albums:", albumsResponse.message);
        setAllAlbums([]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setAllSongs([]);
      message.error("เกิดข้อผิดพลาดในการโหลดข้อมูล");
    } finally {
      setLoading(false);
    }
  };
  // เพิ่มฟังก์ชันนี้หลัง fetchAllData
  const getSongsWithAlbums = () => {
    // สร้าง Map สำหรับค้นหาอัลบั้มตาม songId
    const albumsBySongId = {};
    allAlbums.forEach((album) => {
      if (!albumsBySongId[album.songId]) {
        albumsBySongId[album.songId] = [];
      }
      albumsBySongId[album.songId].push(album);
    });

    // เพิ่มข้อมูลอัลบั้มเข้าไปในแต่ละเพลง
    return allSongs.map((song) => ({
      ...song,
      albums: albumsBySongId[song.id] || [],
    }));
  };
  // ฟังก์ชันโหลดอัลบั้มของเพลง
  const fetchSongAlbums = async (songId) => {
    try {
      setAlbumLoading(true);
      const response = await getSongAlbums(songId);
      if (response.success) {
        setAlbums(response.data || []);
      } else {
        console.error("Failed to fetch albums:", response.message);
        setAlbums([]);
      }
    } catch (error) {
      console.error("Error fetching albums:", error);
      setAlbums([]);
    } finally {
      setAlbumLoading(false);
    }
  };

  // ฟังก์ชันกรองข้อมูล// แก้ไขฟังก์ชัน filterAndUpdateResults
  const filterAndUpdateResults = () => {
    // เปลี่ยนจาก [...allSongs] เป็น getSongsWithAlbums()
    let filtered = getSongsWithAlbums();

    if (searchText.trim()) {
      const searchLower = searchText.toLowerCase().trim();
      filtered = filtered.filter(
        (song) =>
          song.title.toLowerCase().includes(searchLower) ||
          song.artist.toLowerCase().includes(searchLower)
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(
        (song) => song.categoryId === selectedCategory
      );
    }

    filtered.sort(sortThaiText);
    setFilteredSongs(filtered);

    const total = filtered.length;
    const startIndex = (pagination.current - 1) * pagination.pageSize;
    const endIndex = startIndex + pagination.pageSize;
    const currentPageSongs = filtered.slice(startIndex, endIndex);

    setDisplaySongs(currentPageSongs);
    setPagination((prev) => ({
      ...prev,
      total: total,
    }));
  };

  // ฟังก์ชันการค้นหา
  const handleSearch = () => {
    setPagination((prev) => ({
      ...prev,
      current: 1,
    }));
  };

  // ฟังก์ชันกรองหมวดหมู่
  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
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
        const response = await getSongById(song.id);
        if (response.success) {
          const fullSong = response.data;
          console.log("Full song data for editing:", fullSong);

          let lyricsRaw = "";
          if (fullSong.lyrics && Array.isArray(fullSong.lyrics)) {
            lyricsRaw = fullSong.lyrics
              .map((item) => {
                if (item.chord) {
                  if (item.chordType === "inline") {
                    return `{${item.chord}}${item.word}`;
                  } else {
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
        // โหลดอัลบั้มของเพลงนี้ด้วย
        await fetchSongAlbums(song.id);
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

  // ฟังก์ชันแสดง Modal อัลบั้ม
  const showAlbumModal = (album = null) => {
    if (album) {
      albumForm.setFieldsValue({
        albumName: album.albumName,
        artist: album.artist,
        releaseDate: album.releaseDate ? dayjs(album.releaseDate) : null,
        coverImage: album.coverImage,
      });
      setSelectedAlbum(album);
    } else {
      albumForm.resetFields();
      setSelectedAlbum(null);
    }
    setIsAlbumModalVisible(true);
  };

  // ฟังก์ชันบันทึกอัลบั้ม
  // แก้ไขฟังก์ชัน handleAlbumSubmit - เพิ่มการรีเฟรชข้อมูลทั้งหมด
  const handleAlbumSubmit = async (values) => {
    try {
      setAlbumLoading(true);
      const albumData = {
        albumName: values.albumName.trim(),
        artist: values.artist?.trim() || null,
        releaseDate: values.releaseDate
          ? values.releaseDate.format("YYYY-MM-DD")
          : null,
        coverImage: values.coverImage?.trim() || null,
      };

      const response = selectedAlbum
        ? await updateAlbum(selectedAlbum.id, albumData)
        : await createSongAlbum(selectedSong.id, albumData);

      if (response.success) {
        message.success(
          `อัลบั้ม${
            selectedAlbum ? "ได้รับการอัพเดต" : "ถูกสร้าง"
          }เรียบร้อยแล้ว`
        );

        // รีเฟรชรายการอัลบั้มของเพลงนี้
        await fetchSongAlbums(selectedSong.id);

        // เพิ่มบรรทัดนี้ - รีเฟรชข้อมูลอัลบั้มทั้งหมด
        await fetchAllData();

        setIsAlbumModalVisible(false);
        setSelectedAlbum(null);
        albumForm.resetFields();
      } else {
        message.error(response.message || "เกิดข้อผิดพลาด");
        if (response.errors && response.errors.length > 0) {
          response.errors.forEach((error) => {
            message.error(`${error.field}: ${error.message}`);
          });
        }
      }
    } catch (error) {
      console.error("Error saving album:", error);
      message.error("เกิดข้อผิดพลาดในการบันทึกอัลบั้ม");
    } finally {
      setAlbumLoading(false);
    }
  };

  // ฟังก์ชันลบอัลบั้ม
  // แก้ไขฟังก์ชัน handleDeleteAlbum - เพิ่มการรีเฟรชข้อมูลทั้งหมด
  const handleDeleteAlbum = async (album) => {
    try {
      setAlbumLoading(true);
      const response = await deleteAlbum(album.id);
      if (response.success) {
        message.success("ลบอัลบั้มเรียบร้อยแล้ว");

        // รีเฟรชรายการอัลบั้มของเพลงนี้
        await fetchSongAlbums(selectedSong.id);

        // เพิ่มบรรทัดนี้ - รีเฟรชข้อมูลอัลบั้มทั้งหมด
        await fetchAllData();
      } else {
        message.error(response.message || "เกิดข้อผิดพลาดในการลบ");
      }
    } catch (error) {
      console.error("Error deleting album:", error);
      message.error("เกิดข้อผิดพลาดในการลบอัลบั้ม");
    } finally {
      setAlbumLoading(false);
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
      title: "อัลบั้ม",
      key: "albums",
      render: (_, record) => {
        if (!record.albums || record.albums.length === 0) {
          return <Text type="secondary">ไม่มีอัลบั้ม</Text>;
        }

        if (record.albums.length === 1) {
          return <Tag color="purple">{record.albums[0].albumName}</Tag>;
        }

        return (
          <div>
            {record.albums.slice(0, 2).map((album, index) => (
              <Tag key={album.id} color="purple" style={{ marginBottom: 2 }}>
                {album.albumName}
              </Tag>
            ))}
            {record.albums.length > 2 && (
              <Text type="secondary" style={{ fontSize: "12px" }}>
                +{record.albums.length - 2} อื่นๆ
              </Text>
            )}
          </div>
        );
      },
      width: 150,
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

  // คอลัมน์สำหรับตารางอัลบั้ม
  const albumColumns = [
    {
      title: "ชื่ออัลบั้ม",
      dataIndex: "albumName",
      key: "albumName",
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: "การจัดการ",
      key: "actions",
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => showAlbumModal(record)}
            title="แก้ไข"
          />
          <Popconfirm
            title="ยืนยันการลบอัลบั้ม"
            description={`คุณแน่ใจหรือไม่ที่จะลบอัลบั้ม "${record.albumName}"?`}
            onConfirm={() => handleDeleteAlbum(record)}
            okText="ลบ"
            cancelText="ยกเลิก"
            okButtonProps={{ danger: true }}
          >
            <Button type="text" danger icon={<DeleteOutlined />} title="ลบ" />
          </Popconfirm>
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
                      "Db",
                      "D",
                      "D#",
                      "Eb",
                      "E",
                      "F",
                      "F#",
                      "Gb",
                      "G",
                      "G#",
                      "Ab",
                      "A",
                      "A#",
                      "Bb",
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

      {/* Song Detail Modal with Tabs */}
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
          setAlbums([]);
        }}
        footer={[
          <Button
            key="close"
            onClick={() => {
              setIsSongDetailVisible(false);
              setSelectedSong(null);
              setAlbums([]);
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

            {/* Tabs สำหรับแสดงข้อมูลแต่ละส่วน */}
            <Tabs defaultActiveKey="lyrics" type="card">
              {/* Tab เนื้อเพลงและคอร์ด */}
              <TabPane tab="เนื้อเพลงและคอร์ด" key="lyrics">
                <Card title="เนื้อเพลงพร้อมคอร์ด" className="lyrics-card">
                  <ChordDisplay
                    lyrics={selectedSong.lyrics || []}
                    defaultKey={selectedSong.defaultKey}
                    showTransposeControls={true}
                  />
                </Card>
              </TabPane>

              {/* Tab อัลบั้ม */}
              <TabPane
                tab={
                  <span>
                    <BookOutlined />
                    อัลบั้ม ({albums.length})
                  </span>
                }
                key="albums"
              >
                <Card
                  title="อัลบั้มของเพลงนี้"
                  extra={
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={() => showAlbumModal()}
                    >
                      เพิ่มอัลบั้ม
                    </Button>
                  }
                >
                  <Table
                    columns={albumColumns}
                    dataSource={albums}
                    rowKey="id"
                    pagination={false}
                    loading={albumLoading}
                    size="small"
                    locale={{
                      emptyText: "ไม่มีอัลบั้มในเพลงนี้",
                    }}
                  />
                </Card>
              </TabPane>

              {/* Tab รูปภาพคอร์ด */}
              <TabPane tab="รูปภาพคอร์ด" key="images">
                <ImageGallery
                  songId={selectedSong.id}
                  showUpload={true}
                  showControls={true}
                  title="จัดการรูปภาพคอร์ด"
                />
              </TabPane>
            </Tabs>
          </div>
        )}
      </Modal>

      {/* Album Form Modal */}
      <Modal
        title={selectedAlbum ? "แก้ไขอัลบั้ม" : "เพิ่มอัลบั้มใหม่"}
        open={isAlbumModalVisible}
        onCancel={() => {
          setIsAlbumModalVisible(false);
          setSelectedAlbum(null);
          albumForm.resetFields();
        }}
        footer={null}
        width={600}
        destroyOnClose
      >
        <Spin spinning={albumLoading}>
          <Form form={albumForm} layout="vertical" onFinish={handleAlbumSubmit}>
            <Form.Item
              name="albumName"
              label="ชื่ออัลบั้ม"
              rules={[
                { required: true, message: "กรุณากรอกชื่ออัลบั้ม" },
                { max: 200, message: "ชื่ออัลบั้มต้องไม่เกิน 200 ตัวอักษร" },
              ]}
            >
              <Input placeholder="ชื่ออัลบั้ม" />
            </Form.Item>

            {/* <Form.Item
              name="artist"
              label="ศิลปิน"
              rules={[
                { max: 200, message: "ชื่อศิลปินต้องไม่เกิน 200 ตัวอักษร" },
              ]}
            >
              <Input placeholder="ชื่อศิลปิน (ถ้าต่างจากเพลง)" />
            </Form.Item> */}

            {/* <Form.Item name="releaseDate" label="วันที่ออกอัลบั้ม">
              <DatePicker
                style={{ width: "100%" }}
                format="DD/MM/YYYY"
                placeholder="เลือกวันที่ออกอัลบั้ม"
              />
            </Form.Item> */}

            {/* <Form.Item
              name="coverImage"
              label="URL รูปปกอัลบั้ม"
              rules={[
                { max: 500, message: "URL รูปปกต้องไม่เกิน 500 ตัวอักษร" },
                {
                  type: "url",
                  message: "กรุณากรอก URL ที่ถูกต้อง",
                },
              ]}
            >
              <Input
                placeholder="https://example.com/album-cover.jpg"
                addonBefore="🖼️"
              />
            </Form.Item> */}

            {/* แสดงตัวอย่างรูปปก */}
            <Form.Item
              shouldUpdate={(prevValues, currentValues) =>
                prevValues.coverImage !== currentValues.coverImage
              }
            >
              {({ getFieldValue }) => {
                const coverImageUrl = getFieldValue("coverImage");
                return coverImageUrl ? (
                  <div style={{ textAlign: "center", marginBottom: 16 }}>
                    <Text
                      type="secondary"
                      style={{ display: "block", marginBottom: 8 }}
                    >
                      ตัวอย่างรูปปก:
                    </Text>
                    <img
                      src={coverImageUrl}
                      alt="Album cover preview"
                      style={{
                        width: 120,
                        height: 120,
                        objectFit: "cover",
                        border: "1px solid #d9d9d9",
                        borderRadius: 8,
                      }}
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  </div>
                ) : null;
              }}
            </Form.Item>

            <Form.Item>
              <Space>
                <Button
                  onClick={() => {
                    setIsAlbumModalVisible(false);
                    setSelectedAlbum(null);
                    albumForm.resetFields();
                  }}
                  disabled={albumLoading}
                >
                  ยกเลิก
                </Button>
                <Button type="primary" htmlType="submit" loading={albumLoading}>
                  {selectedAlbum ? "บันทึกการแก้ไข" : "เพิ่มอัลบั้ม"}
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Spin>
      </Modal>
    </div>
  );
};

SongManagement.propTypes = {
  sidebarVisible: PropTypes.bool.isRequired,
  toggleSidebar: PropTypes.func.isRequired,
};

export default SongManagement;
