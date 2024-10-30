import { initializeApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth, signInAnonymously, onAuthStateChanged } from "firebase/auth";
import { getDatabase, Database, ref, set, onValue, off, get } from "firebase/database";
import { didFindInviteThatCanBeJoined, didReceiveMatchUpdate, initialFen, didRecoverMyMatch, enterWatchOnlyMode, didFindYourOwnInviteThatNobodyJoined } from "../game/gameController";
import { getPlayersEmojiId, didGetEthAddress } from "../game/board";
import { getFunctions, Functions, httpsCallable } from "firebase/functions";
import { Match, Invite, Reaction, RootMatch } from "./connectionModels";

const controllerVersion = 2;

class FirebaseConnection {
  private app: FirebaseApp;
  private auth: Auth;
  private db: Database;
  private functions: Functions;

  private myMatch: Match | null = null;
  private uid: string | null = null;
  private gameId: string | null = null;

  constructor() {
    const firebaseConfig = {
      apiKey: process.env.REACT_APP_MONS_FIREBASE_API_KEY || "AIzaSyC709PHiVSQqIvCqaJwx3h9Mg55ysgBrRg",
      authDomain: "mons-e34e5.firebaseapp.com",
      databaseURL: "https://mons-e34e5-default-rtdb.firebaseio.com",
      projectId: "mons-e34e5",
      storageBucket: "mons-e34e5.appspot.com",
      messagingSenderId: "949028813912",
      appId: "1:949028813912:web:d06d6dfaa574ca920fde2d",
    };

    this.app = initializeApp(firebaseConfig);
    this.auth = getAuth(this.app);
    this.db = getDatabase(this.app);
    this.functions = getFunctions(this.app);
  }

  public sendRematchProposal(): void {
    // TODO: create next match model
    // TODO: update rematches list within the root match model
    // TODO: get existing opponent's rematch / start listening to opponent's proposals
  }

  public subscribeToAuthChanges(callback: (uid: string | null) => void): void {
    onAuthStateChanged(this.auth, (user) => {
      callback(user ? user.uid : null);
    });
  }

  public async signIn(): Promise<string | undefined> {
    try {
      await signInAnonymously(this.auth);
      const uid = this.auth.currentUser?.uid;
      return uid;
    } catch (error) {
      console.error("Failed to sign in anonymously:", error);
      return undefined;
    }
  }

  public async startTimer(): Promise<any> {
    try {
      const startTimerFunction = httpsCallable(this.functions, "startTimer");
      const response = await startTimerFunction({ gameId: this.gameId });
      return response.data;
    } catch (error) {
      console.error("Error starting a timer:", error);
      throw error;
    }
  }

  public async claimVictoryByTimer(): Promise<any> {
    try {
      const claimVictoryByTimerFunction = httpsCallable(this.functions, "claimVictoryByTimer");
      const response = await claimVictoryByTimerFunction({ gameId: this.gameId });
      return response.data;
    } catch (error) {
      console.error("Error claiming victory by timer:", error);
      throw error;
    }
  }

  public async prepareOnchainVictoryTx(): Promise<any> {
    try {
      const attestVictoryFunction = httpsCallable(this.functions, "attestVictory");
      const response = await attestVictoryFunction({ gameId: this.gameId });
      return response.data;
    } catch (error) {
      console.error("Error preparing onchain victory tx:", error);
      throw error;
    }
  }

  public async verifyEthAddress(message: string, signature: string): Promise<any> {
    try {
      if (!this.auth.currentUser) {
        const uid = await this.signIn();
        if (!uid) {
          throw new Error("Failed to authenticate user");
        }
      }
      const verifyEthAddressFunction = httpsCallable(this.functions, "verifyEthAddress");
      const response = await verifyEthAddressFunction({ message, signature });
      return response.data;
    } catch (error) {
      console.error("Error verifying Ethereum address:", error);
      throw error;
    }
  }

