import React, { useRef, useEffect, useState } from "react";
import styled from "styled-components";
import { FaUndo, FaVolumeUp, FaVolumeMute, FaFlag, FaCommentAlt, FaMusic, FaStop } from "react-icons/fa";
import { BottomControlsActionsInterface } from "./BottomControlsActions";

let latestModalOutsideTapDismissDate = Date.now();

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

let showGameRelatedBottomControls: () => void;
let setUndoEnabled: (enabled: boolean) => void;

const BottomControls: React.FC<BottomControlsProps> = ({ actions }) => {
  const [showOtherControls, setShowOtherControls] = useState(false);
  const { 
    isMuted, 
    isReactionPickerVisible, 
    handleUndo, 
    handleMuteToggle, 
    handleResign, 
    handleVoiceReaction, 
    handleReactionSelect, 
    hideReactionPicker, 
    setIsUndoDisabled, 
    isVoiceReactionDisabled, 
    isUndoDisabled,
    isMusicPlaying,
    handleMusicToggle
  } = actions;

  const pickerRef = useRef<HTMLDivElement>(null);
  const voiceReactionButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      event.stopPropagation();
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node) && !voiceReactionButtonRef.current?.contains(event.target as Node)) {
        latestModalOutsideTapDismissDate = Date.now();
        hideReactionPicker();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [hideReactionPicker]);

  showGameRelatedBottomControls = () => {
    setShowOtherControls(true);
  };

  setUndoEnabled = (enabled: boolean) => {
    setIsUndoDisabled(!enabled);
  };

  return (
    <ControlsContainer>
      <ControlButton onClick={handleUndo} aria-label="Undo" disabled={isUndoDisabled}>
        <FaUndo />
      </ControlButton>
      {showOtherControls && (
        <>
          <ControlButton onClick={handleResign} aria-label="Resign" disabled={true}>
            <FaFlag />
          </ControlButton>
          <ControlButton onClick={handleVoiceReaction} aria-label="Voice Reaction" ref={voiceReactionButtonRef} disabled={isVoiceReactionDisabled}>
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
      {isReactionPickerVisible && (
        <ReactionPicker ref={pickerRef}>
          <ReactionButton onClick={() => handleReactionSelect("yo")}>yo</ReactionButton>
          <ReactionButton onClick={() => handleReactionSelect("wahoo")}>wahoo</ReactionButton>
          <ReactionButton onClick={() => handleReactionSelect("drop")}>drop</ReactionButton>
          <ReactionButton onClick={() => handleReactionSelect("slurp")}>slurp</ReactionButton>
          <ReactionButton onClick={() => handleReactionSelect("gg")}>gg</ReactionButton>
        </ReactionPicker>
      )}
    </ControlsContainer>
  );
};

export { BottomControls as default, showGameRelatedBottomControls, setUndoEnabled };
