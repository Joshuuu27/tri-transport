import { useState, useEffect } from "react";
import { firebaseAuth } from "@/lib/firebase.browser";
import type { User as FirebaseUser } from "firebase/auth";
import { onAuthStateChanged as _onAuthStateChanged } from "firebase/auth";
import { createUserWithEmailAndPassword as _createUserWithEmailAndPassword, signInWithEmailAndPassword as _signInWithEmailAndPassword, signOut as _signOut } from "firebase/auth";

// Define the shape of your formatted user
export type AuthUser = {
  uid: string;
  email: string | null;
};

// Function to format Firebase user
const formatAuthUser = (user: FirebaseUser): AuthUser => ({
  uid: user.uid,
  email: user.email,
});

export default function useFirebaseAuth() {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const clear = () => {
    setAuthUser(null);
    setLoading(true);
  };

    const signInWithEmailAndPassword = (email: string, password:string) =>
    _signInWithEmailAndPassword(firebaseAuth, email, password);

  const createUserWithEmailAndPassword = (email: string, password:string) =>
    _createUserWithEmailAndPassword(firebaseAuth, email, password);

  const signOut = () =>
    _signOut(firebaseAuth).then(clear);

  // Callback for auth state changes
  const authStateChanged = async (user: FirebaseUser | null) => {
    if (!user) {
      setAuthUser(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    const formattedUser = formatAuthUser(user);
    setAuthUser(formattedUser);

    setLoading(false);
  };

  // Wrapper around Firebase onAuthStateChanged
  const onAuthStateChanged = (cb: (user: FirebaseUser | null) => void) => {
    return _onAuthStateChanged(firebaseAuth, cb);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(authStateChanged);
    return () => unsubscribe();
  }, []);

  return { authUser, loading, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut };
}
