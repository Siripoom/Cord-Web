import React, { useState, useEffect, useRef } from "react";
import { Button, Space, Select, Radio, Slider } from "antd";
import {
  AlignLeftOutlined,
  AlignCenterOutlined,
  CompressOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  StepForwardOutlined,
} from "@ant-design/icons";
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
  const [notation, setNotation] = useState("sharp"); // 'sharp' or 'flat'
  const [textAlign, setTextAlign] = useState("left"); // 'left', 'center', 'compact'
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(3); // 1-10 scale
  const intervalRef = useRef(null);
  const displayRef = useRef(null);

  // Auto scroll effect
  useEffect(() => {
    if (isAutoScrolling) {
      // Convert speed (1-10) to pixels per interval (slower = higher number)
      const pixelsPerScroll = scrollSpeed * 2; // 2-20 pixels per scroll
      const interval = 100; // milliseconds between scrolls

      intervalRef.current = setInterval(() => {
        if (displayRef.current) {
          const element = displayRef.current;
          const maxScroll = element.scrollHeight - element.clientHeight;

          if (element.scrollTop >= maxScroll) {
            // Reached bottom, stop auto scroll
            setIsAutoScrolling(false);
          } else {
            element.scrollTop += pixelsPerScroll;
          }
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
  }, [isAutoScrolling, scrollSpeed]);

  // Function to transpose a chord
  const transposeChord = (chord, semitones, useFlats = false) => {
    if (!chord || semitones === 0) return chord;

    // Extract the root note and suffix (e.g., "Am7" -> "A" + "m7")
    const match = chord.match(/^([A-G][#b]?)(.*)$/);
    if (!match) return chord;

    const [, root, suffix] = match;
    const rootIndex = CHORD_MAP[root];
    if (rootIndex === undefined) return chord;

    // Calculate new root note
    const newRootIndex = (rootIndex + semitones + 12) % 12;
    const keyArray = useFlats ? FLAT_KEYS : SHARP_KEYS;
    const newRoot = keyArray[newRootIndex];

    return newRoot + suffix;
  };

  // Calculate semitones difference between current key and default key
  const getSemitonesDiff = () => {
    const defaultIndex = CHORD_MAP[defaultKey] || 0;
    const currentIndex = CHORD_MAP[currentKey] || 0;
    return currentIndex - defaultIndex;
  };

  const semitonesDiff = getSemitonesDiff();

  // Handle key change
  const handleKeyChange = (newKey) => {
    setCurrentKey(newKey);
  };

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

  // Handle notation change (sharp/flat)
  const handleNotationChange = (e) => {
    const newNotation = e.target.value;
    setNotation(newNotation);

    // Convert current key to new notation
    const currentIndex = CHORD_MAP[currentKey] || 0;
    const keyArray = newNotation === "flat" ? FLAT_KEYS : SHARP_KEYS;
    setCurrentKey(keyArray[currentIndex]);
  };

  // Handle text alignment change
  const handleTextAlignChange = (alignment) => {
    setTextAlign(alignment);
  };

  // Handle auto scroll toggle
  const handleAutoScrollToggle = () => {
    setIsAutoScrolling(!isAutoScrolling);
  };

  // Handle scroll speed change
  const handleScrollSpeedChange = (value) => {
    setScrollSpeed(value);
  };

  // Reset scroll to top
  const handleScrollToTop = () => {
    if (displayRef.current) {
      displayRef.current.scrollTop = 0;
    }
    setIsAutoScrolling(false);
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
          <Space wrap size="middle">
            <div className="control-group">
              <span className="control-label">คีย์ปัจจุบัน:</span>
              <Select
                value={currentKey}
                onChange={handleKeyChange}
                style={{ width: 80 }}
              >
                {getAvailableKeys().map((key) => (
                  <Option key={key} value={key}>
                    {key}
                  </Option>
                ))}
              </Select>
            </div>

            <div className="control-group">
              <span className="control-label">รูปแบบ:</span>
              <Radio.Group
                value={notation}
                onChange={handleNotationChange}
                size="small"
              >
                <Radio.Button value="sharp">♯ Sharp</Radio.Button>
                <Radio.Button value="flat">♭ Flat</Radio.Button>
              </Radio.Group>
            </div>

            <div className="control-group">
              <span className="control-label">ปรับคีย์:</span>
              <Space>
                <Button
                  size="small"
                  onClick={() => handleTranspose("down")}
                  icon="♭"
                >
                  ลดคีย์
                </Button>
                <Button
                  size="small"
                  onClick={() => handleTranspose("up")}
                  icon="♯"
                >
                  เพิ่มคีย์
                </Button>
                <Button
                  size="small"
                  onClick={resetKey}
                  disabled={currentKey === defaultKey}
                  type="dashed"
                >
                  รีเซต
                </Button>
              </Space>
            </div>

            <div className="control-group">
              <span className="control-label">จัดแนว:</span>
              <Space>
                <Button
                  size="small"
                  type={textAlign === "left" ? "primary" : "default"}
                  icon={<AlignLeftOutlined />}
                  onClick={() => handleTextAlignChange("left")}
                >
                  ซ้าย
                </Button>
                <Button
                  size="small"
                  type={textAlign === "center" ? "primary" : "default"}
                  icon={<AlignCenterOutlined />}
                  onClick={() => handleTextAlignChange("center")}
                >
                  กลาง
                </Button>
                <Button
                  size="small"
                  type={textAlign === "compact" ? "primary" : "default"}
                  icon={<CompressOutlined />}
                  onClick={() => handleTextAlignChange("compact")}
                >
                  กระชับ
                </Button>
              </Space>
            </div>

            {/* Auto Scroll Controls */}
            <div className="control-group auto-scroll-group">
              <span className="control-label">Auto Scroll:</span>
              <Space>
                <Button
                  size="small"
                  type={isAutoScrolling ? "primary" : "default"}
                  icon={
                    isAutoScrolling ? (
                      <PauseCircleOutlined />
                    ) : (
                      <PlayCircleOutlined />
                    )
                  }
                  onClick={handleAutoScrollToggle}
                >
                  {isAutoScrolling ? "หยุด" : "เล่น"}
                </Button>
                <Button
                  size="small"
                  icon={<StepForwardOutlined />}
                  onClick={handleScrollToTop}
                  title="กลับไปด้านบน"
                >
                  ด้านบน
                </Button>
              </Space>
            </div>

            {/* Speed Control */}
            <div className="control-group speed-control">
              <span className="control-label">ความเร็ว:</span>
              <div className="speed-slider">
                <Slider
                  min={1}
                  max={10}
                  value={scrollSpeed}
                  onChange={handleScrollSpeedChange}
                  style={{ width: 100 }}
                  tooltip={{
                    formatter: (value) => `${value}/10`,
                  }}
                />
                <span className="speed-indicator">{scrollSpeed}/10</span>
              </div>
            </div>

            {currentKey !== defaultKey && (
              <div className="key-info">
                <strong>เปลี่ยนจาก:</strong> {defaultKey} →{" "}
                <strong>{currentKey}</strong>
                {semitonesDiff > 0 && (
                  <span className="transpose-info">
                    {" "}
                    (+{semitonesDiff} ขั้น)
                  </span>
                )}
                {semitonesDiff < 0 && (
                  <span className="transpose-info">
                    {" "}
                    ({semitonesDiff} ขั้น)
                  </span>
                )}
              </div>
            )}
          </Space>
        </div>
      )}

      <div
        ref={displayRef}
        className={`chord-display ${getAlignmentClass()} ${
          isAutoScrolling ? "auto-scrolling" : ""
        }`}
      >
        {lyrics && lyrics.length > 0 ? (
          lyrics.map((item, idx) => {
            const { word, chord } = item;
            const transposedChord = chord
              ? transposeChord(chord, semitonesDiff, notation === "flat")
              : null;

            // จัดการกับบรรทัดใหม่
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
