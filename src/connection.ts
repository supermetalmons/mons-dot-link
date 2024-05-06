import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged, signInAnonymously } from "firebase/auth";
import { getDatabase, ref, set, onValue, off } from "firebase/database";
import { initialFen } from ".";

class FirebaseConnection {
  private app;
  private auth;

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

  public createInvite(uid: string, inviteId: string) {
    const controllerVersion = 2;
    const hostColor = "black"; // TODO: make it random
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
    };

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
        console.log(`Match data updated:`, matchData);
      },
      (error) => {
        console.error("Error observing match data:", error);
      }
    );
  }
}

export const firebaseConnection = new FirebaseConnection();
