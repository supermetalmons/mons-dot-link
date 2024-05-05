import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged, signInAnonymously } from "firebase/auth";

class FirebaseConnection {
  private app;
  private auth;

  constructor() {
    const firebaseConfig = {
      apiKey: "AIzaSyC709PHiVSQqIvCqaJwx3h9Mg55ysgBrRg",
      authDomain: "mons-e34e5.firebaseapp.com",
      databaseURL: "https://mons-e34e5-default-rtdb.firebaseio.com",
      projectId: "mons-e34e5",
      storageBucket: "mons-e34e5.appspot.com",
      messagingSenderId: "949028813912",
      appId: "1:949028813912:web:d06d6dfaa574ca920fde2d",
    };

    this.app = initializeApp(firebaseConfig);
    this.auth = getAuth(this.app);

    onAuthStateChanged(this.auth, (user) => {
      if (user) {
        console.log(user.uid);
      } else {
        console.log("no user");
      }
    });
  }

  public signIn() {
    signInAnonymously(this.auth)
      .then(() => {
        console.log("did sign in");
        console.log(this.auth.currentUser.uid);
      })
      .catch((error) => {
        console.log("failed to sign in");
      });
  }
}

export const firebaseConnection = new FirebaseConnection();