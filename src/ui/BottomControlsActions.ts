import { useState, useCallback, useEffect } from 'react';

export interface BottomControlsActionsInterface {
  isMuted: boolean;
  handleUndo: (event: React.MouseEvent<HTMLButtonElement>) => void;
  handleMuteToggle: (event: React.MouseEvent<HTMLButtonElement>) => void;
  handleResign: (event: React.MouseEvent<HTMLButtonElement>) => void;
  handleVoiceReaction: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

let globalIsMuted = localStorage.getItem('isMuted') === 'true';

export const useBottomControlsActions = (): BottomControlsActionsInterface => {
  const [isMuted, setIsMuted] = useState(globalIsMuted);

  useEffect(() => {
    localStorage.setItem('isMuted', isMuted.toString());
    globalIsMuted = isMuted;
  }, [isMuted]);

  const handleUndo = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    // TODO: Implement undo logic
    console.log("Undo");
  }, []);

  const handleMuteToggle = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
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

export const getIsMuted = (): boolean => globalIsMuted;