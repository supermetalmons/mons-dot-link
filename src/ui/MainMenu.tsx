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

  @media (prefers-color-scheme: dark) {
    background-color: #1a1b1f;
  }

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      transform: scale(1.05);
    }
  }

  img {
    width: 30px;
    height: 30px;
    opacity: 1;
    display: block;
  }
`;

const RockMenu = styled.div`
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

  @media (prefers-color-scheme: dark) {
    background-color: #1e1e1e;
  }
`;

const NewGameButton = styled.button`
  background-color: #0e76fd;
  height: 55px;
  text-align: left;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  padding: 10px 16px;
  cursor: pointer;
  font-size: 1.2rem;
  font-weight: 600;
  transition: background-color 0.1s ease;

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      background-color: #0c66db;
    }
  }

  &:active {
    background-color: #0a56b9;
  }

  @media (prefers-color-scheme: dark) {
    background-color: #3898ff;

    @media (hover: hover) and (pointer: fine) {
      &:hover {
        background-color: #4ca5ff;
      }
    }

    &:active {
      background-color: #2688f0;
    }
  }
`;

const IconRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 8px;

  a {
    color: #000;
    text-decoration: none;
    padding: 32px 16px;
    border-radius: 8px;
    text-align: left;
    width: 75%;

    @media (prefers-color-scheme: dark) {
      color: #f5f5f5;
    }
  }
`;

const IconLink = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: #f0f0f0;

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      background-color: #e0e0e0;
    }
  }

  @media (prefers-color-scheme: dark) {
    background-color: #2a2a2a;

    @media (hover: hover) and (pointer: fine) {
      &:hover {
        background-color: #3a3a3a;
      }
    }
  }

  img {
    width: 24px;
    height: 24px;
  }
`;

const LinkRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 8px;
  align-items: center;
`;

const LinkButton = styled.a`
  flex: 1;
  padding: 32px 0px;
  text-align: center;
  font-size: 0.55rem;
  border-radius: 8px;
  background-color: #f0f0f0;
  color: #333;
  text-decoration: none;

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      background-color: #e0e0e0;
    }
  }

  @media (prefers-color-scheme: dark) {
    background-color: #2a2a2a;
    color: #f5f5f5;

    @media (hover: hover) and (pointer: fine) {
      &:hover {
        background-color: #3a3a3a;
      }
    }
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
      {isMenuOpen && (
        <RockMenu>
          <NewGameButton onClick={handleInviteClick} disabled={isInviteLoading}>
            {isInviteLoading ? (
              <span className="activity-indicator">loading...</span>
            ) : (
              <span className="button-text" style={{ fontWeight: 777 }}>
                {didCreateInvite ? "Copy Invite" : "New Game"}
              </span>
            )}
          </NewGameButton>
          <IconRow>
            <IconLink href="https://x.com/supermetalx" target="_blank" rel="noopener noreferrer">
              <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" stroke="currentColor" stroke-width="0.2" />
              </svg>
            </IconLink>
            <IconLink href="https://github.com/supermetalmons" target="_blank" rel="noopener noreferrer">
              <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
            </IconLink>
          </IconRow>
          <LinkRow>
            <LinkButton href="https://opensea.io/collection/supermetalmons" target="_blank" rel="noopener noreferrer">
              Gen 1
            </LinkButton>
            <LinkButton href="https://opensea.io/collection/super-metal-mons-gen-2" target="_blank" rel="noopener noreferrer">
              Gen 2
            </LinkButton>
            <LinkButton href="https://supermetalmons.com" target="_blank" rel="noopener noreferrer">
              IRL
            </LinkButton>
          </LinkRow>
          <LinkRow>
            <LinkButton href="https://base.easscan.org/schema/view/0x5c6e798cbb817442fa075e01b65d5d65d3ac35c2b05c1306e8771a1c8a3adb32" target="_blank" rel="noopener noreferrer">
              Onchain Ratings
            </LinkButton>
          </LinkRow>
        </RockMenu>
      )}
    </RockButtonContainer>
  );
};

// TODO: add emojipack when the layout is compact enough https://opensea.io/collection/theemojipack

export default MainMenu;
