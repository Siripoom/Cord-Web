import React from "react";
import PropTypes from "prop-types";
import "./ChordDisplay.css";

const ChordDisplay = ({ lyrics }) => {
  // lyrics = [{ word: 'เธอจะ', chord: 'C', wordOrder: 0 }, ...]

  return (
    <div className="chord-display">
      {lyrics.map(({ word, chord }, idx) => (
        <span key={idx} className="chord-word">
          {chord && <span className="chord-text">{chord}</span>}
          <span className="word-text">{word}</span>{" "}
        </span>
      ))}
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
};

export default ChordDisplay;
