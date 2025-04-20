import { render } from "preact";
import "./index.css";
import App from "./app.tsx";
import { FirebaseApp, FirebaseOptions, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig: FirebaseOptions = {
  apiKey: "AIzaSyBeOEWJ6Bj3Cxt4OdIZGTZwyELhyyuONU4",
  authDomain: "racemate-3dc5c.firebaseapp.com",
  projectId: "racemate-3dc5c",
  storageBucket: "racemate-3dc5c.firebasestorage.app",
  messagingSenderId: "935374379053",
  appId: "1:935374379053:web:87b6464781d479549600a4",
};

export const firebaseApp: FirebaseApp = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(firebaseApp);

render(<App />, document.getElementById("app")!);
