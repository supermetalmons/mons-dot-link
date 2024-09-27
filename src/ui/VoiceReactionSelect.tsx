import React from 'react';
import { voiceReactionIconSvg } from "../content/uiAssets";

const VoiceReactionSelect: React.FC = () => {
  return (
    <>
      <button
        className="voice-reaction-button"
        style={{
          position: "absolute",
          bottom: "9pt",
          right: "9pt",
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "5px",
          display: "none",
          alignItems: "center",
          justifyContent: "center",
          width: "24px",
          height: "24px",
          backgroundColor: "white",
        }}
      >
        <img src={`data:image/svg+xml;utf8,${encodeURIComponent(voiceReactionIconSvg)}`} alt="Voice Chat" width="100%" height="100%" />
      </button>

      <select
        className="voice-reaction-select"
        style={{
          position: "absolute",
          bottom: "10pt",
          right: "9pt",
          outline: "none",
          display: "none",
          fontSize: "1.23rem",
          opacity: 0.81,
        }}>
        <option value="" disabled selected>
          say
        </option>
        <option value="yo">yo</option>
        <option value="wahoo">wahoo</option>
        <option value="drop">drop</option>
        <option value="slurp">slurp</option>
        <option value="gg">gg</option>
      </select>
    </>
  );
};

export default VoiceReactionSelect;