// TODO: structure, refactor, and remove it

import { newReactionOfKind, playReaction } from "./content/sounds";

const initialPath = window.location.pathname.replace(/^\/|\/$/g, "");

let voiceReactionSelect: HTMLSelectElement | null;

function initializeElements() {
  voiceReactionSelect = document.querySelector(".voice-reaction-select") as HTMLSelectElement;
}

export const isCreateNewInviteFlow = initialPath === "";

let newGameId = "";
let didCreateNewGameInvite = false;
let firebaseConnection: any;

export function setupPage() {
  initializeElements();
  setupVoiceReactionSelect();
  if (!isCreateNewInviteFlow) {
    connectToGame(initialPath);
  }
}

export function setVoiceReactionSelectHidden(hidden: boolean) {
  voiceReactionSelect.style.display = hidden ? "none" : "";
}

// TODO: update for a new usage
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

export function showVoiceReactionText(reactionText: string, opponents: boolean) {
  // TODO: display within board player / opponent text elements
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

async function signIn(): Promise<string | undefined> {
  firebaseConnection = (await import("./game/firebaseConnection")).firebaseConnection;
  return firebaseConnection.signIn();
}

export const isDesktopSafari = (() => {
  const userAgent = window.navigator.userAgent;
  const isSafari = /^((?!chrome|android).)*safari/i.test(userAgent);
  const isIos = /iPad|iPhone|iPod/.test(userAgent);
  return isSafari && !isIos;
})();

export const isModernAndPowerful = (() => {
  // TODO: come up with a way to return false when needed to make the game work properly on kindle
  return true;
})();

export function generateNewGameId(): string {
  const letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let id = "";
  for (let i = 0; i < 10; i++) {
    id += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  return id;
}