  public updateEmoji(newId: number): void {
    if (!this.myMatch) return;
    this.myMatch.emojiId = newId;
    set(ref(this.db, `players/${this.uid}/matches/${this.gameId}/emojiId`), newId).catch((error) => {
      console.error("Error updating emoji:", error);
    });
  }

  public sendVoiceReaction(reaction: Reaction): void {
    if (!this.myMatch) return;
    this.myMatch.reaction = reaction;
    set(ref(this.db, `players/${this.uid}/matches/${this.gameId}/reaction`), reaction).catch((error) => {
      console.error("Error sending voice reaction:", error);
    });
  }

  public surrender(): void {
    if (!this.myMatch) return;
    this.myMatch.status = "surrendered";
    this.sendMatchUpdate();
  }

  public sendMove(moveFen: string, newBoardFen: string): void {
    if (!this.myMatch) return;
    this.myMatch.fen = newBoardFen;
    this.myMatch.flatMovesString = this.myMatch.flatMovesString ? `${this.myMatch.flatMovesString}-${moveFen}` : moveFen;
    this.sendMatchUpdate();
  }

  private sendMatchUpdate(): void {
    set(ref(this.db, `players/${this.uid}/matches/${this.gameId}`), this.myMatch)
      .then(() => {
        console.log("Match update sent successfully");
      })
      .catch((error) => {
        console.error("Error sending match update:", error);
      });
  }

  public connectToGame(uid: string, inviteId: string, autojoin: boolean): void {
    this.uid = uid;
    this.gameId = inviteId;

    const inviteRef = ref(this.db, `invites/${inviteId}`);
    get(inviteRef)
      .then((snapshot) => {
        const inviteData: Invite | null = snapshot.val();
        if (!inviteData) {
          console.log("No invite data found");
          return;
        }

        if (!inviteData.guestId && inviteData.hostId !== uid) {
          if (autojoin) {
            set(ref(this.db, `invites/${inviteId}/guestId`), uid)
              .then(() => {
                this.getOpponentsMatchAndCreateOwnMatch(inviteId, inviteData.hostId);
              })
              .catch((error) => {
                console.error("Error joining as a guest:", error);
              });
          } else {
            didFindInviteThatCanBeJoined();
          }
        } else {
          if (inviteData.hostId === uid) {
            this.reconnectAsHost(inviteId, inviteData);
          } else if (inviteData.guestId === uid) {
            this.reconnectAsGuest(inviteId, inviteData);
          } else {
            this.enterWatchOnlyMode(inviteId, inviteData.hostId, inviteData.guestId);
          }
        }
      })
      .catch((error) => {
        console.error("Failed to retrieve invite data:", error);
      });
  }

  private reconnectAsGuest(gameId: string, invite: Invite): void {
    const myMatchRef = ref(this.db, `players/${invite.guestId}/matches/${gameId}`);
    get(myMatchRef)
      .then((snapshot) => {
        const myMatchData: Match | null = snapshot.val();
        if (!myMatchData) {
          console.log("No match data found for guest");
          return;
        }
        this.myMatch = myMatchData;
        didRecoverMyMatch(myMatchData, gameId);
        this.observeMatch(invite.hostId, gameId);
      })
      .catch((error) => {
        console.error("Failed to get guest's match:", error);
      });
  }

  private reconnectAsHost(gameId: string, invite: Invite): void {
    const myMatchRef = ref(this.db, `players/${invite.hostId}/matches/${gameId}`);
    get(myMatchRef)
      .then((snapshot) => {
        const myMatchData: Match | null = snapshot.val();
        if (!myMatchData) {
          console.log("No match data found for host");
          return;
        }
        this.myMatch = myMatchData;
        didRecoverMyMatch(myMatchData, gameId);

        if (invite.guestId) {
          this.observeMatch(invite.guestId, gameId);
        } else {
          didFindYourOwnInviteThatNobodyJoined();
          const inviteRef = ref(this.db, `invites/${gameId}`);
          onValue(inviteRef, (snapshot) => {
            const updatedInvite: Invite | null = snapshot.val();
            if (updatedInvite && updatedInvite.guestId) {
              console.log(`Guest ${updatedInvite.guestId} joined the invite ${gameId}`);
              this.observeMatch(updatedInvite.guestId, gameId);
              off(inviteRef);
            }
          });
        }
      })
      .catch((error) => {
        console.error("Failed to get host's match:", error);
      });
  }

