import React, { useState, useEffect, useRef } from "react";
import { logoBase64 } from "../content/uiAssets";
import { didDismissSomethingWithOutsideTapJustNow } from "./BottomControls";
import styled from "styled-components";
import { isMobile } from "../utils/misc";

const RockButtonContainer = styled.div`
  position: absolute;
  top: 9pt;
  left: 9pt;
  z-index: 10;
`;

const RockButton = styled.button`
  display: block;
  background-color: #f9f9f9;
  border: none;
  border-radius: 10px;
  padding: 3px 6px;
  cursor: pointer;
  position: relative;
  z-index: 2;

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      background-color: #f8f8f8;
    }
  }

  @media (prefers-color-scheme: dark) {
    background-color: #252525;

    @media (hover: hover) and (pointer: fine) {
      &:hover {
        background-color: #262626;
      }
    }
  }

  img {
    width: 34px;
    height: 34px;
    opacity: 1;
    display: block;
  }
`;

const RockMenuWrapper = styled.div<{ isOpen: boolean }>`
  position: absolute;
  top: -25px;
  left: -26px;
  padding: 20px;
  pointer-events: ${(props) => (props.isOpen ? "auto" : "none")};
`;

const RockMenu = styled.div<{ isOpen: boolean; showLeaderboard: boolean }>`
  position: relative;
  background-color: #fff;
  border-radius: 10px;
  padding: 6px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  box-shadow: ${(props) => (props.isOpen ? "0 6px 20px rgba(0, 0, 0, 0.12)" : "none")};

  min-width: ${(props) => (props.showLeaderboard ? "230px" : "230px")};
  min-height: ${(props) => (props.showLeaderboard ? "69dvh" : "auto")};

  transform-origin: top left;
  opacity: ${(props) => (props.isOpen ? 1 : 0)};
  pointer-events: ${(props) => (props.isOpen ? "auto" : "none")};
  z-index: 1;

  @media (prefers-color-scheme: dark) {
    background-color: #1e1e1e;
  }
`;

const MenuTitle = styled.div`
  font-weight: bold;
  font-size: 16px;
  color: #333;
  margin: 10px 16px 0 53px;
  cursor: default;
  text-align: left;

  @media (prefers-color-scheme: dark) {
    color: #f5f5f5;
  }
`;

const CloseButton = styled.button`
  display: none;
  align-items: center;
  justify-content: center;
  background: #fbfbfb;
  border: none;
  color: #cecece;
  cursor: pointer;
  font-size: 18px;
  font-weight: 230;
  line-height: 18px;
  position: absolute;
  border-radius: 50%;
  height: 26px;
  width: 26px;
  right: 6px;
  top: 11px;
  padding: 0;

  @media (hover: none) {
    display: flex;
  }

  @media (prefers-color-scheme: dark) {
    color: #424242;
    background: #232323;
  }
`;

const IconRow = styled.div<{ hide: boolean }>`
  display: flex;
  justify-content: space-between;
  gap: 6px;
  margin-top: 12px;

  opacity: ${(props) => (props.hide ? 0 : 1)};
  height: ${(props) => (props.hide ? 0 : "auto")};
  overflow: hidden;
  transition: all 0.3s ease-in-out;

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
  background-color: #f9f9f9;

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      background-color: #f5f5f5;
    }
  }

  @media (prefers-color-scheme: dark) {
    background-color: #252525;

    @media (hover: hover) and (pointer: fine) {
      &:hover {
        background-color: #272727;
      }
    }
  }

  img {
    width: 24px;
    height: 24px;
  }
`;

const LinkRow = styled.div<{ hide: boolean }>`
  display: flex;
  justify-content: space-between;
  gap: 6px;
  align-items: center;
  opacity: ${(props) => (props.hide ? 0 : 1)};
  height: ${(props) => (props.hide ? 0 : "auto")};
  overflow: hidden;
  transition: all 0.3s ease-in-out;
`;

const LinkButton = styled.a`
  flex: 1;
  padding: 27px 0px;
  text-align: center;
  font-size: 0.55rem;
  border-radius: 8px;
  background-color: #f9f9f9;
  color: #333;
  text-decoration: none;
  cursor: pointer;

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      background-color: #f5f5f5;
    }
  }

  @media (prefers-color-scheme: dark) {
    background-color: #252525;
    color: #f5f5f5;

    @media (hover: hover) and (pointer: fine) {
      &:hover {
        background-color: #272727;
      }
    }
  }
`;

const LeaderboardContainer = styled.div<{ show: boolean }>`
  opacity: ${(props) => (props.show ? 1 : 0)};
  height: ${(props) => (props.show ? "calc(69dvh - 80px)" : 0)};
  overflow: hidden;
  margin-top: -6px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const LeaderboardTable = styled.table`
  margin-top: -10px;
  width: 100%;
  border-collapse: collapse;
  color: #333;

  @media (prefers-color-scheme: dark) {
    color: #f5f5f5;
  }

  th,
  td {
    padding: 10px;
    text-align: left;
    border-bottom: 1px solid #ddd;

    @media (prefers-color-scheme: dark) {
      border-bottom: 1px solid #333;
    }
  }
