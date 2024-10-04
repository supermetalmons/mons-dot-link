import React, { useRef, useEffect, useState } from "react";
import styled from "styled-components";
import { FaUndo, FaVolumeUp, FaVolumeMute, FaFlag, FaCommentAlt } from "react-icons/fa";
import { BottomControlsActionsInterface } from "./BottomControlsActions";

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

const ControlButton = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #f0f0f0;
  border: none;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: background-color 0.3s ease;
  -webkit-tap-highlight-color: transparent;

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      background-color: #e0e0e0;
    }
  }

  &:active {
    background-color: #d0d0d0;
  }

  svg {
    width: 16px;
    height: 16px;
    color: #333;
  }

  @media (prefers-color-scheme: dark) {
    background-color: #333;

    @media (hover: hover) and (pointer: fine) {
      &:hover {
        background-color: #444;
      }
    }

    &:active {
      background-color: #555;
    }

    svg {
      color: #f0f0f0;
    }
  }
`;

const ReactionPicker = styled.div`
  position: absolute;
  bottom: 40px;
  right: 10px;
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

const BottomControls: React.FC<BottomControlsProps> = ({ actions }) => {
  const [showOtherControls, setShowOtherControls] = useState(false);
  const { isMuted, isReactionPickerVisible, handleUndo, handleMuteToggle, handleResign, handleVoiceReaction, handleReactionSelect, hideReactionPicker } = actions;

  const pickerRef = useRef<HTMLDivElement>(null);
  const voiceReactionButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      event.stopPropagation();
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node) && !voiceReactionButtonRef.current?.contains(event.target as Node)) {
        hideReactionPicker();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [hideReactionPicker]);

  showGameRelatedBottomControls = () => setShowOtherControls(true);

  return (
    <ControlsContainer>
      {showOtherControls && (
        <>
          <ControlButton onClick={handleUndo} aria-label="Undo">
            <FaUndo />
          </ControlButton>
          <ControlButton onClick={handleResign} aria-label="Resign">
            <FaFlag />
          </ControlButton>
          <ControlButton onClick={handleVoiceReaction} aria-label="Voice Reaction" ref={voiceReactionButtonRef}>
            <FaCommentAlt />
          </ControlButton>
        </>
      )}
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

export { BottomControls as default, showGameRelatedBottomControls };
