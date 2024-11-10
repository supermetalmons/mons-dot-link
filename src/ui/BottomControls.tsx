import React, { useRef, useEffect, useState } from "react";
import styled from "styled-components";
import { FaUndo, FaVolumeUp, FaVolumeMute, FaFlag, FaCommentAlt, FaMusic, FaStop, FaTrophy, FaHome, FaRobot } from "react-icons/fa";
import { BottomControlsActionsInterface } from "./BottomControlsActions";
import AnimatedHourglassButton from "./AnimatedHourglassButton";
import { didClickStartTimerButton, didClickClaimVictoryByTimerButton, didClickPrimaryActionButton, didClickHomeButton, didClickInviteActionButtonBeforeThereIsInviteReady, didClickAutomoveButton, didClickAttestVictoryButton, didClickAutomatchButton } from "../game/gameController";
import { didClickInviteButton } from "../connection/connection";
import { isMobile } from "../utils/misc";

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
  left: 10px;
  display: flex;
  gap: 8px;
  justify-content: flex-end;

  @media screen and (max-width: 360px) {
    gap: 6px;
    right: 6px;
    left: 6px;
  }
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

const BottomPillButton = styled.button<{ isPink?: boolean; isBlue?: boolean; isViewOnly?: boolean; disabled?: boolean }>`
  background-color: ${(props) => (props.isViewOnly ? "#f0f0f0" : props.isBlue ? "#0074D9" : props.isPink && props.disabled ? "#ffd1dc" : props.isPink ? "#ff69b4" : "#2ecc40")};
  height: 32px;
  color: ${(props) => (props.isPink && props.disabled ? "#fff" : props.isViewOnly ? "#aaa" : "white")};
  border: none;
  border-radius: 20px;
  padding: 0px 16px;
  @media screen and (max-width: 300pt) {
    padding: 0px 10px;
  }
  @media screen and (max-width: 420px) {
    padding: 0px 10px;
  }
  @media screen and (max-width: 295pt) {
    padding: 0px 8px;
  }
  @media screen and (max-width: 375px) {
    font-size: 0.74rem;
  }
  @media screen and (max-width: 320px) {
    font-size: 0.63rem;
  }
  font-weight: bold;
  cursor: ${(props) => (props.isViewOnly || (props.isPink && props.disabled) ? "default" : "pointer")};
  transition: background-color 0.3s ease;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      background-color: ${(props) => (props.isViewOnly ? "#f0f0f0" : props.isBlue ? "#0063B8" : props.isPink && props.disabled ? "#ffd1dc" : props.isPink ? "#ff4da6" : "#29b739")};
    }
  }

  &:active {
    background-color: ${(props) => (props.isViewOnly ? "#f0f0f0" : props.isBlue ? "#005299" : props.isPink && props.disabled ? "#ffd1dc" : props.isPink ? "#d1477b" : "#25a233")};
  }

  @media (prefers-color-scheme: dark) {
    color: ${(props) => (props.isPink && props.disabled ? "rgba(204, 204, 204, 0.77)" : props.isViewOnly ? "#777" : "white")};

    background-color: ${(props) => (props.isViewOnly ? "#333" : props.isBlue ? "#005299" : props.isPink && props.disabled ? "#664d57" : props.isPink ? "#ff4da6" : "#25a233")};

    @media (hover: hover) and (pointer: fine) {
      &:hover {
        background-color: ${(props) => (props.isViewOnly ? "#333" : props.isBlue ? "#0063B8" : props.isPink && props.disabled ? "#664d57" : props.isPink ? "#ff69b4" : "#29b739")};
      }
    }

    &:active {
      background-color: ${(props) => (props.isViewOnly ? "#333" : props.isBlue ? "#0074D9" : props.isPink && props.disabled ? "#664d57" : props.isPink ? "#ff85c0" : "#2ecc40")};
    }
  }
`;

