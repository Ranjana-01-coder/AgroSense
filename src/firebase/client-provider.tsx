
'use client';

import React, { ReactNode, useState, useEffect } from 'react';
import { initializeFirebase, FirebaseProvider } from '@/firebase';
import { FirebaseApp } from 'firebase/app';
import { Firestore } from 'firebase/firestore';
import { Auth } from 'firebase/auth';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

interface FirebaseInstances {
  firebaseApp: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
}

/**
 * A client-side component that ensures Firebase is initialized only once.
 * It provides the Firebase instances to the FirebaseProvider.
 */
export const FirebaseClientProvider: React.FC<FirebaseClientProviderProps> = ({ children }) => {
  const [firebaseInstances, setFirebaseInstances] = useState<FirebaseInstances | null>(null);

  useEffect(() => {
    // initializeFirebase() is idempotent, but we only want to set state once.
    if (!firebaseInstances) {
      const instances = initializeFirebase();
      setFirebaseInstances(instances);
    }
  }, [firebaseInstances]); // Only run this effect once on mount

  // Render a loading state or null while Firebase is initializing
  if (!firebaseInstances) {
    return null; 
  }

  // Once initialized, render the actual provider with the instances
  return (
    <FirebaseProvider
      firebaseApp={firebaseInstances.firebaseApp}
      firestore={firebaseInstances.firestore}
      auth={firebaseInstances.auth}
    >
      {children}
    </FirebaseProvider>
  );
};
