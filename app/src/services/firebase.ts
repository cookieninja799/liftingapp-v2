import { initializeApp } from 'firebase/app';
import { getAuth }       from 'firebase/auth';
import {
  getFirestore,
  enableIndexedDbPersistence,
} from 'firebase/firestore';
import Constants from 'expo-constants';

const {
  firebaseApiKey,
  firebaseAuthDomain,
  firebaseProjectId,
  firebaseStorageBucket,
  firebaseMessagingSenderId,
  firebaseAppId,
} = Constants.expoConfig!.extra!;   // the “!” tells TS it exists

const firebaseConfig = {
  apiKey:            firebaseApiKey,
  authDomain:        firebaseAuthDomain,
  projectId:         firebaseProjectId,
  storageBucket:     firebaseStorageBucket,
  messagingSenderId: firebaseMessagingSenderId,
  appId:             firebaseAppId,
};

export const app  = initializeApp(firebaseConfig);
export const auth = getAuth(app);

export const db   = getFirestore(app);

// Offline cache (web / native w/ SQLite)
enableIndexedDbPersistence(db).catch(() => {
  /* ignore if it already exists (e.g. multi‑tab) */
});