const ReactionPicker = styled.div<{ offsetToTheRight?: boolean }>`
  position: absolute;
  bottom: 40px;
  right: ${(props) => (props.offsetToTheRight ? "100px" : "142px")};
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
  right: 88px;
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

let hasBottomPopupsVisible: () => boolean;
let showVoiceReactionButton: () => void;
let showResignButton: () => void;
let setInviteLinkActionVisible: (visible: boolean) => void;
let setAutomatchEnabled: (enabled: boolean) => void;
let setAutomatchVisible: (visible: boolean) => void;
let setAutomatchWaitingState: (waiting: boolean) => void;

let setAttestVictoryEnabled: (enabled: boolean) => void;
let setAttestVictoryVisible: (visible: boolean) => void;

let showButtonForTx: (hash: string) => void;
let setHomeVisible: (visible: boolean) => void;
let setUndoVisible: (visible: boolean) => void;
let setAutomoveActionEnabled: (enabled: boolean) => void;
let setAutomoveActionVisible: (visible: boolean) => void;
let setWatchOnlyVisible: (visible: boolean) => void;
let setUndoEnabled: (enabled: boolean) => void;
let disableAndHideUndoResignAndTimerControls: () => void;
let setIsReadyToCopyExistingInviteLink: () => void;
let hideTimerButtons: () => void;
let showTimerButtonProgressing: (currentProgress: number, target: number, enableWhenTargetReached: boolean) => void;
let hideReactionPicker: () => void;
let toggleReactionPicker: () => void;
let enableTimerVictoryClaim: () => void;
let showPrimaryAction: (action: PrimaryActionType) => void;

const BottomControls: React.FC<BottomControlsProps> = ({ actions }) => {
  const [isAttestVictoryButtonEnabled, setIsAttestVictoryButtonEnabled] = useState(true);
  const [isAttestVictoryButtonVisible, setIsAttestVictoryButtonVisible] = useState(false);
  const [isInviteLinkButtonVisible, setIsInviteLinkButtonVisible] = useState(false);
  const [isAutomatchButtonVisible, setIsAutomatchButtonVisible] = useState(false);
  const [isAutomatchButtonEnabled, setIsAutomatchButtonEnabled] = useState(true);
  const [isWatchOnlyIndicatorVisible, setIsWatchOnlyIndicatorVisible] = useState(false);
  const [isHomeButtonVisible, setIsHomeButtonVisible] = useState(false);
  const [isInviteLoading, setIsInviteLoading] = useState(false);
  const [didCreateInvite, setDidCreateInvite] = useState(false);
  const [automatchButtonTmpState, setAutomatchButtonTmpState] = useState(false);
  const [inviteCopiedTmpState, setInviteCopiedTmpState] = useState(false);

  const [txHash, setTxHash] = useState("");
  const [isStartTimerVisible, setIsStartTimerVisible] = useState(false);
  const [primaryAction, setPrimaryAction] = useState<PrimaryActionType>(PrimaryActionType.None);
  const [isUndoButtonVisible, setIsUndoButtonVisible] = useState(false);
  const [isAutomoveButtonEnabled, setIsAutomoveButtonEnabled] = useState(true);
  const [isAutomoveButtonVisible, setIsAutomoveButtonVisible] = useState(false);
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

  const handleAttestVictoryClick = () => {
    didClickAttestVictoryButton();
    setIsAttestVictoryButtonEnabled(false);
  };

  const didClickTxHashButton = () => {
    window.open(`https://basescan.org/tx/${txHash}`, "_blank", "noopener,noreferrer");
  };

  const handleInviteClick = () => {
    if (!didCreateInvite) {
      didClickInviteActionButtonBeforeThereIsInviteReady();
    }
    setIsInviteLoading(true);
    didClickInviteButton((result: boolean) => {
      if (result) {
        if (didCreateInvite) {
          setInviteCopiedTmpState(true);
          setTimeout(() => {
            setInviteCopiedTmpState(false);
          }, 699);
        }
        setIsInviteLoading(false);
        setDidCreateInvite(true);
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

  showButtonForTx = (hash: string) => {
    setTxHash(hash);
  };

  setIsReadyToCopyExistingInviteLink = () => {
    setDidCreateInvite(true);
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

  hasBottomPopupsVisible = () => {
    return isReactionPickerVisible || isResignConfirmVisible;
  };

  enableTimerVictoryClaim = () => {
    setIsClaimVictoryVisible(true);
    setIsUndoButtonVisible(false);
    setIsStartTimerVisible(false);
    setIsClaimVictoryButtonDisabled(false);
  };

  setInviteLinkActionVisible = (visible: boolean) => {
    setIsInviteLinkButtonVisible(visible);
  };

  setAutomatchWaitingState = (waiting: boolean) => {
    if (waiting) {
      setAutomatchVisible(true);
      setAutomatchEnabled(false);
      setAutomatchButtonTmpState(true);
    }
  };

  setAttestVictoryVisible = (visible: boolean) => {
    setIsAttestVictoryButtonVisible(visible);
  };

  setAttestVictoryEnabled = (enabled: boolean) => {
    setIsAttestVictoryButtonEnabled(enabled);
  };

  setAutomatchEnabled = (enabled: boolean) => {
    setAutomatchButtonTmpState(false);
    setIsAutomatchButtonEnabled(enabled);
  };

  setAutomatchVisible = (visible: boolean) => {
    setIsAutomatchButtonVisible(visible);
  };

  setHomeVisible = (visible: boolean) => {
    setIsHomeButtonVisible(visible);
  };

  setAutomoveActionEnabled = (enabled: boolean) => {
    setIsAutomoveButtonEnabled(enabled);
  };

  setAutomoveActionVisible = (visible: boolean) => {
    setIsAutomoveButtonVisible(visible);
  };

  setUndoVisible = (visible: boolean) => {
    setIsUndoButtonVisible(visible);
  };

  setWatchOnlyVisible = (visible: boolean) => {
    setIsWatchOnlyIndicatorVisible(visible);
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
    if (!isReactionPickerVisible) {
      if (isVoiceReactionDisabled) {
        return;
      }
      setIsResignConfirmVisible(false);
    }
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

  const handleHomeClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    didClickHomeButton();
  };

  const handleAutomoveClick = (event: React.MouseEvent<HTMLButtonElement> | React.TouchEvent<HTMLButtonElement>) => {
    if (!isAutomoveButtonEnabled) return;
    setAutomoveActionEnabled(false);
    didClickAutomoveButton();
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

  const handleAutomatchClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    didClickAutomatchButton();
    setAutomatchEnabled(false);
    setAutomatchButtonTmpState(true);
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
      {isAutomoveButtonVisible && (
        <ControlButton onClick={!isMobile ? handleAutomoveClick : undefined} onTouchStart={isMobile ? handleAutomoveClick : undefined} aria-label="Bot" disabled={!isAutomoveButtonEnabled}>
          <FaRobot />
        </ControlButton>
      )}
      {txHash !== "" && (
        <BottomPillButton onClick={didClickTxHashButton} isBlue={true}>
          {"↗️ View on Explorer"}
        </BottomPillButton>
      )}
      {isAttestVictoryButtonVisible && (
        <BottomPillButton onClick={handleAttestVictoryClick} isPink={true} disabled={!isAttestVictoryButtonEnabled}>
          {"🎉 Attest Victory"}
        </BottomPillButton>
      )}
      {isWatchOnlyIndicatorVisible && (
        <BottomPillButton isViewOnly={true} disabled={true}>
          {"📺 Spectating"}
        </BottomPillButton>
      )}
      {isInviteLinkButtonVisible && (
        <BottomPillButton onClick={handleInviteClick} isBlue={true} disabled={isInviteLoading}>
          {inviteCopiedTmpState ? "Link is copied" : isInviteLoading ? "Creating a Link..." : didCreateInvite ? "🔗 Copy Link" : "✉️ New Link Game"}
        </BottomPillButton>
      )}
      {isAutomatchButtonVisible && (
        <BottomPillButton onClick={handleAutomatchClick} isViewOnly={automatchButtonTmpState} disabled={!isAutomatchButtonEnabled}>
          {automatchButtonTmpState ? (
            "🥁 Automatching..."
          ) : (
            <>
              👽 <span style={{ textDecoration: "underline" }}>Automatch</span>
            </>
          )}
        </BottomPillButton>
      )}
      {primaryAction !== PrimaryActionType.None && <BottomPillButton onClick={handlePrimaryActionClick}>{getPrimaryActionButtonText()}</BottomPillButton>}
      {isClaimVictoryVisible && (
        <ControlButton onClick={handleClaimVictoryClick} aria-label="Claim Victory" disabled={isClaimVictoryButtonDisabled}>
          <FaTrophy />
        </ControlButton>
      )}
      {isStartTimerVisible && <AnimatedHourglassButton config={timerConfig} onClick={handleTimerClick} disabled={isTimerButtonDisabled} />}
      {isUndoButtonVisible && (
        <ControlButton onClick={!isMobile ? handleUndo : undefined} onTouchStart={isMobile ? handleUndo : undefined} aria-label="Undo" disabled={isUndoDisabled}>
          <FaUndo />
        </ControlButton>
      )}
      {isVoiceReactionButtonVisible && (
        <ControlButton onClick={!isMobile ? toggleReactionPicker : undefined} onTouchStart={isMobile ? toggleReactionPicker : undefined} aria-label="Voice Reaction" ref={voiceReactionButtonRef} disabled={isVoiceReactionDisabled}>
          <FaCommentAlt />
        </ControlButton>
      )}
      {isResignButtonVisible && (
        <ControlButton onClick={handleResignClick} aria-label="Resign" ref={resignButtonRef} disabled={isResignDisabled}>
          <FaFlag />
        </ControlButton>
      )}
      {isHomeButtonVisible && (
        <ControlButton onClick={handleHomeClick} aria-label="Home">
          <FaHome />
        </ControlButton>
      )}
      <ControlButton onClick={handleMusicToggle} aria-label={isMusicPlaying ? "Stop Music" : "Play Music"}>
        {isMusicPlaying ? <FaStop /> : <FaMusic />}
      </ControlButton>
      <ControlButton onClick={handleMuteToggle} aria-label={isMuted ? "Unmute" : "Mute"}>
        {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
      </ControlButton>
      {isReactionPickerVisible && (
        <ReactionPicker ref={pickerRef} offsetToTheRight={!isResignButtonVisible}>
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

export { BottomControls as default, setAutomatchWaitingState, showButtonForTx, setAttestVictoryEnabled, setAutomatchEnabled, setAttestVictoryVisible, hasBottomPopupsVisible, setWatchOnlyVisible, setAutomoveActionEnabled, setAutomoveActionVisible, setIsReadyToCopyExistingInviteLink, showVoiceReactionButton, setInviteLinkActionVisible, setAutomatchVisible, showResignButton, setUndoEnabled, setUndoVisible, setHomeVisible, hideTimerButtons, showTimerButtonProgressing, disableAndHideUndoResignAndTimerControls, hideReactionPicker, enableTimerVictoryClaim, showPrimaryAction };
