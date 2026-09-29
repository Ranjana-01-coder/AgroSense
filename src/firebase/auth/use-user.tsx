
'use client';

import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { useAuth } from '@/firebase';

/**
 * Interface for the return value of the useUser hook.
 */
export interface UseUserResult {
  user: User | null; // The authenticated user object, or null.
  isLoading: boolean; // True while checking authentication state.
}

/**
 * React hook to get the current authenticated user from Firebase.
 * It listens for authentication state changes in real-time.
 *
 * @returns {UseUserResult} An object containing the user and loading state.
 */
export const useUser = (): UseUserResult => {
  const auth = useAuth();
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setIsLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [auth]);

  return { user, isLoading };
};
