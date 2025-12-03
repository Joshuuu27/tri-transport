import {
  type User,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup,
  onAuthStateChanged as _onAuthStateChanged,
} from 'firebase/auth';

import { firebaseAuth } from './firebase.browser';

export function onAuthStateChanged(callback: (authUser: User | null) => void) {
  return _onAuthStateChanged(firebaseAuth, callback);
}

import { getAuth } from "firebase/auth";

export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  const auth = getAuth();

  const result = await signInWithPopup(auth, provider);
  const user = result.user;

  return {
    uid: user.uid,
    idToken: await user.getIdToken(),
  };
}

export async function signInWithFacebook() {
  const provider = new FacebookAuthProvider();
  const auth = getAuth();
  const result = await signInWithPopup(auth, provider);
  const user = result.user;
  return {
    uid: user.uid,
    idToken: await user.getIdToken(),
  };
}


export async function signOutWithGoogle() {
  try {
    await firebaseAuth.signOut();
  } catch (error) {
    console.error('Error signing out with Google', error);
  }
}