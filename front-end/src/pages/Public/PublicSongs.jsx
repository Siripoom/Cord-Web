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
import {
  getAllSongs,
  getAllCategories,
  getAllAlbums,
} from "../../services/songService";
import "./PublicSongs.css";
const { Option } = Select;

const PublicSongs = () => {
  const navigate = useNavigate();

  // State สำหรับข้อมูลทั้งหมด
  const [allSongs, setAllSongs] = useState([]); // เก็บข้อมูลเพลงทั้งหมด
  const [categories, setCategories] = useState([]);
  const [albums, setAlbums] = useState([]); // เพิ่ม state สำหรับอัลบั้ม
  const [loading, setLoading] = useState(false);

  // State สำหรับการค้นหาและกรอง
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedAlbum, setSelectedAlbum] = useState(null); // เพิ่ม state สำหรับอัลบั้มที่เลือก

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
  }, [
    allSongs,
    searchText,
    selectedCategory,
    selectedAlbum,
    pagination.current,
  ]);

  // ฟังก์ชันเรียงลำดับภาษาไทย
  const sortThaiStrings = (arr) => {
    return arr.sort((a, b) => {
      return a.title.localeCompare(b.title, "th", {
        numeric: true,
        sensitivity: "base",
      });
    });
  };

  // โหลดข้อมูลทั้งหมดครั้งเดียว
  const fetchAllData = async () => {
    setLoading(true);
    try {
      // โหลดเพลงทั้งหมด (เพิ่ม limit ให้สูงเพื่อดึงทั้งหมด)
      const songsResponse = await getAllSongs(1, 1000); // ดึงสูงสุด 1000 เพลง

      if (songsResponse.success) {
        // เรียงลำดับเพลงตามภาษาไทย ก-ฮ
        const sortedSongs = sortThaiStrings(songsResponse.data || []);
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

      // โหลดอัลบั้มทั้งหมด
      const albumsResponse = await getAllAlbums(1, 1000); // ดึงอัลบั้มทั้งหมด
      if (albumsResponse.success) {
        setAlbums(albumsResponse.data || []);
      } else {
        console.error("Failed to fetch albums:", albumsResponse.message);
        setAlbums([]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setAllSongs([]);
      setAlbums([]);
    } finally {
      setLoading(false);
    }
  };

  // ฟังก์ชันสร้างความสัมพันธ์ระหว่างเพลงและอัลบั้ม
  const getSongsWithAlbums = () => {
    // สร้าง Map สำหรับค้นหาอัลบั้มตาม songId อย่างรวดเร็ว
    const albumsBySongId = {};
    albums.forEach((album) => {
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

  // ฟังก์ชันกรองข้อมูล
  const filterAndUpdateResults = () => {
    const songsWithAlbums = getSongsWithAlbums();
    let filtered = [...songsWithAlbums];

    // กรองตามการค้นหา (ชื่อเพลง, ศิลปิน)
    if (searchText.trim()) {
      const searchLower = searchText.toLowerCase().trim();
      filtered = filtered.filter(
        (song) =>
          song.title.toLowerCase().includes(searchLower) ||
          song.artist.toLowerCase().includes(searchLower) ||
          // ค้นหาในชื่ออัลบั้มด้วย
          song.albums.some(
            (album) =>
              album.albumName.toLowerCase().includes(searchLower) ||
              (album.artist && album.artist.toLowerCase().includes(searchLower))
          )
      );
    }

    // กรองตามหมวดหมู่
    if (selectedCategory) {
      filtered = filtered.filter(
        (song) => song.categoryId === selectedCategory
      );
    }

    // กรองตามอัลบั้ม
    if (selectedAlbum) {
      filtered = filtered.filter((song) =>
        song.albums.some((album) => album.id === selectedAlbum)
      );
    }

    // เรียงลำดับผลลัพธ์ที่กรองแล้วตามภาษาไทย ก-ฮ
    filtered = sortThaiStrings(filtered);

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

  // ฟังก์ชันกรองอัลบั้ม
  const handleAlbumFilter = (albumId) => {
    setSelectedAlbum(albumId);
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
    setSelectedAlbum(null); // เพิ่มการล้างอัลบั้มที่เลือก
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
    if (searchText || selectedCategory || selectedAlbum) {
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

  // ฟังก์ชันหาชื่อหมวดหมู่จาก ID
  const getCategoryName = (categoryId) => {
    const category = categories.find((c) => c.id === categoryId);
    return category ? category.name : "";
  };

  // ฟังก์ชันหาชื่ออัลบั้มจาก ID
  const getAlbumName = (albumId) => {
    const album = albums.find((a) => a.id === albumId);
    return album ? album.albumName : "";
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
                placeholder="ค้นหาชื่อเพลง, ศิลปิน หรือชื่ออัลบั้ม..."
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

              <Select
                placeholder="เลือกอัลบั้ม"
                size="large"
                allowClear
                value={selectedAlbum}
                onChange={handleAlbumFilter}
                className="album-filter"
                style={{ width: 250 }}
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >=
                  0
                }
              >
                {albums.map((album) => (
                  <Option key={album.id} value={album.id}>
                    {album.albumName}
                    {album.artist && album.artist !== album.song?.artist && (
                      <span style={{ color: "#999", fontSize: "12px" }}>
                        {" "}
                        - {album.artist}
                      </span>
                    )}
                  </Option>
                ))}
              </Select>

              {(searchText || selectedCategory || selectedAlbum) && (
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
                      } ${selectedCategory ? "ในหมวดหมู่ที่เลือก" : ""} ${
                        selectedAlbum ? "ในอัลบั้มที่เลือก" : ""
                      }`
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
                          <strong>{getCategoryName(selectedCategory)}</strong>
                          &quot;
                        </span>
                      )}
                      {selectedAlbum && (
                        <span>
                          {" "}
                          ในอัลบั้ม &quot;
                          <strong>{getAlbumName(selectedAlbum)}</strong>
                          &quot;
                        </span>
                      )}
                      <span className="sort-info"> (เรียงตาม ก-ฮ)</span>
                    </>
                  ) : (
                    <>
                      พบ <strong>{searchStats.total}</strong> เพลงทั้งหมด
                      <span className="sort-info"> (เรียงตาม ก-ฮ)</span>
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
