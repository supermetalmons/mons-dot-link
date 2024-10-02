import { useState, useCallback } from 'react';

export interface BottomControlsActionsInterface {
  isMuted: boolean;
  handleUndo: (event: React.MouseEvent<HTMLButtonElement>) => void;
  handleMuteToggle: (event: React.MouseEvent<HTMLButtonElement>) => void;
  handleResign: (event: React.MouseEvent<HTMLButtonElement>) => void;
  handleVoiceReaction: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

export const useBottomControlsActions = (): BottomControlsActionsInterface => {
  const [isMuted, setIsMuted] = useState(false);

  const handleUndo = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    // TODO: Implement undo logic
    console.log("Undo");
  }, []);

  const handleMuteToggle = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    // TODO: implement
    setIsMuted(prev => !prev);
  }, []);

  const handleResign = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    // TODO: Implement resign logic
    console.log("Resign");
  }, []);

  const handleVoiceReaction = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    // TODO: Implement voice reaction logic
    console.log("Voice Reaction");
  }, []);

  return {
    isMuted,
    handleUndo,
    handleMuteToggle,
    handleResign,
    handleVoiceReaction,
  };
};