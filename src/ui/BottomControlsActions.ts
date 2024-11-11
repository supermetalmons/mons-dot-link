import { useState, useCallback } from "react";
import { newReactionOfKind, playReaction } from "../content/sounds";
import { sendVoiceReaction } from "../connection/connection";
import { showVoiceReactionText } from "../game/board";
import { didClickUndoButton, didClickConfirmResignButton, canHandleUndo } from "../game/gameController";
import { hideReactionPicker } from "./BottomControls";

export interface BottomControlsActionsInterface {
  handleUndo: (event: React.MouseEvent<HTMLButtonElement> | React.TouchEvent<HTMLButtonElement>) => void;
  handleResign: (event: MouseEvent | React.MouseEvent<HTMLButtonElement>) => void;
  handleReactionSelect: (reaction: string) => void;
  setIsUndoDisabled: (disabled: boolean) => void;
  setIsResignDisabled: (disabled: boolean) => void;
  isVoiceReactionDisabled: boolean;
  isUndoDisabled: boolean;
  isResignDisabled: boolean;
}

export const useBottomControlsActions = (): BottomControlsActionsInterface => {
  const [isVoiceReactionDisabled, setIsVoiceReactionDisabled] = useState(false);
  const [isUndoDisabled, setIsUndoDisabled] = useState(true);
  const [isResignDisabled, setIsResignDisabled] = useState(false);

  const handleUndo = useCallback((event: React.MouseEvent<HTMLButtonElement> | React.TouchEvent<HTMLButtonElement>) => {
    if ((event.target as HTMLButtonElement).disabled) return;
    didClickUndoButton();
    setIsUndoDisabled(!canHandleUndo());
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

  return {
    handleUndo,
    handleResign,
    handleReactionSelect,
    setIsUndoDisabled,
    setIsResignDisabled,
    isVoiceReactionDisabled,
    isUndoDisabled,
    isResignDisabled,
  };
};
