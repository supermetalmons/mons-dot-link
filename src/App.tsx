import React, { useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import BoardComponent from "./BoardComponent";
import { voiceReactionIconSvg, logoBase64 } from "./helpers/ui-assets";
import { didClickInviteButton } from "./helpers/page-setup";

const App: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isInviteLoading, setIsInviteLoading] = useState(false);
  const [didCreateInvite, setDidCreateInvite] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleInviteClick = () => {
    setIsInviteLoading(true);
    didClickInviteButton((result) => {
      if (result) {
        setIsInviteLoading(false);
        setDidCreateInvite(true);
        console.log("Invite created successfully");
        // TODO: handle invite copy here too
      } else {
        setIsInviteLoading(false);
        console.error("Failed to create invite");
      }
    });
  };

  return (
    <div className="app-container">
      <div className="connect-button-container">
        <ConnectButton
          showBalance={false}
          chainStatus="none"
          accountStatus={{
            smallScreen: "avatar",
            largeScreen: "full",
          }}
        />
      </div>
      <BoardComponent />

      <div className="rock-button-container">
        <div
          className="rock-button"
          onClick={(e) => {
            e.preventDefault();
            toggleMenu();
          }}
          onMouseEnter={() => setIsMenuOpen(true)}
          // onMouseLeave={() => setIsMenuOpen(false)} // TODO: auto-close when cursor is far away
        >
          <img src={logoBase64} alt="Rock" />
        </div>
        {isMenuOpen && (
          <div className="rock-menu">
            <button className="new-game-button" onClick={handleInviteClick} disabled={isInviteLoading}>
              {isInviteLoading ? (
                <span className="activity-indicator">loading...</span>
              ) : (
                <span className="button-text">{didCreateInvite ? "copy invite" : "new game"}</span>
              )}
            </button>
            <a href="https://github.com/supermetalmons" target="_blank" rel="noopener noreferrer">github</a>
            <a href="https://apps.apple.com/app/id6446702971" target="_blank" rel="noopener noreferrer">app store</a>
            <a href="https://steamcommunity.com/sharedfiles/filedetails/?id=3210189942" target="_blank" rel="noopener noreferrer">steam</a>
            <a href="https://x.com/supermetalx" target="_blank" rel="noopener noreferrer">x</a>
            <a href="https://opensea.io/collection/supermetalmons" target="_blank" rel="noopener noreferrer">mons gen1</a>
            <a href="https://opensea.io/collection/super-metal-mons-gen-2" target="_blank" rel="noopener noreferrer">mons gen2</a>
          </div>
        )}
      </div>

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
    </div>
  );
};

export default App;
