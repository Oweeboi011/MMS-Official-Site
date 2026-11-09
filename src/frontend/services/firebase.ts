// Firebase SDK (auth + admin CRUD), loaded on sign-in/admin routes only. Public pages read over REST: publicData.ts.
import { initializeApp, type FirebaseApp } from 'firebase/app';
import { ReCaptchaEnterpriseProvider, initializeAppCheck } from 'firebase/app-check';
import { connectAuthEmulator, getAuth, type Auth } from 'firebase/auth';
import { connectFirestoreEmulator, getFirestore, type Firestore } from 'firebase/firestore/lite';
import { DATABASE_ID, FIRESTORE_EMULATOR, appCheckSiteKey, firebaseConfig, firebaseConfigured, useEmulators } from './firebaseEnv';

export { firebaseConfigured };

let cached: { app: FirebaseApp; auth: Auth; db: Firestore } | null = null;

export function firebase() {
  if (cached) return cached;
  if (!firebaseConfigured) throw new Error('Firebase is not configured (VITE_FIREBASE_* in .env.local).');
  const app = initializeApp(firebaseConfig);
  // Monitor mode (item 21): tokens are sent, nothing is enforced yet. Emulators don't check them.
  if (appCheckSiteKey && !useEmulators) {
    initializeAppCheck(app, { provider: new ReCaptchaEnterpriseProvider(appCheckSiteKey), isTokenAutoRefreshEnabled: true });
  }
  const auth = getAuth(app);
  const db = getFirestore(app, DATABASE_ID);
  if (useEmulators) {
    connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
    connectFirestoreEmulator(db, FIRESTORE_EMULATOR.host, FIRESTORE_EMULATOR.port);
  }
  cached = { app, auth, db };
  return cached;
}
