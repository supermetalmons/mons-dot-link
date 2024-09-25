import { newReactionOfKind, playReaction } from "./sounds";

const initialPath = window.location.pathname.replace(/^\/|\/$/g, "");

let inviteButton: HTMLElement | null;
let statusText: HTMLElement | null;
let voiceReactionSelect: HTMLSelectElement | null;
let rock: HTMLElement | null;

function initializeElements() {
  inviteButton = document.querySelector(".invite-button");
  statusText = document.querySelector(".status-text");
  voiceReactionSelect = document.querySelector(".voice-reaction-select") as HTMLSelectElement;
  rock = document.querySelector(".rock-link") as HTMLElement;
}

export const isCreateNewInviteFlow = initialPath == "";

let newGameId = "";
let didCreateNewGameInvite = false;
let firebaseConnection: any;

export function updateStatus(text: string) {
  if (text == "") {
    // TODO: new way to show status
    // statusText.innerHTML = "";
    // (statusText as HTMLElement).style.display = "none";
  }
}

export function setupPage() {
  initializeElements();
  setupVoiceReactionSelect();

  if (isCreateNewInviteFlow) {
    // TODO: create invite flow
  } else {
    connectToGame(initialPath);
  }

  if (inviteButton) {
    inviteButton.addEventListener("click", didClickInviteButton);
    if (!isCreateNewInviteFlow) {
      (inviteButton as HTMLButtonElement).disabled = true;
      inviteButton.innerHTML = "loading mons game...";
      // TODO: implement loading and connecting to the existing invite
    } else {
      inviteButton.innerHTML = "new invite link";
    }
  }

  if (!isModernAndPowerful) {
    ["github", "app store", "steam", "x"].forEach((key: string) => {
      const link: HTMLAnchorElement | null = document.querySelector(`a[data-key="${key}"]`);
      if (link) {
        link.textContent = link.getAttribute("data-text") || "";
      }
    });
  }
}

export function setVoiceReactionSelectHidden(hidden: boolean) {
  voiceReactionSelect.style.display = hidden ? "none" : "";
}

// TODO: update for a new usage
export function didClickInviteButton(completion) {
  if (didCreateNewGameInvite) {
    writeInviteLinkToClipboard();
    showDidCopyInviteLink();
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

function showDidCopyInviteLink() {
  if (inviteButton) {
    inviteButton.innerHTML = "invite link is copied";
    (inviteButton as HTMLButtonElement).disabled = true;
    setTimeout(() => {
      inviteButton.innerHTML = "copy invite link";
      (inviteButton as HTMLButtonElement).disabled = false;
    }, 1300);
  }
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
  firebaseConnection = (await import("../connection")).firebaseConnection;
  return firebaseConnection.signIn();
}

export const isDesktopSafari = (() => {
  const userAgent = window.navigator.userAgent;
  const isSafari = /^((?!chrome|android).)*safari/i.test(userAgent);
  const isIos = /iPad|iPhone|iPod/.test(userAgent);
  return isSafari && !isIos;
})();

export const isModernAndPowerful = (() => {
  if (isDesktopSafari) {
    return true;
  }
  for (const char of ["⚔︎", "𝕏", "♡", "☆", "↓"]) {
    if (!supportsCharacter(char)) {
      return false;
    }
  }
  return true;
})();

function supportsCharacter(character: string): boolean {
  const testElement: HTMLSpanElement = document.createElement("span");
  testElement.style.visibility = "hidden";
  testElement.style.position = "absolute";
  testElement.style.fontSize = "32px";
  document.body.appendChild(testElement);

  testElement.textContent = "\uFFFF";
  const initialWidth: number = testElement.clientWidth;
  testElement.textContent = character;
  const characterWidth: number = testElement.clientWidth;
  document.body.removeChild(testElement);
  return initialWidth !== characterWidth;
}

export function generateNewGameId(): string {
  const letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let id = "";
  for (let i = 0; i < 10; i++) {
    id += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  return id;
}
