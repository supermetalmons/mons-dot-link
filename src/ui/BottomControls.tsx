import React, { useRef, useEffect, useState } from "react";
import styled from "styled-components";
import { FaUndo, FaVolumeUp, FaVolumeMute, FaFlag, FaCommentAlt, FaMusic, FaStop, FaTrophy } from "react-icons/fa";
import { BottomControlsActionsInterface } from "./BottomControlsActions";
import AnimatedHourglassButton from "./AnimatedHourglassButton";
import { didClickStartTimerButton, didClickClaimVictoryByTimerButton, didClickPrimaryActionButton } from "../game/gameController";
import { didClickInviteButton } from "../connection/connection";

export enum PrimaryActionType {
  None = "none",
  JoinGame = "joinGame",
  Rematch = "rematch",
}

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

export const ControlButton = styled.button<{ disabled?: boolean }>`
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

const BottomPillButton = styled.button<{ isBlue?: boolean }>`
  background-color: ${(props) => (props.isBlue ? "#0074D9" : "#2ecc40")};
  color: white;
  border: none;
  border-radius: 20px;
  padding: 8px 16px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease;

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      background-color: ${(props) => (props.isBlue ? "#0063B8" : "#29b739")};
    }
  }

  &:active {
    background-color: ${(props) => (props.isBlue ? "#005299" : "#25a233")};
  }

  @media (prefers-color-scheme: dark) {
    background-color: ${(props) => (props.isBlue ? "#005299" : "#25a233")};

    @media (hover: hover) and (pointer: fine) {
      &:hover {
        background-color: ${(props) => (props.isBlue ? "#004785" : "#208c2c")};
      }
    }

    &:active {
      background-color: ${(props) => (props.isBlue ? "#003d71" : "#1b7825")};
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

let showVoiceReactionButton: () => void;
let showResignButton: () => void;
let setUndoVisible: (visible: boolean) => void;
let setUndoEnabled: (enabled: boolean) => void;
let disableAndHideUndoResignAndTimerControls: () => void;
let hideTimerButtons: () => void;
let showTimerButtonProgressing: (currentProgress: number, target: number, enableWhenTargetReached: boolean) => void;
let hideReactionPicker: () => void;
let toggleReactionPicker: () => void;
let enableTimerVictoryClaim: () => void;
let showPrimaryAction: (action: PrimaryActionType) => void;

const BottomControls: React.FC<BottomControlsProps> = ({ actions }) => {
  // TODO: refactor
  const [isInviteLoading, setIsInviteLoading] = useState(false);
  const [didCreateInvite, setDidCreateInvite] = useState(false);

  const [isStartTimerVisible, setIsStartTimerVisible] = useState(false);
  const [primaryAction, setPrimaryAction] = useState<PrimaryActionType>(PrimaryActionType.None);
  const [isUndoButtonVisible, setIsUndoButtonVisible] = useState(false);
  const [isResignButtonVisible, setIsResignButtonVisible] = useState(false);
  const [isVoiceReactionButtonVisible, setIsVoiceReactionButtonVisible] = useState(false);
  const [isReactionPickerVisible, setIsReactionPickerVisible] = useState(false);
  const [isResignConfirmVisible, setIsResignConfirmVisible] = useState(false);
  const [isTimerButtonDisabled, setIsTimerButtonDisabled] = useState(true);
  const [isClaimVictoryVisible, setIsClaimVictoryVisible] = useState(false);
  const [isClaimVictoryButtonDisabled, setIsClaimVictoryButtonDisabled] = useState(false);
  const [timerConfig, setTimerConfig] = useState({ duration: 90, progress: 0, requestDate: Date.now() });
  const { isMuted, handleUndo, handleMuteToggle, handleResign, handleReactionSelect, setIsUndoDisabled, isVoiceReactionDisabled, isUndoDisabled, isResignDisabled, isMusicPlaying, handleMusicToggle } = actions;

  const pickerRef = useRef<HTMLDivElement>(null);
  const voiceReactionButtonRef = useRef<HTMLButtonElement>(null);
  const resignButtonRef = useRef<HTMLButtonElement>(null);
  const resignConfirmRef = useRef<HTMLDivElement>(null);
  const hourglassEnableTimeoutRef = useRef<NodeJS.Timeout>();

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
    return () => {
      if (hourglassEnableTimeoutRef.current) {
        clearTimeout(hourglassEnableTimeoutRef.current);
      }
    };
  }, []);

  // TODO: refactor and prettify
  const handleInviteClick = () => {
    setIsInviteLoading(true);
    didClickInviteButton((result: boolean) => {
      if (result) {
        setIsInviteLoading(false);
        setDidCreateInvite(true);
        // TODO: handle invite copy here too
      } else {
        setIsInviteLoading(false);
      }
    });
  };

  showVoiceReactionButton = () => {
    setIsVoiceReactionButtonVisible(true);
  };

  showResignButton = () => {
    setIsResignButtonVisible(true);
  };

  hideTimerButtons = () => {
    if (hourglassEnableTimeoutRef.current) {
      clearTimeout(hourglassEnableTimeoutRef.current);
      hourglassEnableTimeoutRef.current = undefined;
    }
    setIsTimerButtonDisabled(true);
    setIsStartTimerVisible(false);
    setIsClaimVictoryVisible(false);
  };

  showTimerButtonProgressing = (currentProgress: number, target: number, enableWhenTargetReached: boolean) => {
    if (hourglassEnableTimeoutRef.current) {
      clearTimeout(hourglassEnableTimeoutRef.current);
      hourglassEnableTimeoutRef.current = undefined;
    }

    setIsTimerButtonDisabled(true);
    setIsStartTimerVisible(true);
    setIsUndoButtonVisible(false);
    setIsClaimVictoryVisible(false);
    setTimerConfig({ duration: target, progress: currentProgress, requestDate: Date.now() });

    if (enableWhenTargetReached) {
      const timeUntilTarget = (target - currentProgress) * 1000;
      hourglassEnableTimeoutRef.current = setTimeout(() => {
        setIsTimerButtonDisabled(false);
        hourglassEnableTimeoutRef.current = undefined;
      }, timeUntilTarget);
    }
  };

  enableTimerVictoryClaim = () => {
    setIsClaimVictoryVisible(true);
    setIsUndoButtonVisible(false);
    setIsStartTimerVisible(false);
    setIsClaimVictoryButtonDisabled(false);
  };

  setUndoVisible = (visible: boolean) => {
    setIsUndoButtonVisible(visible);
  };

  setUndoEnabled = (enabled: boolean) => {
    setIsUndoDisabled(!enabled);
  };

  showPrimaryAction = (action: PrimaryActionType) => {
    setPrimaryAction(action);
  };

  disableAndHideUndoResignAndTimerControls = () => {
    setIsUndoDisabled(true);
    setIsUndoButtonVisible(false);
    setIsResignButtonVisible(false);
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

  const handlePrimaryActionClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    didClickPrimaryActionButton(primaryAction);
    setPrimaryAction(PrimaryActionType.None);
  };

  const getPrimaryActionButtonText = () => {
    switch (primaryAction) {
      case PrimaryActionType.JoinGame:
        return "Join Game";
      case PrimaryActionType.Rematch:
        return "Play Again";
      default:
        return "";
    }
  };

  return (
    <ControlsContainer>
      <BottomPillButton onClick={handleInviteClick} isBlue={true} disabled={isInviteLoading}>
        {isInviteLoading ? "Creating a Link..." : didCreateInvite ? "🔗 Copy Game Link" : "✉️ New Game Link"}
      </BottomPillButton>
      {/* <BottomPillButton onClick={handlePrimaryActionClick}>{"⚡️ Automatch"}</BottomPillButton> */}
      {primaryAction !== PrimaryActionType.None && <BottomPillButton onClick={handlePrimaryActionClick}>{getPrimaryActionButtonText()}</BottomPillButton>}
      {isClaimVictoryVisible && (
        <ControlButton onClick={handleClaimVictoryClick} aria-label="Claim Victory" disabled={isClaimVictoryButtonDisabled}>
          <FaTrophy />
        </ControlButton>
      )}
      {isStartTimerVisible && <AnimatedHourglassButton config={timerConfig} onClick={handleTimerClick} disabled={isTimerButtonDisabled} />}
      {isUndoButtonVisible && (
        <ControlButton onClick={handleUndo} aria-label="Undo" disabled={isUndoDisabled}>
          <FaUndo />
        </ControlButton>
      )}
      {isResignButtonVisible && (
        <ControlButton onClick={handleResignClick} aria-label="Resign" ref={resignButtonRef} disabled={isResignDisabled}>
          <FaFlag />
        </ControlButton>
      )}
      {isVoiceReactionButtonVisible && (
        <ControlButton onClick={toggleReactionPicker} aria-label="Voice Reaction" ref={voiceReactionButtonRef} disabled={isVoiceReactionDisabled}>
          <FaCommentAlt />
        </ControlButton>
      )}
      <ControlButton onClick={handleMusicToggle} aria-label={isMusicPlaying ? "Stop Music" : "Play Music"}>
        {isMusicPlaying ? <FaStop /> : <FaMusic />}
      </ControlButton>
      <ControlButton onClick={handleMuteToggle} aria-label={isMuted ? "Unmute" : "Mute"}>
        {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
      </ControlButton>
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

export { BottomControls as default, showVoiceReactionButton, showResignButton, setUndoEnabled, setUndoVisible, hideTimerButtons, showTimerButtonProgressing, disableAndHideUndoResignAndTimerControls, hideReactionPicker, enableTimerVictoryClaim, showPrimaryAction };
