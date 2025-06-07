// front-end/src/components/ImageViewer/ImageViewer.jsx
import React, { useState, useEffect, useCallback } from "react";
import { Modal, Button, Spin, message } from "antd";
import {
  LeftOutlined,
  RightOutlined,
  CloseOutlined,
  DownloadOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  RotateLeftOutlined,
  RotateRightOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
} from "@ant-design/icons";
import PropTypes from "prop-types";
import "./ImageViewer.css";

const ImageViewer = ({
  visible,
  onClose,
  images = [],
  currentIndex = 0,
  onIndexChange,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(currentIndex);
  const [loading, setLoading] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [touchStart, setTouchStart] = useState({ x: 0, y: 0 });
  const [touchDistance, setTouchDistance] = useState(0);
  const [initialZoom, setInitialZoom] = useState(1);
  const [lastTap, setLastTap] = useState(0);
  // Reset states when modal opens/closes or image changes
  useEffect(() => {
    if (visible) {
      setCurrentImageIndex(currentIndex);
      resetImageState();
    }
  }, [visible, currentIndex]);

  useEffect(() => {
    if (onIndexChange) {
      onIndexChange(currentImageIndex);
    }
  }, [currentImageIndex, onIndexChange]);

  // Helper function สำหรับคำนวณระยะห่างระหว่างสองนิ้ว
  const getDistance = (touch1, touch2) => {
    return Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
    );
  };

  // Enhanced touch handlers
  const handleTouchStart = (e) => {
    const touches = e.touches;

    if (touches.length === 1) {
      // Single touch - check for double tap
      const now = Date.now();
      const timeSinceLastTap = now - lastTap;

      if (timeSinceLastTap < 300 && timeSinceLastTap > 0) {
        // Double tap - toggle zoom
        handleDoubleTab();
        e.preventDefault();
        return;
      }

      setLastTap(now);

      // Single touch for dragging
      if (zoom > 1) {
        setIsDragging(true);
        const touch = touches[0];
        setDragStart({
          x: touch.clientX - position.x,
          y: touch.clientY - position.y,
        });
      } else {
        // Single touch on non-zoomed image - prepare for swipe
        setTouchStart({
          x: touches[0].clientX,
          y: touches[0].clientY,
        });
      }
    } else if (touches.length === 2) {
      // Two fingers - pinch zoom
      e.preventDefault();
      const distance = getDistance(touches[0], touches[1]);
      setTouchDistance(distance);
      setInitialZoom(zoom);
      setIsDragging(false);
    }
  };

  const handleTouchMove = (e) => {
    const touches = e.touches;

    if (touches.length === 1 && isDragging && zoom > 1) {
      // Single finger drag on zoomed image
      e.preventDefault();
      const touch = touches[0];
      setPosition({
        x: touch.clientX - dragStart.x,
        y: touch.clientY - dragStart.y,
      });
    } else if (touches.length === 2) {
      // Two finger pinch zoom
      e.preventDefault();
      const distance = getDistance(touches[0], touches[1]);
      const scale = distance / touchDistance;
      const newZoom = Math.min(Math.max(initialZoom * scale, 0.1), 5);
      setZoom(newZoom);
    }
  };

  const handleTouchEnd = (e) => {
    const touches = e.changedTouches;

    if (touches.length === 1 && !isDragging && zoom <= 1) {
      // Check for swipe gesture
      const touch = touches[0];
      const deltaX = touch.clientX - touchStart.x;
      const deltaY = touch.clientY - touchStart.y;
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);

      // Swipe threshold
      const minSwipeDistance = 50;

      if (absX > minSwipeDistance && absX > absY) {
        if (deltaX > 0) {
          // Swipe right - previous image
          goToPrevious();
        } else {
          // Swipe left - next image
          goToNext();
        }
      }
    }

    setIsDragging(false);
    setTouchDistance(0);
  };

  // Double tap handler
  const handleDoubleTab = () => {
    if (zoom === 1) {
      // Zoom in to 2x
      setZoom(2);
      setPosition({ x: 0, y: 0 });
    } else {
      // Reset zoom
      resetImageState();
    }
  };

  // Reset image state
  const resetImageState = () => {
    setZoom(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
    setImageLoaded(false);
    setLoading(false);
  };

  const currentImage = images[currentImageIndex];

  // Navigation functions
  const goToPrevious = useCallback(() => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex((prev) => prev - 1);
      resetImageState();
    }
  }, [currentImageIndex]);

  const goToNext = useCallback(() => {
    if (currentImageIndex < images.length - 1) {
      setCurrentImageIndex((prev) => prev + 1);
      resetImageState();
    }
  }, [currentImageIndex, images.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!visible) return;

      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          goToPrevious();
          break;
        case "ArrowRight":
          e.preventDefault();
          goToNext();
          break;
        case "Escape":
          e.preventDefault();
          onClose();
          break;
        case "+":
        case "=":
          e.preventDefault();
          handleZoomIn();
          break;
        case "-":
          e.preventDefault();
          handleZoomOut();
          break;
        case "0":
          e.preventDefault();
          resetImageState();
          break;
        default:
          break;
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [visible, goToPrevious, goToNext, onClose]);

  // Zoom and rotation functions
  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev * 1.2, 5));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev / 1.2, 0.1));
  };

  const handleRotateLeft = () => {
    setRotation((prev) => prev - 90);
  };

  const handleRotateRight = () => {
    setRotation((prev) => prev + 90);
  };

  const handleReset = () => {
    resetImageState();
  };

  // Mouse drag functions
  const handleMouseDown = (e) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging && zoom > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Wheel zoom
  const handleWheel = (e) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      handleZoomIn();
    } else {
      handleZoomOut();
    }
  };

  // Download function
  const handleDownload = async () => {
    if (!currentImage) return;

    try {
      const response = await fetch(currentImage.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = currentImage.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      message.success("ดาวน์โหลดสำเร็จ");
    } catch (error) {
      console.error("Download failed:", error);
      message.error("ไม่สามารถดาวน์โหลดได้");
    }
  };

  // Fullscreen functions
  const toggleFullscreen = () => {
    if (!isFullscreen) {
      const element = document.querySelector(
        ".image-viewer-modal .ant-modal-content"
      );
      if (element.requestFullscreen) {
        element.requestFullscreen();
      } else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen();
      } else if (element.msRequestFullscreen) {
        element.msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    }
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("msfullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullscreenChange
      );
      document.removeEventListener(
        "msfullscreenchange",
        handleFullscreenChange
      );
    };
  }, []);

  if (!currentImage) return null;

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      width="90vw"
      height="90vh"
      centered
      closeIcon={false}
      className={`image-viewer-modal ${isFullscreen ? "fullscreen" : ""}`}
      styles={{
        body: {
          padding: 0,
          height: "90vh",
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      {/* Header with controls */}
      <div className="viewer-header">
        <div className="viewer-info">
          <span className="image-title">{currentImage.filename}</span>
          <span className="image-counter">
            {currentImageIndex + 1} / {images.length}
          </span>
        </div>

        <div className="viewer-controls">
          <Button
            type="text"
            icon={<DownloadOutlined />}
            onClick={handleDownload}
            title="ดาวน์โหลด"
          />
          <Button
            type="text"
            icon={<ZoomOutOutlined />}
            onClick={handleZoomOut}
            disabled={zoom <= 0.1}
            title="ซูมออก"
          />
          <span className="zoom-level">{Math.round(zoom * 100)}%</span>
          <Button
            type="text"
            icon={<ZoomInOutlined />}
            onClick={handleZoomIn}
            disabled={zoom >= 5}
            title="ซูมเข้า"
          />
          <Button
            type="text"
            icon={<RotateLeftOutlined />}
            onClick={handleRotateLeft}
            title="หมุนซ้าย"
          />
          <Button
            type="text"
            icon={<RotateRightOutlined />}
            onClick={handleRotateRight}
            title="หมุนขวา"
          />
          <Button
            type="text"
            icon={
              isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />
            }
            onClick={toggleFullscreen}
            title={isFullscreen ? "ออกจากเต็มจอ" : "เต็มจอ"}
          />
          <Button type="text" onClick={handleReset} title="รีเซ็ต">
            Reset
          </Button>
          <Button
            type="text"
            icon={<CloseOutlined />}
            onClick={onClose}
            title="ปิด"
          />
        </div>
      </div>

      {/* Image container */}
      <div className="viewer-content">
        {/* Navigation arrows */}
        {images.length > 1 && (
          <>
            <Button
              className="nav-arrow nav-arrow-left"
              type="text"
              icon={<LeftOutlined />}
              onClick={goToPrevious}
              disabled={currentImageIndex === 0}
              size="large"
            />
            <Button
              className="nav-arrow nav-arrow-right"
              type="text"
              icon={<RightOutlined />}
              onClick={goToNext}
              disabled={currentImageIndex === images.length - 1}
              size="large"
            />
          </>
        )}

        {/* Image display area */}
        <div
          className="image-container"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onWheel={handleWheel}
          style={{
            cursor: zoom > 1 ? (isDragging ? "grabbing" : "grab") : "default",
            touchAction: zoom > 1 ? "none" : "pan-y", // ป้องกันการ scroll เมื่อซูม
          }}
        >
          {loading && (
            <div className="image-loading">
              <Spin size="large" />
              <p>กำลังโหลดรูปภาพ...</p>
            </div>
          )}

          <img
            src={currentImage.url}
            alt={currentImage.filename}
            className="viewer-image"
            onLoad={() => {
              setImageLoaded(true);
              setLoading(false);
            }}
            // eslint-disable-next-line react/no-unknown-property
            onLoadStart={() => {
              setLoading(true);
              setImageLoaded(false);
            }}
            onError={() => {
              setLoading(false);
              message.error("ไม่สามารถโหลดรูปภาพได้");
            }}
            style={{
              transform: `
                translate(${position.x}px, ${position.y}px) 
                scale(${zoom}) 
                rotate(${rotation}deg)
              `,
              opacity: imageLoaded ? 1 : 0,
              transition: isDragging ? "none" : "opacity 0.3s ease",
            }}
            draggable={false}
          />
        </div>
      </div>

      {/* Thumbnails at bottom */}
      {images.length > 1 && (
        <div className="viewer-thumbnails">
          <div className="thumbnails-container">
            {images.map((image, index) => (
              <div
                key={image.id}
                className={`thumbnail ${
                  index === currentImageIndex ? "active" : ""
                }`}
                onClick={() => {
                  setCurrentImageIndex(index);
                  resetImageState();
                }}
              >
                <img
                  src={image.url}
                  alt={image.filename}
                  className="thumbnail-image"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instructions overlay */}
      <div className="viewer-instructions">
        <div className="instruction-item">← → เลื่อนภาพ</div>
        <div className="instruction-item">Mouse wheel ซูม</div>
        <div className="instruction-item">Drag เลื่อนภาพที่ซูม</div>
        <div className="instruction-item">ESC ปิด</div>
      </div>
    </Modal>
  );
};

ImageViewer.propTypes = {
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  images: PropTypes.array.isRequired,
  currentIndex: PropTypes.number,
  onIndexChange: PropTypes.func,
};

export default ImageViewer;
