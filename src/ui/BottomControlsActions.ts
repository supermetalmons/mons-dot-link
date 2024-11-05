import { useState, useCallback, useEffect } from "react";
import { newReactionOfKind, playReaction } from "../content/sounds";
import { startPlayingMusic, stopPlayingMusic } from "../content/music";
import { didBecomeMuted } from "../utils/SoundPlayer";
import { sendVoiceReaction } from "../connection/connection";
import { showVoiceReactionText } from "../game/board";
import { didClickUndoButton, didClickConfirmResignButton, canHandleUndo } from "../game/gameController";
import { hideReactionPicker } from "./BottomControls";
import { isMobileOrVision } from "../utils/misc";

export interface BottomControlsActionsInterface {
  isMuted: boolean;
  handleUndo: (event: React.MouseEvent<HTMLButtonElement>) => void;
  handleMuteToggle: (event: React.MouseEvent<HTMLButtonElement>) => void;
  handleResign: (event: MouseEvent | React.MouseEvent<HTMLButtonElement>) => void;
  handleReactionSelect: (reaction: string) => void;
  setIsUndoDisabled: (disabled: boolean) => void;
  setIsResignDisabled: (disabled: boolean) => void;
  isVoiceReactionDisabled: boolean;
  isUndoDisabled: boolean;
  isResignDisabled: boolean;
  isMusicPlaying: boolean;
  handleMusicToggle: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

let globalIsMuted: boolean = (() => {
  const isMuted = localStorage.getItem("isMuted");
  return isMuted === "true" || (isMuted === null && isMobileOrVision);
})();

export const useBottomControlsActions = (): BottomControlsActionsInterface => {
  const [isMuted, setIsMuted] = useState(globalIsMuted);
  const [isVoiceReactionDisabled, setIsVoiceReactionDisabled] = useState(false);
  const [isUndoDisabled, setIsUndoDisabled] = useState(true);
  const [isResignDisabled, setIsResignDisabled] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);

  useEffect(() => {
    localStorage.setItem("isMuted", isMuted.toString());
    globalIsMuted = isMuted;
    didBecomeMuted(isMuted);
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

  const handleResign = useCallback((event: MouseEvent | React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setIsResignDisabled(true);
    didClickConfirmResignButton();
  }, []);

  const handleReactionSelect = useCallback((reaction: string) => {
    hideReactionPicker();
    const reactionObj = newReactionOfKind(reaction);
    sendVoiceReaction(reactionObj);
    playReaction(reactionObj);
    showVoiceReactionText(reaction, false);
    setIsVoiceReactionDisabled(true);
    setTimeout(() => {
      setIsVoiceReactionDisabled(false);
    }, 9999);
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
    handleUndo,
    handleMuteToggle,
    handleResign,
    handleReactionSelect,
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
