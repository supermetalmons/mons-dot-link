import React, { useRef, useEffect, useState } from "react";
import styled from "styled-components";
import { FaUndo, FaVolumeUp, FaVolumeMute, FaFlag, FaCommentAlt, FaMusic, FaStop, FaHourglass, FaTrophy } from "react-icons/fa";
import { BottomControlsActionsInterface } from "./BottomControlsActions";
import { didClickStartTimerButton, didClickClaimVictoryByTimerButton, didClickJoinGameButton } from "../game/gameController";

let latestModalOutsideTapDismissDate = Date.now();

export function didDismissSomethingWithOutsideTapJustNow() {
  latestModalOutsideTapDismissDate = Date.now();
}

export function didNotDismissAnythingWithOutsideTapJustNow(): boolean {
  let delta = Date.now() - latestModalOutsideTapDismissDate;
  return delta >= 42;
}

interface BottomControlsProps {
  actions: BottomControlsActionsInterface;
}

const ControlsContainer = styled.div`
  position: fixed;
  bottom: 10px;
  right: 10px;
  display: flex;
  gap: 8px;
`;

const ControlButton = styled.button<{ disabled?: boolean }>`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #f0f0f0;
  border: none;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: ${(props) => (props.disabled ? "default" : "pointer")};
  transition: background-color 0.3s ease;
  -webkit-tap-highlight-color: transparent;

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      background-color: ${(props) => (props.disabled ? "#f0f0f0" : "#e0e0e0")};
    }
  }

  &:active {
    background-color: ${(props) => (props.disabled ? "#f0f0f0" : "#d0d0d0")};
  }

  svg {
    width: 16px;
    height: 16px;
    color: ${(props) => (props.disabled ? "#aaa" : "#333")};
  }

  @media (prefers-color-scheme: dark) {
    background-color: #333;

    @media (hover: hover) and (pointer: fine) {
      &:hover {
        background-color: ${(props) => (props.disabled ? "#333" : "#444")};
      }
    }

    &:active {
      background-color: ${(props) => (props.disabled ? "#333" : "#555")};
    }

    svg {
      color: ${(props) => (props.disabled ? "#777" : "#f0f0f0")};
    }
  }
`;

const PrimaryGameNavigationButton = styled.button`
  background-color: #2ecc40;
  color: white;
  border: none;
  border-radius: 20px;
  padding: 8px 16px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease;

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      background-color: #29b739;
    }
  }

  @media (prefers-color-scheme: dark) {
    background-color: #25a233;

    @media (hover: hover) and (pointer: fine) {
      &:hover {
        background-color: #208c2c;
      }
    }
  }
`;

const ReactionPicker = styled.div`
  position: absolute;
  bottom: 40px;
  right: 63px;
  background-color: #f0f0f0;
  border-radius: 8px;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;

  @media (prefers-color-scheme: dark) {
    background-color: #333;
  }
`;

const ReactionButton = styled.button`
  background: none;
  border: none;
  padding: 4px 8px;
  cursor: pointer;
  text-align: left;
  color: #333;

  &:hover {
    background-color: #e0e0e0;
  }

  @media (prefers-color-scheme: dark) {
    color: #f0f0f0;

    &:hover {
      background-color: #444;
    }
  }
`;

const ResignConfirmation = styled(ReactionPicker)`
  right: 90px;
  bottom: 40px;
  padding: 12px;
`;

const ResignButton = styled(ReactionButton)`
  background-color: #ff4136;
  color: white;
  border-radius: 4px;
  padding: 8px 16px;
  font-weight: bold;

  &:hover {
    background-color: #e60000;
  }

  @media (prefers-color-scheme: dark) {
    background-color: #cc0000;

    &:hover {
      background-color: #b30000;
    }
  }
`;

let showGameRelatedBottomControls: () => void;
let setUndoEnabled: (enabled: boolean) => void;
let setStartTimerVisible: (visible: boolean) => void;
let disableUndoResignAndTimerControls: () => void;
let hideReactionPicker: () => void;
let toggleReactionPicker: () => void;
let enableTimerVictoryClaim: () => void;
let showJoinButton: () => void;

