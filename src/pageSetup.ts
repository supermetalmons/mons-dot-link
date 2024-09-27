// TODO: structure, refactor, and remove it

import { generateNewGameId } from "./utils/misc";

import { newReactionOfKind, playReaction } from "./content/sounds";

const initialPath = window.location.pathname.replace(/^\/|\/$/g, "");
export const isCreateNewInviteFlow = initialPath === "";
let newGameId = "";
let didCreateNewGameInvite = false;
let firebaseConnection: any;

export function setupPage() {
  if (!isCreateNewInviteFlow) {
    connectToGame(initialPath);
  }

  initializeElements();
  setupVoiceReactionSelect();
}

export function didClickInviteButton(completion) {
  if (didCreateNewGameInvite) {
    writeInviteLinkToClipboard();
    completion(true);
  } else {
    newGameId = generateNewGameId();
    writeInviteLinkToClipboard();
    createNewMatchInvite(completion);
  }
}

function writeInviteLinkToClipboard() {
  const link = window.location.origin + "/" + newGameId;
  navigator.clipboard.writeText(link);
}

// TODO: tmp here as long as we access connection from here
export function sendMove(moveFen: string, newBoardFen: string) {
  firebaseConnection.sendMove(moveFen, newBoardFen);
}

// TODO: tmp here as long as we access connection from here
export function sendEmojiUpdate(newId: number) {
  firebaseConnection.updateEmoji(newId);
}

function connectToGame(gameId: string) {
  signIn().then((uid) => {
    if (uid) {
      firebaseConnection.connectToGame(uid, gameId);
      // TODO: do not update it too early
      // inviteButton.innerHTML = "connected"; // TODO: gotta be able to copy game link
      // TODO: configure new button differently
    } else {
      // TODO: show message that smth is wrong
      console.log("failed to get game info");
    }
  });
}

function createNewMatchInvite(completion) {
  signIn().then((uid) => {
    if (uid) {
      firebaseConnection.createInvite(uid, newGameId); // TODO: process create invite result
      didCreateNewGameInvite = true;
      updatePath(newGameId);
      completion(true);
    } else {
      console.log("failed to sign in");
      completion(false);
    }
  });
}

function updatePath(newGameId: string) {
  const newPath = `/${newGameId}`;
  window.history.pushState({ path: newPath }, "", newPath);
}

async function signIn(): Promise<string | undefined> {
  firebaseConnection = (await import("./connection/firebaseConnection")).firebaseConnection;
  return firebaseConnection.signIn();
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
    firebaseConnection.sendVoiceReaction(reaction);
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