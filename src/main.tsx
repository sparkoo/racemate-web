import { render } from "preact";
import "./index.css";
import App from "./app.tsx";
import { FirebaseApp, FirebaseOptions, initializeApp } from "firebase/app";

const firebaseConfig: FirebaseOptions = {
  projectId: "racemate-3dc5c",
  storageBucket: "racemate-3dc5c.firebasestorage.app",
};

export const firebaseApp: FirebaseApp = initializeApp(firebaseConfig);

render(<App />, document.getElementById("app")!);
