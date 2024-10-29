import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";
import { getDatabase, ref, set, onValue, off, get } from "firebase/database";
import { didFindInviteThatCanBeJoined, didReceiveMatchUpdate, initialFen, didRecoverMyMatch, enterWatchOnlyMode, didFindYourOwnInviteThatNobodyJoined } from "../game/gameController";
import { getPlayersEmojiId, didGetEthAddress } from "../game/board";

const controllerVersion = 2;

class FirebaseConnection {
  private app: any;
  private auth: any;

  private myMatch: any;
  private uid: string;
  private gameId: string;

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
  }

  public sendRematchProposal() {
    // TODO: create next match model
    // TODO: update rematches list within the root match model
    // TODO: get existing opponent's rematch / start listening to opponent's proposals
  }

  public subscribeToAuthChanges(callback: (uid: string | null) => void) {
    onAuthStateChanged(this.auth, (user) => {
      callback(user ? user.uid : null);
    });
  }

  public signIn(): Promise<string | undefined> {
    return new Promise((resolve) => {
      signInAnonymously(this.auth)
        .then(() => {
          const uid = this.auth.currentUser?.uid;
          resolve(uid);
        })
        .catch(() => {
          resolve(undefined);
        });
    });
  }

  public async startTimer(): Promise<any> {
    try {
      const { getFunctions, httpsCallable } = await import("firebase/functions");
      const functions = getFunctions(this.app);
      const startTimerFunction = httpsCallable(functions, "startTimer");
      const response = await startTimerFunction({ gameId: this.gameId });
      return response.data;
    } catch (error) {
      console.error("Error starting a timer", error);
      throw error;
    }
  }

  public async claimVictoryByTimer(): Promise<any> {
    try {
      const { getFunctions, httpsCallable } = await import("firebase/functions");
      const functions = getFunctions(this.app);
      const claimVictoryByTimerFunction = httpsCallable(functions, "claimVictoryByTimer");
      const response = await claimVictoryByTimerFunction({ gameId: this.gameId });
      return response.data;
    } catch (error) {
      console.error("Error claiming victory by timer", error);
      throw error;
    }
  }

  public async prepareOnchainVictoryTx(): Promise<any> {
    try {
      const { getFunctions, httpsCallable } = await import("firebase/functions");
      const functions = getFunctions(this.app);
      const attestVictoryFunction = httpsCallable(functions, "attestVictory");
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
      const { getFunctions, httpsCallable } = await import("firebase/functions");
      const functions = getFunctions(this.app);
      const verifyEthAddressFunction = httpsCallable(functions, "verifyEthAddress");
      const response = await verifyEthAddressFunction({ message, signature });
      return response.data;
    } catch (error) {
      console.error("Error verifying Ethereum address:", error);
      throw error;
    }
  }

  public updateEmoji(newId: number) {
    this.myMatch.emojiId = newId;
    const db = getDatabase(this.app);
    set(ref(db, `players/${this.uid}/matches/${this.gameId}/emojiId`), newId)
      .then(() => {})
      .catch(() => {});
  }

  public sendVoiceReaction(reaction: any) {
    this.myMatch.reaction = reaction;
    const db = getDatabase(this.app);
    set(ref(db, `players/${this.uid}/matches/${this.gameId}/reaction`), reaction)
      .then(() => {})
      .catch(() => {});
  }

  public surrender() {
    this.myMatch.status = "surrendered";
    this.sendMatchUpdate();
  }

  public sendMove(moveFen: string, newBoardFen: string) {
    this.myMatch.fen = newBoardFen;
    if (this.myMatch.flatMovesString === "") {
      this.myMatch.flatMovesString = moveFen;
    } else {
      this.myMatch.flatMovesString += "-" + moveFen;
    }
    this.sendMatchUpdate();
  }

  private sendMatchUpdate() {
    const db = getDatabase(this.app);
    set(ref(db, `players/${this.uid}/matches/${this.gameId}`), this.myMatch)
      .then(() => {
        console.log("did send match update successfully");
      })
      .catch((error) => {
        console.error("error sending a match update", error);
      });
  }

  public connectToGame(uid: string, inviteId: string, autojoin: boolean) {
    console.log(uid);
    this.uid = uid;
    this.gameId = inviteId;

    const db = getDatabase(this.app);
    const inviteRef = ref(db, `invites/${inviteId}`);
    get(inviteRef)
      .then((snapshot) => {
        const inviteData = snapshot.val();
        if (!inviteData) {
          console.log("got empty invite data");
          return;
        }
        if (!inviteData.guestId && inviteData.hostId !== uid) {
          if (autojoin) {
            set(ref(db, `invites/${inviteId}/guestId`), uid)
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

  private reconnectAsGuest(gameId: string, invite: any) {
    const db = getDatabase(this.app);
    const myMatchRef = ref(db, `players/${invite.guestId}/matches/${gameId}`);

    get(myMatchRef)
      .then((snapshot) => {
        const myMatchData = snapshot.val();
        if (!myMatchData) {
          console.log("got empty my match data");
          return;
        }
        this.myMatch = myMatchData;
        didRecoverMyMatch(myMatchData, gameId);
        this.observeMatch(invite.hostId, gameId);
      })
      .catch((error) => {
        console.error("failed to get my match:", error);
      });
  }

  private reconnectAsHost(gameId: string, invite: any) {
    const db = getDatabase(this.app);
    const myMatchRef = ref(db, `players/${invite.hostId}/matches/${gameId}`);
    get(myMatchRef)
      .then((snapshot) => {
        const myMatchData = snapshot.val();
        if (!myMatchData) {
          console.log("got empty my match data");
          return;
        }
        this.myMatch = myMatchData;
        didRecoverMyMatch(myMatchData, gameId);

        if (invite.guestId && invite.guestId !== "") {
          this.observeMatch(invite.guestId, gameId);
        } else {
          didFindYourOwnInviteThatNobodyJoined();
          const inviteRef = ref(db, `invites/${gameId}`);
          onValue(inviteRef, (snapshot: any) => {
            const inviteData = snapshot.val();
            if (inviteData && inviteData.guestId) {
              console.log(`Guest ${inviteData.guestId} joined the invite ${gameId}`);
              this.observeMatch(inviteData.guestId, gameId);
              off(inviteRef);
            }
          });
        }
      })
      .catch((error) => {
        console.error("failed to get my match:", error);
      });
  }

  private enterWatchOnlyMode(gameId: string, hostId: string, guestId: string) {
    enterWatchOnlyMode();
    this.observeMatch(hostId, gameId);
    this.observeMatch(guestId, gameId);
  }

  private getOpponentsMatchAndCreateOwnMatch(gameId: string, hostId: string) {
    const db = getDatabase(this.app);
    const opponentsMatchRef = ref(db, `players/${hostId}/matches/${gameId}`);

    get(opponentsMatchRef)
      .then((snapshot) => {
        const opponentsMatchData = snapshot.val();
        if (!opponentsMatchData) {
          console.log("got empty opponent's match data");
          return;
        }

        const color = opponentsMatchData.color === "black" ? "white" : "black";
        const emojiId = getPlayersEmojiId();
        const match = {
          version: controllerVersion,
          color: color,
          emojiId: emojiId,
          fen: initialFen,
          status: "",
          flatMovesString: "",
          timer: "",
        };

        this.myMatch = match;

        set(ref(db, `players/${this.uid}/matches/${gameId}`), match)
          .then(() => {
            console.log("Player match created successfully");
          })
          .catch((error) => {
            console.error("Error creating player match:", error);
          });

        this.observeMatch(hostId, gameId);
      })
      .catch((error) => {
        console.error("failed to get opponent's match:", error);
      });
  }

  public createInvite(uid: string, inviteId: string) {
    const hostColor = Math.random() < 0.5 ? "white" : "black";
    const emojiId = getPlayersEmojiId();

    const invite = {
      version: controllerVersion,
      hostId: uid,
      hostColor: hostColor,
      guestId: null as any,
    };

    const db = getDatabase(this.app);
    set(ref(db, `invites/${inviteId}`), invite)
      .then(() => {
        console.log("Invite created successfully");
      })
      .catch((error) => {
        console.error("Error creating invite:", error);
      });

    const match = {
      version: controllerVersion,
      color: hostColor,
      emojiId: emojiId,
      fen: initialFen,
      status: "",
      flatMovesString: "",
      timer: "",
    };

    this.myMatch = match;
    this.uid = uid;
    this.gameId = inviteId;

    set(ref(db, `players/${uid}/matches/${inviteId}`), match)
      .then(() => {
        console.log("Player match created successfully");
      })
      .catch((error) => {
        console.error("Error creating player match:", error);
      });

    const inviteRef = ref(db, `invites/${inviteId}`);
    onValue(inviteRef, (snapshot: any) => {
      const inviteData = snapshot.val();
      if (inviteData && inviteData.guestId) {
        console.log(`Guest ${inviteData.guestId} joined the invite ${inviteId}`);
        this.observeMatch(inviteData.guestId, inviteId);
        off(inviteRef);
      }
    });
  }

  observeMatch(playerId: string, matchId: string) {
    const db = getDatabase(this.app);
    const matchRef = ref(db, `players/${playerId}/matches/${matchId}`);
    const ethAddressRef = ref(db, `players/${playerId}/ethAddress`);

    onValue(
      matchRef,
      (snapshot) => {
        const matchData = snapshot.val();
        console.log(matchData);
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
        const ethAddress = snapshot.val();
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
