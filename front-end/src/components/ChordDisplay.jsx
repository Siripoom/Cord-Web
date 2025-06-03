import React, { useState, useEffect, useRef } from "react";
import { Select, Modal } from "antd";
import PropTypes from "prop-types";
import "./ChordDisplay.css";

const { Option } = Select;

// Chord transposition mapping with flats and sharps
const CHORD_MAP = {
  C: 0,
  "C#": 1,
  Db: 1,
  D: 2,
  "D#": 3,
  Eb: 3,
  E: 4,
  F: 5,
  "F#": 6,
  Gb: 6,
  G: 7,
  "G#": 8,
  Ab: 8,
  A: 9,
  "A#": 10,
  Bb: 10,
  B: 11,
};

// Available keys with both sharp and flat versions
const SHARP_KEYS = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
];
const FLAT_KEYS = [
  "C",
  "Db",
  "D",
  "Eb",
  "E",
  "F",
  "Gb",
  "G",
  "Ab",
  "A",
  "Bb",
  "B",
];

const ChordDisplay = ({ lyrics, defaultKey, showTransposeControls = true }) => {
  const [currentKey, setCurrentKey] = useState(defaultKey);
  const [notation, setNotation] = useState("sharp");
  const [textAlign, setTextAlign] = useState("left");
  const [scrollMode, setScrollMode] = useState("step"); // "step" หรือ "auto"
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(3);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const intervalRef = useRef(null);
  const displayRef = useRef(null);

  // Auto scroll effect - เลื่อนทั้งหน้าจอ
  useEffect(() => {
    if (isAutoScrolling) {
      const pixelsPerScroll = scrollSpeed * 2;
      const interval = scrollMode === "step" ? (11 - scrollSpeed) * 100 : 100;

      intervalRef.current = setInterval(() => {
        const currentScroll =
          window.pageYOffset || document.documentElement.scrollTop;
        const maxScroll =
          document.documentElement.scrollHeight - window.innerHeight;

        if (currentScroll >= maxScroll) {
          // Reached bottom, stop auto scroll
          setIsAutoScrolling(false);
        } else {
          // Scroll the entire page
          window.scrollBy({
            top: pixelsPerScroll,
            behavior: "smooth",
          });
        }
      }, interval);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isAutoScrolling, scrollSpeed, scrollMode]);

  // Function to transpose a chord
  const transposeChord = (chord, semitones, useFlats = false) => {
    if (!chord || semitones === 0) return chord;

    const match = chord.match(/^([A-G][#b]?)(.*)$/);
    if (!match) return chord;

    const [, root, suffix] = match;
    const rootIndex = CHORD_MAP[root];
    if (rootIndex === undefined) return chord;

    const newRootIndex = (rootIndex + semitones + 12) % 12;
    const keyArray = useFlats ? FLAT_KEYS : SHARP_KEYS;
    const newRoot = keyArray[newRootIndex];

    return newRoot + suffix;
  };

  // Calculate semitones difference
  const getSemitonesDiff = () => {
    const defaultIndex = CHORD_MAP[defaultKey] || 0;
    const currentIndex = CHORD_MAP[currentKey] || 0;
    return currentIndex - defaultIndex;
  };

  const semitonesDiff = getSemitonesDiff();

  // Handle transpose buttons
  const handleTranspose = (direction) => {
    const currentIndex = CHORD_MAP[currentKey] || 0;
    const newIndex =
      direction === "up"
        ? (currentIndex + 1) % 12
        : (currentIndex - 1 + 12) % 12;

    const keyArray = notation === "flat" ? FLAT_KEYS : SHARP_KEYS;
    setCurrentKey(keyArray[newIndex]);
  };

  // Reset to original key
  const resetKey = () => {
    setCurrentKey(defaultKey);
  };

  // Handle key selection from modal
  const handleKeyChange = (newKey) => {
    setCurrentKey(newKey);
    setShowKeyModal(false);
  };

  // Handle view mode change
  const handleViewChange = (view) => {
    setTextAlign(view);
  };

  // Handle scroll mode change
  const handleScrollChange = (mode) => {
    setScrollMode(mode);
    if (mode === "auto") {
      setIsAutoScrolling(true);
    } else {
      setIsAutoScrolling(false);
      // Scroll to top when switching to step mode
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  // Handle scroll speed change
  const handleScrollSpeedChange = (speed) => {
    setScrollSpeed(speed);
  };

  // Start/Stop scrolling for step mode
  const toggleStepScrolling = () => {
    setIsAutoScrolling(!isAutoScrolling);
  };

  // Reset scroll to top
  const scrollToTop = () => {
    setIsAutoScrolling(false);
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Get available keys based on current notation
  const getAvailableKeys = () => {
    return notation === "flat" ? FLAT_KEYS : SHARP_KEYS;
  };

  // Get CSS classes for text alignment
  const getAlignmentClass = () => {
    switch (textAlign) {
      case "center":
        return "text-center";
      case "compact":
        return "text-compact";
      default:
        return "text-left";
    }
  };

  return (
    <div className="chord-display-container">
      {showTransposeControls && (
        <div className="chord-controls">
          {/* Key Control Section */}
          <div className="key-control-section">
            <h3 className="key-section-title">เพิ่มลดคีย์เพลง</h3>

            <div className="key-selector-container">
              <button
                className="transpose-btn"
                onClick={() => handleTranspose("down")}
                aria-label="ลดคีย์"
              >
                −
              </button>

              <button
                className="current-key-display"
                onClick={() => setShowKeyModal(true)}
              >
                Key {currentKey}
              </button>

              <button
                className="transpose-btn"
                onClick={() => handleTranspose("up")}
                aria-label="เพิ่มคีย์"
              >
                +
              </button>
            </div>

            {/* <div className="original-key-info">Original Key</div> */}

            <button
              className="reset-btn"
              onClick={resetKey}
              disabled={currentKey === defaultKey}
            >
              Reset
            </button>
          </div>

          {/* View Controls */}
          <div className="view-controls">
            <div className="view-section">
              <span className="view-label">View :</span>
              <div className="view-toggle">
                <button
                  className={`view-option ${
                    textAlign === "left" ? "active" : ""
                  }`}
                  onClick={() => handleViewChange("left")}
                >
                  ⊞ Horizontal
                </button>
                <button
                  className={`view-option ${
                    textAlign === "center" ? "active" : ""
                  }`}
                  onClick={() => handleViewChange("center")}
                >
                  ⊞ Vertical
                </button>
              </div>
            </div>
          </div>

          {/* Scroll Controls */}
          <div className="scroll-controls">
            <span className="scroll-label">Scroll :</span>
            <div className="scroll-toggle">
              <button
                className={`scroll-option ${
                  scrollMode === "step" ? "active" : ""
                }`}
                onClick={() => handleScrollChange("step")}
              >
                Step
              </button>
              <button
                className={`scroll-option ${
                  scrollMode === "auto" ? "active" : ""
                }`}
                onClick={() => handleScrollChange("auto")}
              >
                Auto
              </button>
            </div>
          </div>

          {/* Speed Control - แสดงเมื่อเลือก Step mode */}
          {scrollMode === "step" && (
            <div className="speed-controls">
              <div className="speed-section">
                <span className="speed-label">ความเร็ว:</span>
                <div className="speed-buttons">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((speed) => (
                    <button
                      key={speed}
                      className={`speed-btn ${
                        scrollSpeed === speed ? "active" : ""
                      }`}
                      onClick={() => handleScrollSpeedChange(speed)}
                    >
                      {speed}
                    </button>
                  ))}
                </div>
              </div>

              <div className="scroll-action-buttons">
                <button
                  className={`scroll-control-btn ${
                    isAutoScrolling ? "stop" : "start"
                  }`}
                  onClick={toggleStepScrolling}
                >
                  {isAutoScrolling ? "⏸️ หยุด" : "▶️ เริ่ม"}
                </button>
                <button
                  className="scroll-control-btn reset"
                  onClick={scrollToTop}
                >
                  ⏫ กลับด้านบน
                </button>
              </div>
            </div>
          )}

          {/* Key Info Display */}
          {currentKey !== defaultKey && (
            <div className="key-info">
              <strong>เปลี่ยนจาก:</strong> {defaultKey} →{" "}
              <strong>{currentKey}</strong>
              {semitonesDiff > 0 && (
                <span className="transpose-info"> (+{semitonesDiff} ขั้น)</span>
              )}
              {semitonesDiff < 0 && (
                <span className="transpose-info"> ({semitonesDiff} ขั้น)</span>
              )}
            </div>
          )}
        </div>
      )}

      <div
        ref={displayRef}
        className={`chord-display ${getAlignmentClass()} ${
          isAutoScrolling ? "auto-scrolling" : ""
        }`}
        data-speed={scrollSpeed}
      >
        {lyrics && lyrics.length > 0 ? (
          lyrics.map((item, idx) => {
            const { word, chord } = item;
            const transposedChord = chord
              ? transposeChord(chord, semitonesDiff, notation === "flat")
              : null;

            if (word === "\n" || word === "\r\n") {
              return <br key={idx} />;
            }

            return (
              <span key={idx} className="chord-word">
                {transposedChord && (
                  <span className="chord-text">{transposedChord}</span>
                )}
                <span className="word-text">{word}</span>
              </span>
            );
          })
        ) : (
          <div className="no-lyrics">ไม่มีเนื้อเพลงหรือคอร์ด</div>
        )}
      </div>

      {/* Key Selection Modal */}
      <Modal
        title="เลือกคีย์เพลง"
        open={showKeyModal}
        onCancel={() => setShowKeyModal(false)}
        footer={null}
        width={400}
      >
        <div style={{ padding: "20px 0" }}>
          <div style={{ marginBottom: "16px" }}>
            <label style={{ marginRight: "12px" }}>รูปแบบ:</label>
            <Select
              value={notation}
              onChange={setNotation}
              style={{ width: 120 }}
            >
              <Option value="sharp">♯ Sharp</Option>
              <Option value="flat">♭ Flat</Option>
            </Select>
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label>เลือกคีย์:</label>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "8px",
            }}
          >
            {getAvailableKeys().map((key) => (
              <button
                key={key}
                onClick={() => handleKeyChange(key)}
                style={{
                  padding: "12px",
                  border:
                    key === currentKey ? "2px solid #ff4500" : "1px solid #ddd",
                  background: key === currentKey ? "#fff5f0" : "white",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "16px",
                  fontWeight: "600",
                }}
              >
                {key}
              </button>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
};

ChordDisplay.propTypes = {
  lyrics: PropTypes.arrayOf(
    PropTypes.shape({
      word: PropTypes.string.isRequired,
      chord: PropTypes.string,
      wordOrder: PropTypes.number,
    })
  ).isRequired,
  defaultKey: PropTypes.string.isRequired,
  showTransposeControls: PropTypes.bool,
};

export default ChordDisplay;
