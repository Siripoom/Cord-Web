import React, { useState, useEffect } from "react";
import {
  Card,
  Image,
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
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  EyeOutlined,
  UploadOutlined,
  DragOutlined,
} from "@ant-design/icons";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import PropTypes from "prop-types";
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
  const [previewImage, setPreviewImage] = useState("");
  const [previewVisible, setPreviewVisible] = useState(false);

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
        console.log("Fetched images:", data.data);
        setImages(data.data);
      } else {
        console.error("Failed to fetch images:", data.message);
      }
    } catch (error) {
      console.error("Error fetching images:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (file) => {
    // Check current image count
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
        message.success("อัพโหลดรูปภาพสำเร็จ");
        fetchImages(); // Refresh images

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
      console.error("Upload error:", error);
      message.error("เกิดข้อผิดพลาดในการอัพโหลด");
    } finally {
      setUploading(false);
    }

    return false; // Prevent auto upload
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
        fetchImages(); // Refresh images
      } else {
        message.error(data.message || "ไม่สามารถลบรูปภาพได้");
      }
    } catch (error) {
      console.error("Delete error:", error);
      message.error("เกิดข้อผิดพลาดในการลบรูปภาพ");
    }
  };

  const handleReorder = async (result) => {
    if (!result.destination) return;

    const items = Array.from(images);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update local state immediately for better UX
    setImages(items);

    try {
      const imageIds = items.map((img) => img.id);
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
        setImages(data.data); // Update with server response
      } else {
        message.error(data.message || "ไม่สามารถเรียงลำดับรูปภาพได้");
        fetchImages(); // Revert to original order
      }
    } catch (error) {
      console.error("Reorder error:", error);
      message.error("เกิดข้อผิดพลาดในการเรียงลำดับ");
      fetchImages(); // Revert to original order
    }
  };

  const uploadProps = {
    name: "images",
    multiple: true,
    maxCount: 6 - images.length,
    beforeUpload: handleUpload,
    showUploadList: false,
    accept: "image/*",
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
        showUpload && (
          <Button
            type="primary"
            icon={<UploadOutlined />}
            onClick={() => setUploadModalVisible(true)}
            disabled={images.length >= 6}
          >
            อัพโหลดรูป ({images.length}/6)
          </Button>
        )
      }
    >
      {images.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="ยังไม่มีรูปภาพคอร์ด"
          className="empty-images"
        />
      ) : (
        <DragDropContext onDragEnd={handleReorder}>
          <Droppable droppableId="images" direction="horizontal">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="images-grid"
              >
                <Row gutter={[16, 16]}>
                  {images.map((image, index) => (
                    <Draggable
                      key={image.id}
                      draggableId={image.id}
                      index={index}
                      isDragDisabled={!showControls}
                    >
                      {(provided, snapshot) => (
                        <Col
                          xs={24}
                          sm={12}
                          md={8}
                          lg={6}
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                        >
                          <div
                            className={`image-item ${
                              snapshot.isDragging ? "dragging" : ""
                            }`}
                          >
                            <div className="image-wrapper">
                              <Image
                                src={image.url}
                                alt={image.filename}
                                className="gallery-image"
                                preview={{
                                  mask: (
                                    <div className="preview-mask">
                                      <EyeOutlined />
                                      <span>ดูภาพ</span>
                                    </div>
                                  ),
                                }}
                                loading="lazy"
                              />

                              {showControls && (
                                <div className="image-controls">
                                  <div
                                    {...provided.dragHandleProps}
                                    className="drag-handle"
                                  >
                                    <Tooltip title="ลากเพื่อเรียงลำดับ">
                                      <DragOutlined />
                                    </Tooltip>
                                  </div>

                                  <Popconfirm
                                    title="ยืนยันการลบรูปภาพ"
                                    description="คุณแน่ใจหรือไม่ที่จะลบรูปภาพนี้?"
                                    onConfirm={() => handleDelete(image.id)}
                                    okText="ลบ"
                                    cancelText="ยกเลิก"
                                    okButtonProps={{ danger: true }}
                                  >
                                    <Button
                                      type="text"
                                      danger
                                      size="small"
                                      icon={<DeleteOutlined />}
                                      className="delete-btn"
                                    />
                                  </Popconfirm>
                                </div>
                              )}
                            </div>

                            <div className="image-info">
                              <span
                                className="image-filename"
                                title={image.filename}
                              >
                                {image.filename}
                              </span>
                              <span className="image-size">
                                {(image.size / 1024).toFixed(1)} KB
                              </span>
                            </div>
                          </div>
                        </Col>
                      )}
                    </Draggable>
                  ))}
                </Row>
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
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
              <strong>จำนวนรูปปัจจุบัน:</strong> {images.length}/6 รูป
            </p>
            <p>
              <strong>สามารถอัพโหลดเพิ่มได้:</strong> {6 - images.length} รูป
            </p>
            <p className="upload-note">
              รองรับไฟล์: JPG, PNG, WebP (ขนาดไม่เกิน 5MB ต่อรูป)
            </p>
          </div>

          <Upload.Dragger
            {...uploadProps}
            className="upload-dragger"
            loading={uploading}
          >
            <p className="ant-upload-drag-icon">
              <PlusOutlined />
            </p>
            <p className="ant-upload-text">
              คลิกหรือลากไฟล์มาที่นี่เพื่ออัพโหลด
            </p>
            <p className="ant-upload-hint">สามารถเลือกหลายไฟล์พร้อมกันได้</p>
          </Upload.Dragger>

          {uploading && (
            <div className="uploading-status">
              <Spin /> กำลังอัพโหลด...
            </div>
          )}
        </div>
      </Modal>

      {/* Preview Modal */}
      <Modal
        open={previewVisible}
        title="ดูภาพ"
        footer={null}
        onCancel={() => setPreviewVisible(false)}
        width={800}
        centered
      >
        <img alt="preview" style={{ width: "100%" }} src={previewImage} />
      </Modal>
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
