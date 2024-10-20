import { useState, useCallback, useEffect } from "react";
import { newReactionOfKind, playReaction } from "../content/sounds";
import { startPlayingMusic, stopPlayingMusic } from "../content/music";
import { sendVoiceReaction } from "../connection/connection";
import { showVoiceReactionText } from "../game/board";
import { didClickUndoButton, didClickResignButton, canHandleUndo } from "../game/gameController";

export interface BottomControlsActionsInterface {
  isMuted: boolean;
  isReactionPickerVisible: boolean;
  handleUndo: (event: React.MouseEvent<HTMLButtonElement>) => void;
  handleMuteToggle: (event: React.MouseEvent<HTMLButtonElement>) => void;
  handleResign: (event: React.MouseEvent<HTMLButtonElement>) => void;
  handleVoiceReaction: (event: React.MouseEvent<HTMLButtonElement>) => void;
  handleReactionSelect: (reaction: string) => void;
  hideReactionPicker: () => void;
  setIsUndoDisabled: (disabled: boolean) => void;
  setIsResignDisabled: (disabled: boolean) => void;
  isVoiceReactionDisabled: boolean;
  isUndoDisabled: boolean;
  isResignDisabled: boolean;
  isMusicPlaying: boolean;
  handleMusicToggle: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

let globalIsMuted = localStorage.getItem("isMuted") === "true";

export const useBottomControlsActions = (): BottomControlsActionsInterface => {
  const [isMuted, setIsMuted] = useState(globalIsMuted);
  const [isReactionPickerVisible, setIsReactionPickerVisible] = useState(false);
  const [isVoiceReactionDisabled, setIsVoiceReactionDisabled] = useState(false);
  const [isUndoDisabled, setIsUndoDisabled] = useState(true);
  const [isResignDisabled, setIsResignDisabled] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);

  useEffect(() => {
    localStorage.setItem("isMuted", isMuted.toString());
    globalIsMuted = isMuted;
  }, [isMuted]);

  const handleUndo = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    didClickUndoButton();
    setIsUndoDisabled(!canHandleUndo());
  }, []);

  const handleMuteToggle = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setIsMuted((prev) => !prev);
  }, []);

  const handleResign = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    didClickResignButton();
    // TODO: handle resign properly
    setIsResignDisabled(true);
    alert("resign is not implemented yet");
  }, []);

  const handleVoiceReaction = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setIsReactionPickerVisible((prev) => !prev);
  }, []);

  const handleReactionSelect = useCallback((reaction: string) => {
    setIsReactionPickerVisible(false);
    const reactionObj = newReactionOfKind(reaction);
    sendVoiceReaction(reactionObj);
    playReaction(reactionObj);
    showVoiceReactionText(reaction, false);
    setIsVoiceReactionDisabled(true);
    setTimeout(() => {
      setIsVoiceReactionDisabled(false);
    }, 9999);
  }, []);

  const hideReactionPicker = useCallback(() => {
    setIsReactionPickerVisible(false);
  }, []);

  const handleMusicToggle = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setIsMusicPlaying((prev) => {
      if (prev) {
        stopPlayingMusic();
        return false;
      } else {
        startPlayingMusic();
        return true;
      }
    });
  }, []);

  return {
    isMuted,
    isReactionPickerVisible,
    handleUndo,
    handleMuteToggle,
    handleResign,
    handleVoiceReaction,
    handleReactionSelect,
    hideReactionPicker,
    setIsUndoDisabled,
    setIsResignDisabled,
    isVoiceReactionDisabled,
    isUndoDisabled,
    isResignDisabled,
    isMusicPlaying,
    handleMusicToggle,
  };
};

export const getIsMuted = (): boolean => globalIsMuted;
