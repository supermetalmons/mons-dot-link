import React, { useState, useEffect } from "react";
import { voiceReactionIconSvg } from "../content/uiAssets";
import { newReactionOfKind, playReaction } from "../content/sounds";
import { sendVoiceReaction } from "../connection/connection";

let setIsSelectVisibleGlobal: React.Dispatch<React.SetStateAction<boolean>> | null = null;

const VoiceReactionSelect: React.FC = () => {
  const [isSelectVisible, setIsSelectVisible] = useState(false);

  useEffect(() => {
    setIsSelectVisibleGlobal = setIsSelectVisible;
    return () => {
      setIsSelectVisibleGlobal = null;
    };
  }, []);

  const handleVoiceReactionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const reaction = newReactionOfKind(event.target.value);
    event.target.selectedIndex = 0;
    sendVoiceReaction(reaction);
    playReaction(reaction);
    showVoiceReactionText(reaction.kind, false);
    setIsSelectVisible(false);
    setTimeout(() => {
      setIsSelectVisible(true);
    }, 9999);
  };

  return (
    <>
      <button
        className="voice-reaction-button"
        style={{
          position: "absolute",
          bottom: "9pt",
          left: "9pt",
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
        }}>
        <img src={`data:image/svg+xml;utf8,${encodeURIComponent(voiceReactionIconSvg)}`} alt="Voice Chat" width="100%" height="100%" />
      </button>

      <select
        className="voice-reaction-select"
        style={{
          position: "absolute",
          bottom: "10pt",
          left: "9pt",
          outline: "none",
          display: isSelectVisible ? "block" : "none",
          fontSize: "1.23rem",
          opacity: 0.81,
        }}
        onChange={handleVoiceReactionChange}>
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

export function setVoiceReactionSelectHidden(hidden: boolean) {
  if (setIsSelectVisibleGlobal) {
    setIsSelectVisibleGlobal(!hidden);
  }
}

export function showVoiceReactionText(reactionText: string, opponents: boolean) {
  // TODO: display within board player / opponent text elements
}

export default VoiceReactionSelect;
