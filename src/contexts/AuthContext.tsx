import { createContext } from "preact";
import { useContext, useEffect, useState } from "preact/hooks";
import {
  getAuth,
  onAuthStateChanged,
  signOut as firebaseSignOut,
  User,
  GoogleAuthProvider,
  signInWithPopup,
  OAuthProvider,
  GithubAuthProvider,
} from "firebase/auth";
import { firebaseApp } from "../main";

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithDiscord: () => Promise<void>;
  signInWithSteam: () => Promise<void>;
  signInWithGithub: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: any }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth(firebaseApp);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, [auth]);

  // Google sign-in
  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error signing in with Google:", error);
    }
  };

  // Discord sign-in
  const signInWithDiscord = async () => {
    // Discord uses OAuth provider in Firebase
    const provider = new OAuthProvider("discord.com");
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error signing in with Discord:", error);
    }
  };

  // Steam sign-in
  const signInWithSteam = async () => {
    // Steam uses OAuth provider in Firebase
    const provider = new OAuthProvider("oidc.steam");
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error signing in with Steam:", error);
    }
  };

  // GitHub sign-in
  const signInWithGithub = async () => {
    const provider = new GithubAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error signing in with GitHub:", error);
    }
  };

  const signOut = () => {
    return firebaseSignOut(auth);
  };

  const value = {
    currentUser,
    loading,
    signInWithGoogle,
    signInWithDiscord,
    signInWithSteam,
    signInWithGithub,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
