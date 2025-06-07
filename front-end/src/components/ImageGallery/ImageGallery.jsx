// อัพเดต front-end/src/components/ImageGallery/ImageGallery.jsx
// เพิ่ม import และปรับปรุงการแสดงผล

import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  Row,
  Col,
  Spin,
  Empty,
  Button,
  Modal,
  Upload,
  message,
  Popconfirm,
  Tooltip,
  Alert,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  EyeOutlined,
  UploadOutlined,
  DragOutlined,
  ReloadOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import PropTypes from "prop-types";
import ImageViewer from "../ImageViewer/ImageViewer"; // เพิ่ม import
import "./ImageGallery.css";

const ImageGallery = ({
  songId,
  showUpload = false,
  showControls = false,
  title = "รูปภาพคอร์ด",
}) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [imageErrors, setImageErrors] = useState({});
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  // เพิ่ม state สำหรับ Image Viewer
  const [viewerVisible, setViewerVisible] = useState(false);
  const [currentViewerIndex, setCurrentViewerIndex] = useState(0);

  // ฟังก์ชันสำหรับทดสอบการโหลดรูปภาพ
  const testImageLoading = useCallback((imageData) => {
    if (typeof window === "undefined") return;

    const testImg = new window.Image();
    testImg.crossOrigin = "anonymous";

    testImg.onload = () => {
      console.log(`✅ Image loaded successfully:`, {
        id: imageData.id,
        filename: imageData.filename,
        url: imageData.url,
        dimensions: `${testImg.naturalWidth}x${testImg.naturalHeight}`,
      });

      setImageErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[imageData.id];
        return newErrors;
      });
    };

    testImg.onerror = (error) => {
      console.error(`❌ Image failed to load:`, {
        id: imageData.id,
        filename: imageData.filename,
        url: imageData.url,
        error: error.type || "load error",
      });

      setImageErrors((prev) => ({
        ...prev,
        [imageData.id]: true,
      }));
    };

    const timeoutId = setTimeout(() => {
      console.warn(`⏰ Image load timeout:`, imageData.url);
      setImageErrors((prev) => ({
        ...prev,
        [imageData.id]: true,
      }));
    }, 10000);

    testImg.onload = () => {
      clearTimeout(timeoutId);
      console.log(`✅ Image loaded successfully:`, imageData.url);
      setImageErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[imageData.id];
        return newErrors;
      });
    };

    testImg.src = imageData.url;
  }, []);

  useEffect(() => {
    if (songId) {
      fetchImages();
    }
  }, [songId]);

  const fetchImages = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/songs/${songId}/images`
      );
      const data = await response.json();

      if (data.success) {
        console.log("📷 Fetched images:", data.data);
        setImages(data.data);
        setImageErrors({});

        data.data.forEach((image, index) => {
          console.log(`🔍 Testing image ${index + 1}:`, {
            id: image.id,
            filename: image.filename,
            url: image.url,
            size: `${(image.size / 1024).toFixed(1)} KB`,
          });

          setTimeout(() => {
            testImageLoading(image);
          }, index * 500);
        });
      } else {
        console.error("❌ Failed to fetch images:", data.message);
        message.error(data.message || "ไม่สามารถโหลดรูปภาพได้");
      }
    } catch (error) {
      console.error("💥 Error fetching images:", error);
      message.error("เกิดข้อผิดพลาดในการโหลดรูปภาพ");
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (file) => {
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      message.error("รองรับเฉพาะไฟล์ JPG, PNG, WebP เท่านั้น");
      return false;
    }

    if (file.size > 5 * 1024 * 1024) {
      message.error("ขนาดไฟล์ต้องไม่เกิน 5MB");
      return false;
    }

    if (images.length >= 6) {
      message.error("สามารถอัพโหลดได้สูงสุด 6 รูปต่อเพลง");
      return false;
    }

    const formData = new FormData();
    formData.append("images", file);

    setUploading(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/songs/${songId}/images`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (data.success) {
        message.success(`อัพโหลด "${file.name}" สำเร็จ`);

        setTimeout(() => {
          fetchImages();
        }, 1500);

        if (data.data.failed && data.data.failed.length > 0) {
          data.data.failed.forEach((failed) => {
            message.error(
              `ไม่สามารถอัพโหลด ${failed.filename}: ${failed.error}`
            );
          });
        }
      } else {
        message.error(data.message || "ไม่สามารถอัพโหลดรูปภาพได้");
      }
    } catch (error) {
      console.error("💥 Upload error:", error);
      message.error("เกิดข้อผิดพลาดในการอัพโหลด");
    } finally {
      setUploading(false);
    }

    return false;
  };

  const handleDelete = async (imageId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/songs/${songId}/images/${imageId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        message.success("ลบรูปภาพสำเร็จ");
        fetchImages();
      } else {
        message.error(data.message || "ไม่สามารถลบรูปภาพได้");
      }
    } catch (error) {
      console.error("💥 Delete error:", error);
      message.error("เกิดข้อผิดพลาดในการลบรูปภาพ");
    }
  };

  // HTML5 Drag & Drop handlers
  const handleDragStart = (e, index) => {
    if (!showControls) return;
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/html", e.target.outerHTML);
    e.target.style.opacity = "0.5";
  };

  const handleDragEnd = (e) => {
    e.target.style.opacity = "1";
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDragEnter = (e, index) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;

    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setDragOverIndex(null);
    }
  };

  const handleDrop = async (e, dropIndex) => {
    e.preventDefault();

    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const newImages = [...images];
    const draggedImage = newImages[draggedIndex];
    newImages.splice(draggedIndex, 1);
    newImages.splice(dropIndex, 0, draggedImage);

    setImages(newImages);
    setDraggedIndex(null);
    setDragOverIndex(null);

    try {
      const imageIds = newImages.map((img) => img.id);
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/songs/${songId}/images/reorder`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ imageIds }),
        }
      );

      const data = await response.json();

      if (data.success) {
        message.success("เรียงลำดับรูปภาพสำเร็จ");
        setImages(data.data);
      } else {
        message.error(data.message || "ไม่สามารถเรียงลำดับรูปภาพได้");
        fetchImages();
      }
    } catch (error) {
      console.error("💥 Reorder error:", error);
      message.error("เกิดข้อผิดพลาดในการเรียงลำดับ");
      fetchImages();
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchImages();
    setRefreshing(false);
    message.success("รีเฟรชรูปภาพแล้ว");
  };

  const getWorkingImageUrl = (originalUrl) => {
    if (!originalUrl) return null;

    const timestamp = Date.now();
    if (originalUrl.includes("?")) {
      return `${originalUrl}&t=${timestamp}&cors=true`;
    } else {
      return `${originalUrl}?t=${timestamp}&cors=true`;
    }
  };

  const retryImageLoad = (imageId) => {
    const image = images.find((img) => img.id === imageId);
    if (image) {
      setImageErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[imageId];
        return newErrors;
      });

      setTimeout(() => {
        testImageLoading(image);
      }, 500);
    }
  };

  // ฟังก์ชันสำหรับเปิด Image Viewer
  const openImageViewer = (index) => {
    setCurrentViewerIndex(index);
    setViewerVisible(true);
  };

  // ฟังก์ชันสำหรับปิด Image Viewer
  const closeImageViewer = () => {
    setViewerVisible(false);
  };

  // ฟังก์ชันสำหรับเปลี่ยนภาพใน Viewer
  const handleViewerIndexChange = (newIndex) => {
    setCurrentViewerIndex(newIndex);
  };

  const uploadProps = {
    name: "images",
    multiple: true,
    maxCount: 6 - images.length,
    beforeUpload: handleUpload,
    showUploadList: false,
    accept: "image/*",
    disabled: uploading || images.length >= 6,
  };

  if (loading) {
    return (
      <Card title={title} className="image-gallery-card">
        <div className="loading-container">
          <Spin size="large" />
          <p>กำลังโหลดรูปภาพ...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card
      title={title}
      className="image-gallery-card"
      extra={
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <Button
            type="text"
            icon={<ReloadOutlined />}
            onClick={handleRefresh}
            loading={refreshing}
            title="รีเฟรชรูปภาพ"
            size="small"
          />
          {showUpload && (
            <Button
              type="primary"
              icon={<UploadOutlined />}
              onClick={() => setUploadModalVisible(true)}
              disabled={images.length >= 6 || uploading}
              loading={uploading}
            >
              อัพโหลดรูป ({images.length}/6)
            </Button>
          )}
        </div>
      }
    >
      {Object.keys(imageErrors).length > 0 && (
        <Alert
          message="บางรูปภาพไม่สามารถแสดงผลได้"
          description={`พบ ${
            Object.keys(imageErrors).length
          } รูปที่มีปัญหา กรุณาลองรีเฟรชหรือติดต่อผู้ดูแลระบบ`}
          type="warning"
          showIcon
          icon={<WarningOutlined />}
          style={{ marginBottom: 16 }}
          action={
            <Button size="small" onClick={handleRefresh} loading={refreshing}>
              รีเฟรช
            </Button>
          }
          closable
          onClose={() => setImageErrors({})}
        />
      )}

      {images.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <div>
              <p>ยังไม่มีรูปภาพคอร์ด</p>
              {showUpload && (
                <Button
                  type="primary"
                  icon={<UploadOutlined />}
                  onClick={() => setUploadModalVisible(true)}
                >
                  อัพโหลดรูปแรก
                </Button>
              )}
            </div>
          }
          className="empty-images"
        />
      ) : (
        <div className="images-grid">
          <Row gutter={[16, 16]}>
            {images.map((image, index) => (
              <Col xs={24} sm={12} md={8} lg={6} key={image.id}>
                <div
                  className={`image-item ${
                    draggedIndex === index ? "dragging" : ""
                  } ${dragOverIndex === index ? "drag-over" : ""} ${
                    imageErrors[image.id] ? "image-error" : ""
                  }`}
                  draggable={showControls}
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragEnd={handleDragEnd}
                  onDragOver={handleDragOver}
                  onDragEnter={(e) => handleDragEnter(e, index)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, index)}
                >
                  <div className="image-wrapper">
                    {imageErrors[image.id] ? (
                      <div className="image-error-placeholder">
                        <WarningOutlined
                          style={{ fontSize: 24, color: "#faad14" }}
                        />
                        <p>ไม่สามารถโหลดรูปได้</p>
                        <p style={{ fontSize: "11px", color: "#999" }}>
                          {image.filename}
                        </p>
                        <Button
                          size="small"
                          onClick={() => retryImageLoad(image.id)}
                        >
                          ลองใหม่
                        </Button>
                      </div>
                    ) : (
                      <div className="image-container">
                        <img
                          src={getWorkingImageUrl(image.url)}
                          alt={image.filename}
                          className="gallery-image-fixed"
                          loading="lazy"
                          onError={(e) => {
                            console.error(
                              `❌ Failed to load image ${image.id}:`,
                              {
                                url: image.url,
                                filename: image.filename,
                                error: e.target.error,
                              }
                            );
                            setImageErrors((prev) => ({
                              ...prev,
                              [image.id]: true,
                            }));
                          }}
                          onLoad={(e) => {
                            console.log(
                              `✅ Successfully loaded image ${image.id}:`,
                              {
                                filename: image.filename,
                                naturalWidth: e.target.naturalWidth,
                                naturalHeight: e.target.naturalHeight,
                              }
                            );
                            if (imageErrors[image.id]) {
                              setImageErrors((prev) => {
                                const newErrors = { ...prev };
                                delete newErrors[image.id];
                                return newErrors;
                              });
                            }
                          }}
                          onClick={() => openImageViewer(index)}
                          style={{ cursor: "pointer" }}
                        />
                        <div
                          className="image-overlay"
                          onClick={() => openImageViewer(index)}
                        >
                          <div className="preview-mask">
                            <EyeOutlined />
                            <span>ดูภาพ</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {showControls && (
                      <div className="image-controls">
                        <div className="drag-handle" title="ลากเพื่อเรียงลำดับ">
                          <DragOutlined />
                        </div>

                        <Popconfirm
                          title="ยืนยันการลบรูปภาพ"
                          description={`คุณแน่ใจหรือไม่ที่จะลบรูปภาพ "${image.filename}"?`}
                          onConfirm={() => handleDelete(image.id)}
                          okText="ลบ"
                          cancelText="ยกเลิก"
                          okButtonProps={{ danger: true }}
                        >
                          <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            className="delete-btn"
                            size="small"
                          />
                        </Popconfirm>
                      </div>
                    )}

                    <div className="image-info">
                      <Tooltip title={image.filename}>
                        <span className="image-filename">{image.filename}</span>
                      </Tooltip>
                      <span className="image-size">
                        {(image.size / 1024).toFixed(1)} KB
                      </span>
                      {imageErrors[image.id] && (
                        <span className="image-status error">โหลดไม่ได้</span>
                      )}
                    </div>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </div>
      )}

      {/* Upload Modal */}
      <Modal
        title="อัพโหลดรูปภาพคอร์ด"
        open={uploadModalVisible}
        onCancel={() => setUploadModalVisible(false)}
        footer={null}
        width={600}
      >
        <div className="upload-modal-content">
          <div className="upload-info">
            <p>
              📸 อัพโหลดได้สูงสุด <strong>{6 - images.length}</strong> รูป
              (ปัจจุบันมี <strong>{images.length}/6</strong> รูป)
            </p>
            <p>📁 รองรับไฟล์: JPG, PNG, WebP</p>
            <p>📏 ขนาดสูงสุด: 5MB ต่อรูป</p>
            <p>🔄 รูปภาพจะถูกปรับขนาดให้เหมาะสมอัตโนมัติ</p>
          </div>

          <Upload.Dragger
            {...uploadProps}
            className="upload-dragger"
            disabled={uploading || images.length >= 6}
          >
            <p className="ant-upload-drag-icon">
              <UploadOutlined />
            </p>
            <p className="ant-upload-text">
              {uploading
                ? "กำลังอัพโหลด..."
                : "คลิกหรือลากไฟล์มาที่นี่เพื่ออัพโหลด"}
            </p>
            <p className="ant-upload-hint">
              {images.length >= 6
                ? "ถึงขีดจำกัดแล้ว (6/6 รูป)"
                : "รองรับการอัพโหลดหลายไฟล์พร้อมกัน"}
            </p>
          </Upload.Dragger>

          {uploading && (
            <div className="uploading-status">
              <Spin size="small" />
              กำลังอัพโหลดและประมวลผลรูปภาพ...
            </div>
          )}
        </div>
      </Modal>

      {/* Image Viewer */}
      <ImageViewer
        visible={viewerVisible}
        onClose={closeImageViewer}
        images={images.map((img) => ({
          ...img,
          url: getWorkingImageUrl(img.url),
        }))}
        currentIndex={currentViewerIndex}
        onIndexChange={handleViewerIndexChange}
      />
    </Card>
  );
};

ImageGallery.propTypes = {
  songId: PropTypes.string.isRequired,
  showUpload: PropTypes.bool,
  showControls: PropTypes.bool,
  title: PropTypes.string,
};

export default ImageGallery;
