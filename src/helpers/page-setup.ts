const initialPath = window.location.pathname.replace(/^\/|\/$/g, "");

const inviteButton = document.querySelector(".invite-button");
const connectWalletButton = document.querySelector(".connect-wallet-button");
const statusText = document.querySelector(".status-text");

export const isCreateNewInviteFlow = initialPath == "";

let newGameId = "";
let didCreateNewGameInvite = false;
let firebaseConnection: any;

export function updateStatus(text: string) {
  if (text == "") {
    statusText.innerHTML = "";
    (statusText as HTMLElement).style.display = "none";
  }
}

export function setupPage() {
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
      inviteButton.innerHTML = "+ new invite link";
    }
  }

  if (connectWalletButton) {
    connectWalletButton.addEventListener("click", didClickConnectWalletButton);
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

function didClickInviteButton() {
  if (!inviteButton) {
    return;
  }

  if (didCreateNewGameInvite) {
    writeInviteLinkToClipboard();
    showDidCopyInviteLink();
  } else {
    newGameId = generateNewGameId();
    writeInviteLinkToClipboard();

    inviteButton.innerHTML = "creating an invite...";
    (inviteButton as HTMLButtonElement).disabled = true;
    createNewMatchInvite();
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
      inviteButton.innerHTML = "connected"; // TODO: gotta be able to copy game link
    } else {
      // TODO: show message that smth is wrong
      console.log("failed to get game info");
    }
  });
}

function createNewMatchInvite() {
  signIn().then((uid) => {
    if (uid) {
      firebaseConnection.createInvite(uid, newGameId); // TODO: process create invite result
      didCreateNewGameInvite = true;
      updatePath(newGameId);
      statusText.innerHTML = "waiting for someone to join";
      inviteButton.innerHTML = "copy invite link";
      (inviteButton as HTMLButtonElement).disabled = false;
    } else {
      // TODO: show message that invite was not created
      console.log("failed to sign in");
    }
  });
}

function showDidCopyInviteLink() {
  if (inviteButton) {
    inviteButton.innerHTML = "invite link is copied ✓";
    (inviteButton as HTMLButtonElement).disabled = true;
    setTimeout(() => {
      inviteButton.innerHTML = "copy invite link";
      (inviteButton as HTMLButtonElement).disabled = false;
    }, 1300);
  }
}

function updatePath(newGameId: string) {
  const newPath = `/${newGameId}`;
  history.pushState({ path: newPath }, "", newPath);
}

function addVoiceReactionSelect() {
  const voiceReactionSelect = document.createElement("select");
  voiceReactionSelect.id = "voiceReactions";
  voiceReactionSelect.innerHTML = `
    <option value="" disabled selected>say</option>
    <option value="yo">yo</option>
    <option value="wahoo">wahoo</option>
    <option value="drop">drop</option>
    <option value="slurp">slurp</option>
    <option value="gg">gg</option>
  `;
  document.body.appendChild(voiceReactionSelect);

  voiceReactionSelect.addEventListener("change", function () {
    console.log("says", voiceReactionSelect.value);
    voiceReactionSelect.selectedIndex = 0;
  });
}

function didClickConnectWalletButton() {
  if (connectWalletButton) {
    connectWalletButton.innerHTML = "soon";
    setTimeout(() => {
      connectWalletButton.innerHTML = "connect wallet";
    }, 699);
  }
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
