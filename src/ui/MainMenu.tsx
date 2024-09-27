import React, { useState } from "react";
import { logoBase64 } from "../content/uiAssets";
import { didClickInviteButton } from "../connection/connection";

const MainMenu: React.FC = () => {
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
              // TODO: explicit responsive state "invite link is copied"
              // TODO: show "loading mons game..." or similar text when appropriate
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
  );
};

export default MainMenu;