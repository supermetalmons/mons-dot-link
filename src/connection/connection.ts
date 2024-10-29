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

export function sendRematchProposal() {
  // TODO: implement
  firebaseConnection.sendRematchProposal();
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

export async function startTimer(): Promise<any> {
  return firebaseConnection.startTimer();
}

export async function claimVictoryByTimer(): Promise<any> {
  return firebaseConnection.claimVictoryByTimer();
}

export async function prepareOnchainVictoryTx(): Promise<any> {
  return firebaseConnection.prepareOnchainVictoryTx();
}

export function connectToGame(gameId: string, autojoin: boolean) {
  signIn().then((uid) => {
    if (uid) {
      firebaseConnection.connectToGame(uid, gameId, autojoin);
    } else {
      // TODO: try to reconnect
      console.log("failed to get game info");
    }
  });
}

function createNewMatchInvite(completion) {
  signIn().then((uid) => {
    if (uid) {
      firebaseConnection.createInvite(uid, newGameId); // TODO: retry if failed to create
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