  private enterWatchOnlyMode(gameId: string, hostId: string, guestId?: string | null): void {
    enterWatchOnlyMode();
    this.observeMatch(hostId, gameId);
    if (guestId) {
      this.observeMatch(guestId, gameId);
    }
  }

  private getOpponentsMatchAndCreateOwnMatch(gameId: string, hostId: string): void {
    const opponentsMatchRef = ref(this.db, `players/${hostId}/matches/${gameId}`);
    get(opponentsMatchRef)
      .then((snapshot) => {
        const opponentsMatchData: Match | null = snapshot.val();
        if (!opponentsMatchData) {
          console.log("No opponent's match data found");
          return;
        }

        const color = opponentsMatchData.color === "black" ? "white" : "black";
        const emojiId = getPlayersEmojiId();
        const match: RootMatch = {
          version: controllerVersion,
          color,
          emojiId,
          fen: initialFen,
          status: "",
          flatMovesString: "",
          timer: "",
          rematchesSuffixes: "",
        };

        this.myMatch = match;

        set(ref(this.db, `players/${this.uid}/matches/${gameId}`), match)
          .then(() => {
            this.observeMatch(hostId, gameId);
          })
          .catch((error) => {
            console.error("Error creating player match:", error);
          });
      })
      .catch((error) => {
        console.error("Failed to get opponent's match:", error);
      });
  }

  public createInvite(uid: string, inviteId: string): void {
    const hostColor = Math.random() < 0.5 ? "white" : "black";
    const emojiId = getPlayersEmojiId();

    const invite: Invite = {
      version: controllerVersion,
      hostId: uid,
      hostColor,
      guestId: null,
    };

    set(ref(this.db, `invites/${inviteId}`), invite)
      .then(() => {
        console.log("Invite created successfully");
      })
      .catch((error) => {
        console.error("Error creating invite:", error);
      });

    const match: RootMatch = {
      version: controllerVersion,
      color: hostColor,
      emojiId,
      fen: initialFen,
      status: "",
      flatMovesString: "",
      timer: "",
      rematchesSuffixes: "",
    };

    this.myMatch = match;
    this.uid = uid;
    this.gameId = inviteId;

    set(ref(this.db, `players/${uid}/matches/${inviteId}`), match).catch((error) => {
      console.error("Error creating player match:", error);
    });
    const inviteRef = ref(this.db, `invites/${inviteId}`);
    onValue(inviteRef, (snapshot) => {
      const updatedInvite: Invite | null = snapshot.val();
      if (updatedInvite && updatedInvite.guestId) {
        console.log(`Guest ${updatedInvite.guestId} joined the invite ${inviteId}`);
        this.observeMatch(updatedInvite.guestId, inviteId);
        off(inviteRef);
      }
    });
  }

  private observeMatch(playerId: string, matchId: string): void {
    const matchRef = ref(this.db, `players/${playerId}/matches/${matchId}`);
    const ethAddressRef = ref(this.db, `players/${playerId}/ethAddress`);

    onValue(
      matchRef,
      (snapshot) => {
        const matchData: Match | null = snapshot.val();
        if (matchData) {
          didReceiveMatchUpdate(matchData, playerId, matchId);
        }
      },
      (error) => {
        console.error("Error observing match data:", error);
      }
    );

    onValue(
      ethAddressRef,
      (snapshot) => {
        const ethAddress: string | null = snapshot.val();
        if (ethAddress) {
          didGetEthAddress(ethAddress, playerId);
        }
      },
      (error) => {
        console.error("Error observing ETH address:", error);
      }
    );
  }
}

export const firebaseConnection = new FirebaseConnection();
