// อัพเดต PublicSongs.jsx - เพิ่ม meta tags สำหรับหน้าหลัก
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
import { Helmet } from "react-helmet-async"; // เพิ่มบรรทัดนี้
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
  const [allSongs, setAllSongs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [uniqueAlbums, setUniqueAlbums] = useState([]);
  const [loading, setLoading] = useState(false);

  // State สำหรับการค้นหาและกรอง
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedAlbum, setSelectedAlbum] = useState(null);

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

  useEffect(() => {
    filterAndUpdateResults();
  }, [
    allSongs,
    searchText,
    selectedCategory,
    selectedAlbum,
    pagination.current,
  ]);

  const sortThaiStrings = (arr) => {
    return arr.sort((a, b) => {
      return a.title.localeCompare(b.title, "th", {
        numeric: true,
        sensitivity: "base",
      });
    });
  };

  const getUniqueAlbums = (albumsData) => {
    const albumMap = new Map();

    albumsData.forEach((album) => {
      const key = album.albumName.toLowerCase();

      if (!albumMap.has(key)) {
        albumMap.set(key, {
          id: album.id,
          albumName: album.albumName,
          artist: album.artist,
        });
      }
    });

    return Array.from(albumMap.values()).sort((a, b) =>
      a.albumName.localeCompare(b.albumName, "th", {
        numeric: true,
        sensitivity: "base",
      })
    );
  };

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const songsResponse = await getAllSongs(1, 1000);

      if (songsResponse.success) {
        const sortedSongs = sortThaiStrings(songsResponse.data || []);
        setAllSongs(sortedSongs);
      } else {
        console.error("Failed to fetch songs:", songsResponse.message);
        setAllSongs([]);
      }

      const categoriesResponse = await getAllCategories();
      if (categoriesResponse.success) {
        setCategories(categoriesResponse.data || []);
      }

      const albumsResponse = await getAllAlbums(1, 1000);
      if (albumsResponse.success) {
        const albumsData = albumsResponse.data || [];
        setAlbums(albumsData);

        const uniqueAlbumsData = getUniqueAlbums(albumsData);
        setUniqueAlbums(uniqueAlbumsData);
      } else {
        console.error("Failed to fetch albums:", albumsResponse.message);
        setAlbums([]);
        setUniqueAlbums([]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setAllSongs([]);
      setAlbums([]);
      setUniqueAlbums([]);
    } finally {
      setLoading(false);
    }
  };

  const getSongsWithAlbums = () => {
    const albumsBySongId = {};
    albums.forEach((album) => {
      if (!albumsBySongId[album.songId]) {
        albumsBySongId[album.songId] = [];
      }
      albumsBySongId[album.songId].push(album);
    });

    return allSongs.map((song) => ({
      ...song,
      albums: albumsBySongId[song.id] || [],
    }));
  };

  const filterAndUpdateResults = () => {
    const songsWithAlbums = getSongsWithAlbums();
    let filtered = [...songsWithAlbums];

    if (searchText.trim()) {
      const searchLower = searchText.toLowerCase().trim();
      filtered = filtered.filter(
        (song) =>
          song.title.toLowerCase().includes(searchLower) ||
          song.artist.toLowerCase().includes(searchLower) ||
          song.albums.some(
            (album) =>
              album.albumName.toLowerCase().includes(searchLower) ||
              (album.artist && album.artist.toLowerCase().includes(searchLower))
          )
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(
        (song) => song.categoryId === selectedCategory
      );
    }

    if (selectedAlbum) {
      const selectedAlbumName = uniqueAlbums.find(
        (album) => album.id === selectedAlbum
      )?.albumName;
      if (selectedAlbumName) {
        filtered = filtered.filter((song) =>
          song.albums.some((album) => album.albumName === selectedAlbumName)
        );
      }
    }

    filtered = sortThaiStrings(filtered);
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

  const handleSearch = (value) => {
    setSearchText(value);
    setPagination((prev) => ({
      ...prev,
      current: 1,
    }));
  };

  const handleCategoryFilter = (categoryId) => {
    setSelectedCategory(categoryId);
    setPagination((prev) => ({
      ...prev,
      current: 1,
    }));
  };

  const handleAlbumFilter = (albumId) => {
    setSelectedAlbum(albumId);
    setPagination((prev) => ({
      ...prev,
      current: 1,
    }));
  };

  const handleClearSearch = () => {
    setSearchText("");
    setSelectedCategory(null);
    setSelectedAlbum(null);
    setPagination((prev) => ({
      ...prev,
      current: 1,
    }));
  };

  const handlePaginationChange = (page, pageSize) => {
    setPagination((prev) => ({
      ...prev,
      current: page,
      pageSize: pageSize,
    }));
  };

  const handleSongClick = (song) => {
    navigate(`/song/${song.id}`);
  };

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

  const getCategoryName = (categoryId) => {
    const category = categories.find((c) => c.id === categoryId);
    return category ? category.name : "";
  };

  const getAlbumName = (albumId) => {
    const album = uniqueAlbums.find((a) => a.id === albumId);
    return album ? album.albumName : "";
  };

  // สร้าง dynamic meta description
  const getPageDescription = () => {
    const totalSongs = allSongs.length;
    const totalCategories = categories.length;
    const totalAlbums = uniqueAlbums.length;

    if (searchText || selectedCategory || selectedAlbum) {
      let desc = `ค้นหาเพลง`;
      if (searchText) desc += ` "${searchText}"`;
      if (selectedCategory)
        desc += ` ในหมวดหมู่ ${getCategoryName(selectedCategory)}`;
      if (selectedAlbum) desc += ` ในอัลบั้ม ${getAlbumName(selectedAlbum)}`;
      desc += ` พบ ${filteredSongs.length} เพลง`;
      return desc;
    }

    return `ค้นหาและดูคอร์ดเพลงฟรี มีเพลงทั้งหมด ${totalSongs} เพลง ${totalCategories} หมวดหมู่ ${totalAlbums} อัลบั้ม พร้อมเครื่องมือเปลี่ยนคีย์และแสดงคอร์ด`;
  };

  // สร้าง keywords จากข้อมูลที่มี
  const getPageKeywords = () => {
    const categoryNames = categories.map((c) => c.name).join(", ");
    const popularArtists = [
      ...new Set(allSongs.slice(0, 20).map((s) => s.artist)),
    ]
      .slice(0, 10)
      .join(", ");

    return `คอร์ดเพลง, chord, guitar, กีตาร์, เพลง, ดนตรี, ${categoryNames}, ${popularArtists}`;
  };

  const searchStats = getSearchStats();

  return (
    <div className="public-songs-page">
      <Helmet>
        <title>
          {searchText || selectedCategory || selectedAlbum
            ? `ค้นหาเพลง${searchText ? ` "${searchText}"` : ""}${
                selectedCategory
                  ? ` หมวดหมู่ ${getCategoryName(selectedCategory)}`
                  : ""
              }${
                selectedAlbum ? ` อัลบั้ม ${getAlbumName(selectedAlbum)}` : ""
              } | Yum Chord`
            : `Yum Chord - ค้นหาและดูคอร์ดเพลงฟรี`}
        </title>
        <meta name="description" content={getPageDescription()} />

        {/* Open Graph Tags */}
        <meta property="og:type" content="website" />
        <meta
          property="og:title"
          content={
            searchText || selectedCategory || selectedAlbum
              ? `ค้นหาเพลง${searchText ? ` "${searchText}"` : ""}${
                  selectedCategory
                    ? ` หมวดหมู่ ${getCategoryName(selectedCategory)}`
                    : ""
                }${
                  selectedAlbum ? ` อัลบั้ม ${getAlbumName(selectedAlbum)}` : ""
                } | Yum Chord`
              : `Yum Chord - ค้นหาและดูคอร์ดเพลงฟรี`
          }
        />
        <meta property="og:description" content={getPageDescription()} />
        <meta property="og:url" content={window.location.href} />
        <meta
          property="og:image"
          content={`${window.location.origin}/logo192.png`}
        />
        <meta property="og:site_name" content="Yum Chord" />

        {/* Twitter Card Tags */}
        <meta name="twitter:card" content="summary" />
        <meta
          name="twitter:title"
          content={
            searchText || selectedCategory || selectedAlbum
              ? `ค้นหาเพลง${searchText ? ` "${searchText}"` : ""}${
                  selectedCategory
                    ? ` หมวดหมู่ ${getCategoryName(selectedCategory)}`
                    : ""
                }${
                  selectedAlbum ? ` อัลบั้ม ${getAlbumName(selectedAlbum)}` : ""
                } | Yum Chord`
              : `Yum Chord - ค้นหาและดูคอร์ดเพลงฟรี`
          }
        />
        <meta name="twitter:description" content={getPageDescription()} />
        <meta
          name="twitter:image"
          content={`${window.location.origin}/logo192.png`}
        />

        {/* Keywords */}
        <meta name="keywords" content={getPageKeywords()} />

        {/* Canonical URL */}
        <link rel="canonical" href={window.location.href} />
      </Helmet>

      <PublicNavbar />

      <div className="songs-container">
        <div className="search-section">
          <div className="search-header">
            <h1 className="page-title">ค้นหาเพลง</h1>
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
                {uniqueAlbums.map((album) => (
                  <Option key={album.id} value={album.id}>
                    {album.albumName}
                    {album.artist && (
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
