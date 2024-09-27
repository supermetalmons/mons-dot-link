// TODO: structure, refactor, and remove it

import { newReactionOfKind, playReaction } from "./content/sounds";
import { sendVoiceReaction } from "./connection/connection";


export function setupPage() {
  initializeElements();
  setupVoiceReactionSelect();
}

// MARK: - legacy voice reaction logic

let voiceReactionSelect: HTMLSelectElement | null;

function initializeElements() {
  voiceReactionSelect = document.querySelector(".voice-reaction-select") as HTMLSelectElement;
}

function setupVoiceReactionSelect() {
  voiceReactionSelect.addEventListener("change", function () {
    const reaction = newReactionOfKind(voiceReactionSelect.value);
    voiceReactionSelect.selectedIndex = 0;
    sendVoiceReaction(reaction);
    playReaction(reaction);
    showVoiceReactionText(reaction.kind, false);
    slowDownVoiceReactions();
  });
}

function slowDownVoiceReactions() {
  setVoiceReactionSelectHidden(true);
  setTimeout(() => {
    setVoiceReactionSelectHidden(false);
  }, 9999);
}

export function showVoiceReactionText(reactionText: string, opponents: boolean) {
  // TODO: display within board player / opponent text elements
}

export function setVoiceReactionSelectHidden(hidden: boolean) {
  voiceReactionSelect.style.display = hidden ? "none" : "";
}