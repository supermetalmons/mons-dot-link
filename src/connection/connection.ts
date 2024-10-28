import { generateNewGameId } from "../utils/misc";

const initialPath = window.location.pathname.replace(/^\/|\/$/g, "");
export const isCreateNewInviteFlow = initialPath === "";

let firebaseConnection: any;
let newGameId = "";
let didCreateNewGameInvite = false;
let currentUid: string | null = "";

export async function subscribeToAuthChanges(callback: (uid: string | null) => void) {
  const connection = await getFirebaseConnection();
  connection.subscribeToAuthChanges((newUid: string | null) => {
    if (newUid !== currentUid) {
      currentUid = newUid;
      callback(newUid);
    }
  });
}

export function getCurrentGameId(): string {
  return firebaseConnection.gameId;
}

export function setupConnection(autojoin: boolean) {
  if (!isCreateNewInviteFlow) {
    connectToGame(initialPath, autojoin);
  }
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

export function sendResignStatus() {
  firebaseConnection.surrender();
}

export function sendMove(moveFen: string, newBoardFen: string) {
  firebaseConnection.sendMove(moveFen, newBoardFen);
}

export function sendVoiceReaction(reaction: any) {
  firebaseConnection.sendVoiceReaction(reaction);
}

export function sendEmojiUpdate(newId: number) {
  firebaseConnection.updateEmoji(newId);
}

export async function verifyEthAddress(message: string, signature: string): Promise<any> {
  if (!firebaseConnection) {
    const uid = await signIn();
    if (!uid) {
      throw new Error("Failed to authenticate user");
    }
  }
  return firebaseConnection.verifyEthAddress(message, signature);
}

export async function startTimer(gameId: string): Promise<any> {
  return firebaseConnection.startTimer(gameId);
}

export async function claimVictoryByTimer(gameId: string): Promise<any> {
  return firebaseConnection.claimVictoryByTimer(gameId);
}

export async function prepareOnchainVictoryTx(gameId: string): Promise<any> {
  return firebaseConnection.prepareOnchainVictoryTx(gameId);
}

export function connectToGame(gameId: string, autojoin: boolean) {
  signIn().then((uid) => {
    if (uid) {
      firebaseConnection.connectToGame(uid, gameId, autojoin);
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

async function getFirebaseConnection() {
  if (!firebaseConnection) {
    firebaseConnection = (await import("./firebaseConnection")).firebaseConnection;
  }
  return firebaseConnection;
}

export async function signIn(): Promise<string | undefined> {
  const connection = await getFirebaseConnection();
  return connection.signIn();
}
