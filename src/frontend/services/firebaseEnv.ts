// Firebase settings shared by the SDK client (firebase.ts) and the public REST reader (publicData.ts). No SDK import here.
const env = import.meta.env;

export const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  appId: env.VITE_FIREBASE_APP_ID,
};

export const firebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);
// reCAPTCHA Enterprise site key (public) for App Check; blank = App Check off.
export const appCheckSiteKey: string = env.VITE_APP_CHECK_SITE_KEY ?? '';
export const DATABASE_ID = 'openclimbs';
// Local CRUD testing against `firebase emulators:start`; dev server only, so a leftover flag can't ship.
export const useEmulators = Boolean(env.DEV && env.VITE_USE_EMULATORS === 'true');
export const FIRESTORE_EMULATOR = { host: '127.0.0.1', port: 8080 };
