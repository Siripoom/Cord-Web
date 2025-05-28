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
import { getSongById } from "../../services/songService";
import dayjs from "dayjs";
import "./PublicSongDetail.css";

const PublicSongDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [song, setSong] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

        {/* Song Header */}
        <Card className="song-header-card">
          <div className="song-header-content">
            <div className="song-main-info">
              <h1 className="song-title">{song.title}</h1>
              <div className="song-meta">
                <div className="meta-item">
                  <UserOutlined className="meta-icon" />
                  <span className="artist-name">{song.artist}</span>
                </div>

                {song.category && (
                  <div className="meta-item">
                    <TagsOutlined className="meta-icon" />
                    <Tag color="green" className="category-tag">
                      {song.category.name}
                    </Tag>
                  </div>
                )}

                <div className="meta-item">
                  <CalendarOutlined className="meta-icon" />
                  <span className="created-date">
                    เพิ่มเมื่อ {dayjs(song.createdAt).format("DD/MM/YYYY")}
                  </span>
                </div>
              </div>
            </div>

            <div className="song-stats">
              <div className="stat-item">
                <div className="stat-value">{song.defaultKey}</div>
                <div className="stat-label">คีย์เดิม</div>
              </div>
              {/* <div className="stat-item">
                <div className="stat-value">{song.lyrics?.length || 0}</div>
                <div className="stat-label">จำนวนคำ</div>
              </div> */}
            </div>
          </div>
        </Card>

        <Divider className="section-divider" />

        {/* Song Content */}
        <Card className="song-content-card">
          <div className="chord-section">
            <h2 className="section-title">เนื้อเพลงและคอร์ด</h2>

            {song.lyrics && song.lyrics.length > 0 ? (
              <ChordDisplay
                lyrics={song.lyrics}
                defaultKey={song.defaultKey}
                showTransposeControls={true}
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
