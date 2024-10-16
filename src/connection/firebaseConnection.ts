import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";
import { getDatabase, ref, set, onValue, off, get } from "firebase/database";
import { didUpdateOpponentMatch, initialFen, didRecoverMyMatch, enterWatchOnlyMode } from "../game/gameController";
import { getPlayersEmojiId, didGetEthAddress } from "../game/board";

const controllerVersion = 2;

class FirebaseConnection {
  private app;
  private auth;

  private myMatch: any;
  private uid: string;
  public gameId: string;

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

  public async prepareOnchainVictoryTx(gameId: string): Promise<any> {
    try {
      const { getFunctions, httpsCallable } = await import("firebase/functions");
      const functions = getFunctions(this.app);
      const attestVictoryFunction = httpsCallable(functions, "attestVictory");
      const response = await attestVictoryFunction({ gameId });
      console.log("attestVictory response:", response.data);
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
      console.log("verifyEthAddress response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error verifying Ethereum address:", error);
      throw error;
    }
  }

  public updateEmoji(newId: number) {
    this.myMatch.emojiId = newId;
    this.sendMatchUpdate();
  }

  public sendVoiceReaction(reaction: any) {
    this.myMatch.reaction = reaction;
    this.sendMatchUpdate();
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

  public connectToGame(uid: string, inviteId: string) {
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
        console.log("Invite data retrieved:", inviteData);
        if (!inviteData.guestId && inviteData.hostId !== uid) {
          set(ref(db, `invites/${inviteId}/guestId`), uid)
            .then(() => {
              console.log("did join as a guest successfully");
              this.getOpponentsMatchAndCreateOwnMatch(inviteId, inviteData);
            })
            .catch((error) => {
              console.error("Error joining as a guest:", error);
            });
        } else {
          console.log("has guest or same host");
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
    console.log("will reconnect as guest");

    const db = getDatabase(this.app);
    const myMatchRef = ref(db, `players/${invite.guestId}/matches/${gameId}`);

    get(myMatchRef)
      .then((snapshot) => {
        const myMatchData = snapshot.val();
        if (!myMatchData) {
          console.log("got empty my match data");
          return;
        }
        console.log("got my match:", myMatchData);
        this.myMatch = myMatchData;
        didRecoverMyMatch(myMatchData, gameId);
        this.observeMatch(invite.hostId, gameId);
      })
      .catch((error) => {
        console.error("failed to get my match:", error);
      });
  }

  private reconnectAsHost(gameId: string, invite: any) {
    console.log("will reconnect as host");
    const db = getDatabase(this.app);
    const myMatchRef = ref(db, `players/${invite.hostId}/matches/${gameId}`);
    get(myMatchRef)
      .then((snapshot) => {
        const myMatchData = snapshot.val();
        if (!myMatchData) {
          console.log("got empty my match data");
          return;
        }
        console.log("got my match:", myMatchData);
        this.myMatch = myMatchData;
        didRecoverMyMatch(myMatchData, gameId);

        if (invite.guestId && invite.guestId !== "") {
          this.observeMatch(invite.guestId, gameId);
        } else {
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
    console.log("will enter watch only mode");
    enterWatchOnlyMode();
    this.observeMatch(hostId, gameId);
    this.observeMatch(guestId, gameId);
  }

  private getOpponentsMatchAndCreateOwnMatch(gameId: string, invite: any) {
    const db = getDatabase(this.app);
    const opponentsMatchRef = ref(db, `players/${invite.hostId}/matches/${gameId}`);

    get(opponentsMatchRef)
      .then((snapshot) => {
        const opponentsMatchData = snapshot.val();
        if (!opponentsMatchData) {
          console.log("got empty opponent's match data");
          return;
        }
        console.log("got opponent's match:", opponentsMatchData);

        const color = opponentsMatchData.color === "black" ? "white" : "black";
        const emojiId = getPlayersEmojiId();
        const match = {
          version: controllerVersion,
          color: color,
          emojiId: emojiId,
          fen: initialFen,
          status: "playing",
          flatMovesString: "",
        };

        this.myMatch = match;

        set(ref(db, `players/${this.uid}/matches/${gameId}`), match)
          .then(() => {
            console.log("Player match created successfully");
          })
          .catch((error) => {
            console.error("Error creating player match:", error);
          });

        this.observeMatch(invite.hostId, gameId);
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
      status: "waiting",
      flatMovesString: "",
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
          didUpdateOpponentMatch(matchData, playerId, matchId);
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
