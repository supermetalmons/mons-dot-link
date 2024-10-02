import React from 'react';
import styled from 'styled-components';
import { FaUndo, FaVolumeUp, FaVolumeMute, FaFlag, FaCommentAlt } from 'react-icons/fa';
import { BottomControlsActionsInterface } from './BottomControlsActions';

interface BottomControlsProps {
  actions: BottomControlsActionsInterface;
}

const ControlsContainer = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  display: flex;
  gap: 10px;
`;

const ControlButton = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #f0f0f0;
  border: none;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #e0e0e0;
  }

  svg {
    width: 20px;
    height: 20px;
    color: #333;
  }

  @media (prefers-color-scheme: dark) {
    background-color: #333;
    
    &:hover {
      background-color: #444;
    }

    svg {
      color: #f0f0f0;
    }
  }
`;

const BottomControls: React.FC<BottomControlsProps> = ({ actions }) => {
  const { isMuted, handleUndo, handleMuteToggle, handleResign, handleVoiceReaction } = actions;

  return (
    <ControlsContainer>
      <ControlButton onClick={handleUndo} aria-label="Undo">
        <FaUndo />
      </ControlButton>
      <ControlButton onClick={handleMuteToggle} aria-label={isMuted ? "Unmute" : "Mute"}>
        {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
      </ControlButton>
      <ControlButton onClick={handleResign} aria-label="Resign">
        <FaFlag />
      </ControlButton>
      <ControlButton onClick={handleVoiceReaction} aria-label="Voice Reaction">
        <FaCommentAlt />
      </ControlButton>
    </ControlsContainer>
  );
};

export default BottomControls;