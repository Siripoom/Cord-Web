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
import { SearchOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import PublicNavbar from "../../components/Navbar/PublicNavbar";
import {
  getAllSongs,
  searchSongs,
  getAllCategories,
} from "../../services/songService";
import "./PublicSongs.css";
const { Option } = Select;

const PublicSongs = () => {
  const navigate = useNavigate();
  const [songs, setSongs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 12,
    total: 0,
  });

  useEffect(() => {
    fetchSongs();
    fetchCategories();
  }, []);

  const fetchSongs = async (page = 1, limit = 12, search = "") => {
    setLoading(true);
    try {
      const response = search
        ? await searchSongs(search, page, limit)
        : await getAllSongs(page, limit, search);

      if (response.success) {
        setSongs(response.data || []);
        if (response.pagination) {
          setPagination({
            current: response.pagination.page,
            pageSize: response.pagination.limit,
            total: response.pagination.totalSongs,
          });
        }
      } else {
        console.error("Failed to fetch songs:", response.message);
        setSongs([]);
      }
    } catch (error) {
      console.error("Error fetching songs:", error);
      setSongs([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await getAllCategories();
      if (response.success) {
        setCategories(response.data || []);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleSearch = (value) => {
    setSearchText(value);
    if (value.trim()) {
      fetchSongs(1, pagination.pageSize, value.trim());
    } else {
      fetchSongs(1, pagination.pageSize);
    }
  };

  const handleCategoryFilter = (categoryId) => {
    setSelectedCategory(categoryId);
    // Note: You might need to implement category filtering in your backend
    // For now, we'll filter on the frontend
    if (categoryId) {
      const filteredSongs = songs.filter(
        (song) => song.categoryId === categoryId
      );
      setSongs(filteredSongs);
    } else {
      fetchSongs(pagination.current, pagination.pageSize, searchText);
    }
  };

  const handlePaginationChange = (page, pageSize) => {
    fetchSongs(page, pageSize, searchText);
  };

  const handleSongClick = (song) => {
    navigate(`/song/${song.id}`);
  };

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

  return (
    <div className="public-songs-page">
      <PublicNavbar />

      <div className="songs-container">
        <div className="search-section">
          <div className="search-header">
            <h1 className="page-title">ค้นหาเพลงที่คุณชื่นชอบ</h1>
            <p className="page-subtitle">เลือกเพลงและดูคอร์ดกีตาร์แบบง่ายๆ</p>
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
            </div>
          </div>
        </div>

        <div className="songs-content">
          {loading ? (
            <div className="loading-container">
              <Spin size="large" />
              <p className="loading-text">กำลังโหลดเพลง...</p>
            </div>
          ) : songs.length === 0 ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <span className="empty-text">
                  {searchText
                    ? `ไม่พบเพลงที่ค้นหา "${searchText}"`
                    : "ไม่พบเพลงในระบบ"}
                </span>
              }
            />
          ) : (
            <>
              <div className="results-info">
                <p className="results-count">
                  พบ {pagination.total} เพลง
                  {searchText && <span> สำหรับ "{searchText}"</span>}
                </p>
              </div>

              <Row gutter={[16, 16]} className="songs-grid">
                {songs.map((song) => (
                  <Col xs={24} key={song.id}>
                    <Card className="song-card">
                      <div className="song-card-content">
                        <div className="song-info-left">
                          <div className="song-title">{song.title}</div>
                          <div className="song-artist">{song.artist}</div>
                        </div>
                        <div className="song-actions-right">
                          <Button
                            type="primary"
                            className="view-chord-btn"
                            onClick={() => handleSongClick(song)}
                          >
                            ดูคอร์ด
                          </Button>
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
