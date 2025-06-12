import { useState, useEffect } from "react";
import {
  Input,
  Card,
  Row,
  Col,
  Spin,
  Empty,
  Pagination,
  Select,
  Button,
} from "antd";
import { SearchOutlined, ClearOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import PublicNavbar from "../../components/Navbar/PublicNavbar";
import { getAllSongs, getAllCategories } from "../../services/songService";
import "./PublicSongs.css";
const { Option } = Select;

const PublicSongs = () => {
  const navigate = useNavigate();

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
    pageSize: 12,
    total: 0,
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  // ฟังก์ชันกรองและอัพเดตผลลัพธ์
  useEffect(() => {
    filterAndUpdateResults();
  }, [allSongs, searchText, selectedCategory, pagination.current]);

  // โหลดข้อมูลทั้งหมดครั้งเดียว
  const fetchAllData = async () => {
    setLoading(true);
    try {
      // โหลดเพลงทั้งหมด (เพิ่ม limit ให้สูงเพื่อดึงทั้งหมด)
      const songsResponse = await getAllSongs(1, 1000); // ดึงสูงสุด 1000 เพลง

      if (songsResponse.success) {
        setAllSongs(songsResponse.data || []);
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
  const handleSearch = (value) => {
    setSearchText(value);
    // รีเซ็ต pagination กลับไปหน้าแรก
    setPagination((prev) => ({
      ...prev,
      current: 1,
    }));
  };

  // ฟังก์ชันกรองหมวดหมู่
  const handleCategoryFilter = (categoryId) => {
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
      pageSize: pageSize,
    }));
  };

  // ฟังก์ชันคลิกเพลง
  const handleSongClick = (song) => {
    navigate(`/song/${song.id}`);
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

  return (
    <div className="public-songs-page">
      <PublicNavbar />

      <div className="songs-container">
        <div className="search-section">
          <div className="search-header">
            <h1 className="page-title">ค้นหาเพลง</h1>
            {/* <p className="page-subtitle">เลือกเพลงและดูคอร์ดกีตาร์แบบง่ายๆ</p> */}
          </div>

          <div className="search-controls">
            <div className="search-input-wrapper">
              <Input.Search
                placeholder="ค้นหาชื่อเพลง หรือชื่อศิลปิน..."
                size="large"
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onSearch={handleSearch}
                enterButton="ค้นหา"
                className="search-input"
                allowClear
              />
            </div>

            <div className="filter-section">
              <Select
                placeholder="เลือกหมวดหมู่"
                size="large"
                allowClear
                value={selectedCategory}
                onChange={handleCategoryFilter}
                className="category-filter"
                style={{ width: 200 }}
              >
                {categories.map((category) => (
                  <Option key={category.id} value={category.id}>
                    {category.name}
                  </Option>
                ))}
              </Select>

              {(searchText || selectedCategory) && (
                <Button
                  icon={<ClearOutlined />}
                  onClick={handleClearSearch}
                  size="large"
                  title="ล้างการค้นหา"
                >
                  ล้าง
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="songs-content">
          {loading ? (
            <div className="loading-container">
              <Spin size="large" />
              <p className="loading-text">กำลังโหลดเพลง...</p>
            </div>
          ) : displaySongs.length === 0 ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <span className="empty-text">
                  {searchStats.hasFilter
                    ? `ไม่พบเพลงที่ค้นหา ${
                        searchText ? `"${searchText}"` : ""
                      } ${selectedCategory ? "ในหมวดหมู่ที่เลือก" : ""}`
                    : "ไม่พบเพลงในระบบ"}
                </span>
              }
            />
          ) : (
            <>
              <div className="results-info">
                <p className="results-count">
                  {searchStats.hasFilter ? (
                    <>
                      พบ <strong>{searchStats.filtered}</strong> เพลง จากทั้งหมด{" "}
                      {searchStats.total} เพลง
                      {searchText && (
                        <span>
                          {" "}
                          สำหรับ &quot;<strong>{searchText}</strong>&quot;
                        </span>
                      )}
                      {selectedCategory && (
                        <span>
                          {" "}
                          ในหมวดหมู่ &quot;
                          <strong>
                            {
                              categories.find((c) => c.id === selectedCategory)
                                ?.name
                            }
                          </strong>
                          &quot;
                        </span>
                      )}
                    </>
                  ) : (
                    <>
                      พบ <strong>{searchStats.total}</strong> เพลงทั้งหมด
                    </>
                  )}
                </p>
              </div>

              <Row gutter={[16, 16]} className="songs-grid">
                {displaySongs.map((song) => (
                  <Col xs={24} key={song.id}>
                    <Card
                      className="song-card"
                      onClick={() => handleSongClick(song)}
                    >
                      <div className="song-card-content">
                        <div className="song-info-left">
                          <div className="song-title">{song.title}</div>
                          {/* <div className="song-artist">{song.artist}</div>
                          {song.category && (
                            <div className="song-category">
                              หมวดหมู่: {song.category.name}
                            </div>
                          )} */}
                        </div>
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>

              {pagination.total > pagination.pageSize && (
                <div className="pagination-container">
                  <Pagination
                    current={pagination.current}
                    total={pagination.total}
                    pageSize={pagination.pageSize}
                    onChange={handlePaginationChange}
                    showSizeChanger={false}
                    showQuickJumper
                    showTotal={(total, range) =>
                      `${range[0]}-${range[1]} จาก ${total} เพลง`
                    }
                    className="songs-pagination"
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PublicSongs;