const BottomControls: React.FC<BottomControlsProps> = ({ actions }) => {
  const [isStartTimerVisible, setIsStartTimerVisible] = useState(false);
  const [showPrimaryGameNavigationButton, setShowPrimaryGameNavigationButton] = useState(false);
  const [showOtherControls, setShowOtherControls] = useState(false);
  const [isReactionPickerVisible, setIsReactionPickerVisible] = useState(false);
  const [isResignConfirmVisible, setIsResignConfirmVisible] = useState(false);
  const [isTimerButtonDisabled, setIsTimerButtonDisabled] = useState(true);
  const [isClaimVictoryVisible, setIsClaimVictoryVisible] = useState(false);
  const [isClaimVictoryButtonDisabled, setIsClaimVictoryButtonDisabled] = useState(false);
  const { isMuted, handleUndo, handleMuteToggle, handleResign, handleReactionSelect, setIsUndoDisabled, isVoiceReactionDisabled, isUndoDisabled, isResignDisabled, isMusicPlaying, handleMusicToggle } = actions;

  const pickerRef = useRef<HTMLDivElement>(null);
  const voiceReactionButtonRef = useRef<HTMLButtonElement>(null);
  const resignButtonRef = useRef<HTMLButtonElement>(null);
  const resignConfirmRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      event.stopPropagation();
      if ((pickerRef.current && !pickerRef.current.contains(event.target as Node) && !voiceReactionButtonRef.current?.contains(event.target as Node)) || (resignConfirmRef.current && !resignConfirmRef.current.contains(event.target as Node) && !resignButtonRef.current?.contains(event.target as Node))) {
        didDismissSomethingWithOutsideTapJustNow();
        setIsReactionPickerVisible(false);
        setIsResignConfirmVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    let timerEnableTimeout: NodeJS.Timeout | null = null;
    setIsTimerButtonDisabled(true);
    if (isStartTimerVisible) {
      timerEnableTimeout = setTimeout(() => {
        setIsTimerButtonDisabled(false);
      }, 90000);
    } else {
      if (timerEnableTimeout) {
        clearTimeout(timerEnableTimeout);
      }
    }
    return () => {
      if (timerEnableTimeout) {
        clearTimeout(timerEnableTimeout);
      }
    };
  }, [isStartTimerVisible]);

  showGameRelatedBottomControls = () => {
    setShowOtherControls(true);
  };

  setStartTimerVisible = (visible: boolean) => {
    setIsStartTimerVisible(visible);
    setIsClaimVictoryVisible(false);
  };

  enableTimerVictoryClaim = () => {
    setIsClaimVictoryVisible(true);
    setIsStartTimerVisible(false);
    setIsClaimVictoryButtonDisabled(false);
  };

  setUndoEnabled = (enabled: boolean) => {
    setIsUndoDisabled(!enabled);
  };

  showJoinButton = () => {
    setShowPrimaryGameNavigationButton(true);
  };

  disableUndoResignAndTimerControls = () => {
    setIsUndoDisabled(true);
    setIsStartTimerVisible(false);
    setIsClaimVictoryVisible(false);
    actions.setIsResignDisabled(true);
  };

  hideReactionPicker = () => {
    setIsReactionPickerVisible(false);
  };

  toggleReactionPicker = () => {
    setIsReactionPickerVisible((prev) => !prev);
  };

  const handleResignClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setIsResignConfirmVisible(!isResignConfirmVisible);
  };

  const handleTimerClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    didClickStartTimerButton();
    setIsTimerButtonDisabled(true);
  };

  const handleClaimVictoryClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    didClickClaimVictoryByTimerButton();
    setIsClaimVictoryButtonDisabled(true);
  };

  const handleConfirmResign = () => {
    const event = new MouseEvent("click") as unknown as React.MouseEvent<HTMLButtonElement>;
    setIsResignConfirmVisible(false);
    handleResign(event);
  };

  const handlePrimaryGameNavigationButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setShowPrimaryGameNavigationButton(false);
    didClickJoinGameButton();
  };

  return (
    <ControlsContainer>
      {isStartTimerVisible || isClaimVictoryVisible ? (
        <>
          {isClaimVictoryVisible && (
            <ControlButton onClick={handleClaimVictoryClick} aria-label="Claim Victory" disabled={isClaimVictoryButtonDisabled}>
              <FaTrophy />
            </ControlButton>
          )}
          {isStartTimerVisible && (
            <ControlButton onClick={handleTimerClick} aria-label="Timer" disabled={isTimerButtonDisabled}>
              <FaHourglass />
            </ControlButton>
          )}
        </>
      ) : (
        <ControlButton onClick={handleUndo} aria-label="Undo" disabled={isUndoDisabled}>
          <FaUndo />
        </ControlButton>
      )}
      {showOtherControls && (
        <>
          <ControlButton onClick={handleResignClick} aria-label="Resign" ref={resignButtonRef} disabled={isResignDisabled}>
            <FaFlag />
          </ControlButton>
          <ControlButton onClick={toggleReactionPicker} aria-label="Voice Reaction" ref={voiceReactionButtonRef} disabled={isVoiceReactionDisabled}>
            <FaCommentAlt />
          </ControlButton>
        </>
      )}
      <ControlButton onClick={handleMusicToggle} aria-label={isMusicPlaying ? "Stop Music" : "Play Music"}>
        {isMusicPlaying ? <FaStop /> : <FaMusic />}
      </ControlButton>
      <ControlButton onClick={handleMuteToggle} aria-label={isMuted ? "Unmute" : "Mute"}>
        {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
      </ControlButton>
      {showPrimaryGameNavigationButton && (<PrimaryGameNavigationButton onClick={handlePrimaryGameNavigationButtonClick}>Join Game</PrimaryGameNavigationButton>)}
      {isReactionPickerVisible && (
        <ReactionPicker ref={pickerRef}>
          <ReactionButton onClick={() => handleReactionSelect("yo")}>yo</ReactionButton>
          <ReactionButton onClick={() => handleReactionSelect("wahoo")}>wahoo</ReactionButton>
          <ReactionButton onClick={() => handleReactionSelect("drop")}>drop</ReactionButton>
          <ReactionButton onClick={() => handleReactionSelect("slurp")}>slurp</ReactionButton>
          <ReactionButton onClick={() => handleReactionSelect("gg")}>gg</ReactionButton>
        </ReactionPicker>
      )}
      {isResignConfirmVisible && (
        <ResignConfirmation ref={resignConfirmRef}>
          <ResignButton onClick={handleConfirmResign}>Resign</ResignButton>
        </ResignConfirmation>
      )}
    </ControlsContainer>
  );
};

export { BottomControls as default, showGameRelatedBottomControls, setUndoEnabled, setStartTimerVisible, disableUndoResignAndTimerControls, hideReactionPicker, enableTimerVictoryClaim, showJoinButton };
