import React, { useState, useEffect, useRef } from "react";
import { logoBase64 } from "../content/uiAssets";
import { didClickInviteButton } from "../connection/connection";
import { didDismissSomethingWithOutsideTapJustNow } from "./BottomControls";
import styled from "styled-components";

const RockButtonContainer = styled.div`
  position: absolute;
  top: 9pt;
  left: 9pt;
  z-index: 10;
`;

const RockButton = styled.div`
  display: block;
  background-color: #fff;
  border: none;
  border-radius: 10px;
  padding: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;

  @media (prefers-color-scheme: dark) {
    background-color: #1a1b1f;
  }

  &:hover {
    transform: scale(1.05);
  }

  img {
    width: 30px;
    height: 30px;
    opacity: 1;
    display: block;
  }
`;

const RockMenu = styled.div<{ isOpen: boolean }>`
  position: absolute;
  top: calc(100% + 12px);
  left: 0;
  background-color: #fff;
  border-radius: 12px;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  min-width: 230px;
  transition: opacity 0.3s ease, visibility 0.3s ease;
  opacity: ${(props) => (props.isOpen ? 1 : 0)};
  visibility: ${(props) => (props.isOpen ? "visible" : "hidden")};

  @media (prefers-color-scheme: dark) {
    background-color: #1e1e1e;
  }

  a {
    color: #000;
    text-decoration: none;
    padding: 10px 16px;
    border-radius: 8px;
    transition: background-color 0.3s ease;
    text-align: left;
    width: 75%;

    @media (prefers-color-scheme: dark) {
      color: #f5f5f5;
    }

    &:hover {
      background-color: #f8f8f8;

      @media (prefers-color-scheme: dark) {
        background-color: rgba(255, 255, 255, 0.1);
      }
    }
  }
`;

const NewGameButton = styled.button`
  background-color: #0071f9;
  text-align: left;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  padding: 10px 16px;
  cursor: pointer;
  font-size: 1.2rem;
  font-weight: 600;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #0056c1;
  }
`;

const MainMenu: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isInviteLoading, setIsInviteLoading] = useState(false);
  const [didCreateInvite, setDidCreateInvite] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMenuOpen && menuRef.current && !menuRef.current.contains(event.target as Node)) {
        didDismissSomethingWithOutsideTapJustNow();
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <RockButtonContainer ref={menuRef}>
      <RockButton
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleMenu();
        }}
        onMouseEnter={() => setIsMenuOpen(true)}>
        <img src={logoBase64} alt="Rock" />
      </RockButton>
      <RockMenu isOpen={isMenuOpen}>
        <NewGameButton onClick={handleInviteClick} disabled={isInviteLoading}>
          {isInviteLoading ? (
            <span className="activity-indicator">loading...</span>
          ) : (
            <span className="button-text" style={{ fontWeight: 777 }}>
              {didCreateInvite ? "Copy Invite" : "New Game"}
            </span>
          )}
        </NewGameButton>
        <a href="https://github.com/supermetalmons" target="_blank" rel="noopener noreferrer">
          github
        </a>
        <a href="https://apps.apple.com/app/id6446702971" target="_blank" rel="noopener noreferrer">
          app store
        </a>
        <a href="https://steamcommunity.com/sharedfiles/filedetails/?id=3210189942" target="_blank" rel="noopener noreferrer">
          steam
        </a>
        <a href="https://x.com/supermetalx" target="_blank" rel="noopener noreferrer">
          x
        </a>
        <a href="https://opensea.io/collection/supermetalmons" target="_blank" rel="noopener noreferrer">
          mons gen1
        </a>
        <a href="https://opensea.io/collection/super-metal-mons-gen-2" target="_blank" rel="noopener noreferrer">
          mons gen2
        </a>
      </RockMenu>
    </RockButtonContainer>
  );
};

// TODO: add emojipack when the layout is compact enough https://opensea.io/collection/theemojipack

export default MainMenu;
