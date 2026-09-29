'use client';
import {
  Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  signInAnonymously as firebaseSignInAnonymously,
} from 'firebase/auth';

export const signInWithEmail = async (auth: Auth, email: string, password: string): Promise<void> => {
  await signInWithEmailAndPassword(auth, email, password);
};

export const signUpWithEmail = async (auth: Auth, email: string, password: string): Promise<void> => {
  await createUserWithEmailAndPassword(auth, email, password);
};

export const signInAnonymously = async (auth: Auth): Promise<void> => {
  await firebaseSignInAnonymously(auth);
};

export const logout = async (auth: Auth): Promise<void> => {
  await signOut(auth);
};

export const updateUserProfile = async (
  auth: Auth,
  displayName: string,
  photoURL?: string
): Promise<void> => {
  if (auth.currentUser) {
    await updateProfile(auth.currentUser, { displayName, photoURL });
  } else {
    throw new Error('No user is currently signed in.');
  }
};
