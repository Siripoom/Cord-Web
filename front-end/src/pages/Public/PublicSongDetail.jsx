import React, { useState, useEffect } from "react";
import { Card, Button, Tag, Spin, Alert, Divider } from "antd";
import {
  ArrowLeftOutlined,
  UserOutlined,
  TagsOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { useParams, useNavigate } from "react-router-dom";
import PublicNavbar from "../../components/Navbar/PublicNavbar";
import ChordDisplay from "../../components/ChordDisplay";
import ImageGallery from "../../components/ImageGallery/ImageGallery";
import { getSongById } from "../../services/songService";
import dayjs from "dayjs";
import "./PublicSongDetail.css";

const PublicSongDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [song, setSong] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // View control states
  const [showChords, setShowChords] = useState(true);
  const [textAlign, setTextAlign] = useState("left");

  useEffect(() => {
    fetchSongDetail();
  }, [id]);

  const fetchSongDetail = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getSongById(id);

      if (response.success) {
        setSong(response.data);
      } else {
        setError(response.message || "ไม่สามารถโหลดข้อมูลเพลงได้");
      }
    } catch (error) {
      console.error("Error fetching song detail:", error);
      setError("เกิดข้อผิดพลาดในการโหลดข้อมูล");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleBackToList = () => {
    navigate("/songs");
  };

  // ฟังก์ชันจัดการปุ่มซ่อนเนื้อ + จัดกลาง
  const handleLyricsOnlyMode = () => {
    setShowChords(false);
    setTextAlign("center");
  };

  // ฟังก์ชันจัดการปุ่มแสดงคอร์ด + เนื้อ
  const handleShowChordsMode = () => {
    setShowChords(true);
    setTextAlign("left");
  };

  if (loading) {
    return (
      <div className="public-song-detail-page">
        <PublicNavbar />
        <div className="song-detail-container">
          <div className="loading-container">
            <Spin size="large" />
            <p className="loading-text">กำลังโหลดเพลง...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !song) {
    return (
      <div className="public-song-detail-page">
        <PublicNavbar />
        <div className="song-detail-container">
          <div className="error-container">
            <Alert
              message="เกิดข้อผิดพลาด"
              description={error || "ไม่พบเพลงที่ต้องการ"}
              type="error"
              showIcon
              action={
                <Button type="primary" onClick={handleBackToList}>
                  กลับไปรายการเพลง
                </Button>
              }
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="public-song-detail-page">
      <PublicNavbar />

      <div className="song-detail-container">
        {/* Back Button */}
        <div className="back-section">
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={handleBack}
            className="back-button"
            size="large"
          >
            กลับ
          </Button>
        </div>

        <Divider className="section-divider" />

        {/* Song Content */}
        <Card className="song-content-card">
          <div className="chord-section">
            {/* Compact Song Header */}
            <div className="song-header-content-compact">
              <div className="song-main-info-compact">
                <h2 className="song-title-compact">{song.title}</h2>
                <div className="song-meta-compact">
                  <div className="meta-item-compact">
                    <UserOutlined className="meta-icon-compact" />
                    <span className="artist-name-compact">{song.artist}</span>
                  </div>

                  {song.category && (
                    <div className="meta-item-compact">
                      <TagsOutlined className="meta-icon-compact" />
                      <Tag color="blue" className="category-tag-compact">
                        {song.category.name}
                      </Tag>
                    </div>
                  )}

                  <div className="meta-item-compact">
                    <CalendarOutlined className="meta-icon-compact" />
                    <span className="created-date-compact">
                      {dayjs(song.createdAt).format("DD/MM/YYYY")}
                    </span>
                  </div>
                </div>
              </div>

              {/* View Controls - ย้ายมาจาก ChordDisplay */}
              <div className="view-controls">
                <div className="view-section">
                  <span className="view-label">แสดงคอร์ด :</span>
                  <div className="view-toggle">
                    <button
                      className={`view-option ${
                        showChords && textAlign === "left" ? "active" : ""
                      }`}
                      onClick={handleShowChordsMode}
                    >
                      🎵 เนื้อ+คอร์ด
                    </button>
                    <button
                      className={`view-option ${
                        !showChords && textAlign === "center" ? "active" : ""
                      }`}
                      onClick={handleLyricsOnlyMode}
                    >
                      📝 เฉพาะเนื้อ
                    </button>
                  </div>
                </div>
              </div>
              <div className="song-stats-compact">
                <div className="stat-item-compact">
                  <div className="stat-value-compact">{song.defaultKey}</div>
                  <div className="stat-label-compact">คีย์</div>
                </div>
              </div>
            </div>

            {/* Chord Display */}
            {song.lyrics && song.lyrics.length > 0 ? (
              <ChordDisplay
                lyrics={song.lyrics}
                defaultKey={song.defaultKey}
                showTransposeControls={true}
                showChords={showChords}
                textAlign={textAlign}
              />
            ) : (
              <div className="no-lyrics">
                <Alert
                  message="ไม่มีเนื้อเพลง"
                  description="เพลงนี้ยังไม่มีเนื้อเพลงหรือคอร์ด"
                  type="info"
                  showIcon
                />
              </div>
            )}
          </div>
        </Card>

        {/* Image Gallery Section - สำหรับผู้ใช้ทั่วไป */}
        <ImageGallery
          songId={song.id}
          showUpload={false}
          showControls={false}
          title="รูปภาพคอร์ด"
        />

        {/* Action Buttons */}
        <div className="action-section">
          <Button
            type="default"
            size="large"
            onClick={handleBackToList}
            className="action-button"
          >
            ดูเพลงอื่น
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PublicSongDetail;