`;

const LoadingText = styled.div`
  text-align: center;
  font-size: 0.8rem;
  color: #777;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;

  @media (prefers-color-scheme: dark) {
    color: #afafaf;
  }
`;

const EASLink = styled.a`
  display: block;
  text-align: center;
  padding: 0 0;
  text-decoration: none;
  font-size: 0.8rem;

  &:hover {
    text-decoration: underline;
  }
`;

let getIsMenuOpen: () => boolean;

export function hasMainMenuPopupsVisible(): boolean {
  return getIsMenuOpen();
}

const MainMenu: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState<any>(null);

  getIsMenuOpen = () => isMenuOpen;

  const menuRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => {
    if (showLeaderboard) {
      setShowLeaderboard(false);
    } else {
      setIsMenuOpen(!isMenuOpen);
      if (!isMenuOpen) {
        setShowLeaderboard(false);
      }
    }
  };

  useEffect(() => {
    if (showLeaderboard) {
      setLeaderboardData(null);
      const timer = setTimeout(() => {
        setLeaderboardData([
          { player: "Player 1", games: 69, rating: 2400 },
          { player: "Player 2", games: 42, rating: 2350 },
          { player: "Player 3", games: 23, rating: 2300 },
        ]);
      }, 13000);
      return () => clearTimeout(timer);
    }
  }, [showLeaderboard]);

  useEffect(() => {
    const handleTapOutside = (event: any) => {
      if (isMenuOpen && menuRef.current && !menuRef.current.contains(event.target as Node)) {
        didDismissSomethingWithOutsideTapJustNow();
        setIsMenuOpen(false);
        setShowLeaderboard(false);
      }
    };

    document.addEventListener("touchstart", handleTapOutside);
    return () => {
      document.removeEventListener("touchstart", handleTapOutside);
    };
  }, [isMenuOpen]);

  return (
    <RockButtonContainer ref={menuRef}>
      <RockMenuWrapper
        isOpen={isMenuOpen}
        onMouseLeave={() => {
          if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
            setIsMenuOpen(false);
            setShowLeaderboard(false);
          }
        }}>
        <RockMenu isOpen={isMenuOpen} showLeaderboard={showLeaderboard}>
          <MenuTitle>Super Metal Mons</MenuTitle>
          <CloseButton
            onClick={() => {
              setIsMenuOpen(false);
              setShowLeaderboard(false);
            }}>
            ×
          </CloseButton>
          <IconRow hide={showLeaderboard}>
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
          <LinkRow hide={showLeaderboard}>
            <LinkButton href="https://opensea.io/collection/supermetalmons" target="_blank" rel="noopener noreferrer">
              Gen 1
            </LinkButton>
            <LinkButton href="https://opensea.io/collection/super-metal-mons-gen-2" target="_blank" rel="noopener noreferrer">
              Gen 2
            </LinkButton>
            <LinkButton href="https://www.supermetalmons.com/products/base-set1-kit1" target="_blank" rel="noopener noreferrer">
              IRL
            </LinkButton>
          </LinkRow>
          <LinkRow hide={showLeaderboard}>
            <LinkButton onClick={() => setShowLeaderboard(true)}>🥱 Onchain Ratings ☆</LinkButton>
          </LinkRow>
          <LeaderboardContainer show={showLeaderboard}>
            {leaderboardData ? (
              <LeaderboardTable>
                <thead>
                  <tr>
                    <th>Player</th>
                    <th>Games</th>
                    <th>Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboardData.map((row: any, index: number) => (
                    <tr key={index}>
                      <td>{row.player}</td>
                      <td>{row.games}</td>
                      <td>{row.rating}</td>
                    </tr>
                  ))}
                </tbody>
              </LeaderboardTable>
            ) : (
              <LoadingText>UPDATING...</LoadingText>
            )}
            <EASLink href="https://base.easscan.org/schema/view/0x5c6e798cbb817442fa075e01b65d5d65d3ac35c2b05c1306e8771a1c8a3adb32" target="_blank" rel="noopener noreferrer">
              View on EAS Explorer
            </EASLink>
          </LeaderboardContainer>
        </RockMenu>
      </RockMenuWrapper>
      <RockButton
        {...(isMobile
          ? {
              onTouchStart: (e) => {
                toggleMenu();
              },
            }
          : {
              onClick: (e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleMenu();
              },
              onMouseEnter: () => setIsMenuOpen(true),
            })}>
        <img src={logoBase64} alt="Rock" />
      </RockButton>
    </RockButtonContainer>
  );
};

export default MainMenu;
