import { createContext } from "preact";
import { useContext, useEffect, useState } from "preact/hooks";
import {
  getAuth,
  onAuthStateChanged,
  signOut as firebaseSignOut,
  User,
  GoogleAuthProvider,
  signInWithPopup,
  GithubAuthProvider,
  fetchSignInMethodsForEmail,
  linkWithCredential,
} from "firebase/auth";
import { firebaseApp } from "../main";

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
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
    } catch (error: any) {
      console.error("Error signing in with Google:", error);
      
      // Handle the account-exists-with-different-credential error
      if (error.code === 'auth/account-exists-with-different-credential') {
        await handleAccountLinking(error, 'google.com');
      }
    }
  };

  

  // GitHub sign-in
  const signInWithGithub = async () => {
    const provider = new GithubAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error("Error signing in with GitHub:", error);
      
      // Handle the account-exists-with-different-credential error
      if (error.code === 'auth/account-exists-with-different-credential') {
        await handleAccountLinking(error, 'github.com');
      }
    }
  };

    // Helper function to handle account linking
  const handleAccountLinking = async (error: any, providerName: string) => {
    // Get the email from the error
    const email = error.customData?.email;
    if (!email) return;
    
    // Fetch sign-in methods for this email
    const methods = await fetchSignInMethodsForEmail(auth, email);
    
    if (!methods || methods.length === 0) return;
    
    // Get the first provider ID (e.g., 'google.com')
    const firstProvider = methods[0];
    
    // Create the right provider object
    let existingProvider;
    if (firstProvider === 'google.com') {
      existingProvider = new GoogleAuthProvider();
    } else if (firstProvider === 'github.com') {
      existingProvider = new GithubAuthProvider();
    }
    
    if (!existingProvider) return;
    
    // Sign in with the existing provider first
    try {
      const result = await signInWithPopup(auth, existingProvider);
      
      // Link the new credential to the existing account
      if (result.user) {
        // Get the credential from the error
        let newCredential;
        
        if (providerName === 'google.com') {
          newCredential = GoogleAuthProvider.credentialFromError(error);
        } else if (providerName === 'github.com') {
          newCredential = GithubAuthProvider.credentialFromError(error);
        }
        
        if (newCredential) {
          // Link the accounts
          await linkWithCredential(result.user, newCredential);
          console.log('Accounts successfully linked');
        }
      }
    } catch (linkError) {
      console.error('Error linking accounts:', linkError);
    }
  };

  const signOut = () => {
    return firebaseSignOut(auth);
  };

  const value = {
    currentUser,
    loading,
    signInWithGoogle,
    signInWithGithub,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
