import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged, signInAnonymously } from "firebase/auth";
import { getDatabase, ref, set, onValue, off, get } from "firebase/database";
import { didUpdateOpponentMatch, initialFen, didRecoverMyMatch, enterWatchOnlyMode } from ".";

const controllerVersion = 2;

class FirebaseConnection {
  private app;
  private auth;

  private myMatch: any; // TODO: make these are cleaned up for a new game
  private uid: string;
  private gameId: string;

  constructor() {
    const firebaseConfig = {
      apiKey: process.env.MONS_FIREBASE_API_KEY || "AIzaSyC709PHiVSQqIvCqaJwx3h9Mg55ysgBrRg",
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

  public sendMove(moveFen: string, newBoardFen: string) {
    this.myMatch.fen = newBoardFen;
    if (!this.myMatch.movesFens) {
      this.myMatch.movesFens = [];
    }

    if (this.myMatch.flatMovesString == "") {
      this.myMatch.flatMovesString = moveFen;
    } else {
      this.myMatch.flatMovesString += "-" + moveFen;
    }

    this.myMatch.movesFens.push(moveFen);

    const db = getDatabase(this.app);
    set(ref(db, `players/${this.uid}/matches/${this.gameId}`), this.myMatch)
      .then(() => {
        console.log("did send move successfully");
      })
      .catch((error) => {
        console.error("error sending a move", error);
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

  public connectToGame(uid: string, inviteId: string) {
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
        if (!inviteData.guestId && inviteData.hostId != uid) {
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
          if (inviteData.hostId == uid) {
            this.reconnectAsHost(inviteId, inviteData);
          } else if (inviteData.guestId == uid) {
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
    // TODO: implement
  }

  private reconnectAsHost(gameId: string, invite: any) {
    console.log("will reconnect as host");
    // TODO: implement
    // TODO: invite might be accepted or not
  }

  private enterWatchOnlyMode(gameId: string, hostId: string, guestId: string) {
    console.log("will enter watch only mode");
    // TODO: implement
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
        const emojiId = 1; // TODO: make it random
        const match = {
          version: controllerVersion,
          color: opponentsMatchData.color == "black" ? "white" : "black",
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
    const emojiId = 1; // TODO: make it random

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
    onValue(
      matchRef,
      (snapshot) => {
        const matchData = snapshot.val();
        console.log(matchData);
        if (matchData) {
          didUpdateOpponentMatch(matchData);
        }
      },
      (error) => {
        console.error("Error observing match data:", error);
      }
    );
  }
}

export const firebaseConnection = new FirebaseConnection();
