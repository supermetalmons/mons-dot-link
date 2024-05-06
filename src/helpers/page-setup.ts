const initialPath = window.location.pathname.replace(/^\/|\/$/g, "");
const inviteButton = document.querySelector(".invite-button");
const connectWalletButton = document.querySelector(".connect-wallet-button");
const isCreateNewInviteFlow = initialPath == "";

let newGameId = "";
let didCreateNewGameInvite = false;

export function setupPage() {
  if (isCreateNewInviteFlow) {
    // TODO: create invite flow
  } else {
    // TODO: connect to the existing game
  }

  if (inviteButton) {
    inviteButton.addEventListener("click", didClickInviteButton);
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
  if (!inviteButton) { return; }

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
  navigator.clipboard.writeText(window.location.origin + '/' + newGameId);
}

function createNewMatchInvite() {
  signIn().then((uid) => {
    if (uid) {
      console.log("signed in with uid:", uid);
      // TODO: create an invite entry after a sign in
      didCreateNewGameInvite = true;
      updatePath(newGameId);
      showDidCopyInviteLink();
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

function didClickConnectWalletButton() {
  if (connectWalletButton) {
    connectWalletButton.innerHTML = "soon";
    setTimeout(() => {
      connectWalletButton.innerHTML = "connect wallet";
    }, 699);
  }
}

async function signIn(): Promise<string | undefined> {
  const firebaseConnection = (await import("../connection")).firebaseConnection;
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