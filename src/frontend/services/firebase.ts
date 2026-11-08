// Firebase lives only in services/ (this file, auth.ts, siteData.ts). Loaded on sign-in/admin routes only.
import { initializeApp, type FirebaseApp } from 'firebase/app';
import { connectAuthEmulator, getAuth, type Auth } from 'firebase/auth';
import { connectFirestoreEmulator, getFirestore, type Firestore } from 'firebase/firestore/lite';

const env = import.meta.env;
const config = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  appId: env.VITE_FIREBASE_APP_ID,
};

export const firebaseConfigured = Boolean(config.apiKey && config.projectId);

let cached: { app: FirebaseApp; auth: Auth; db: Firestore } | null = null;

export function firebase() {
  if (cached) return cached;
  if (!firebaseConfigured) throw new Error('Firebase is not configured (VITE_FIREBASE_* in .env.local).');
  const app = initializeApp(config);
  const auth = getAuth(app);
  const db = getFirestore(app, 'openclimbs');
  // Local CRUD testing against `firebase emulators:start`; dev server only, so a leftover flag can't ship.
  if (env.DEV && env.VITE_USE_EMULATORS === 'true') {
    connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
    connectFirestoreEmulator(db, '127.0.0.1', 8080);
  }
  cached = { app, auth, db };
  return cached;
}
