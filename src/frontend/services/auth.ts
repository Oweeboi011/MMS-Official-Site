import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore/lite';
import { cleanGroups } from '../data/contentRights';
import { firebase } from './firebase';
import { setSignedInHint } from '../lib/signedInHint';

export interface Account {
  uid: string;
  email: string;
  role: string;
  emailVerified: boolean;
  name?: string; // the sign-in profile's display name, used to start a registration
  groups?: string[]; // BOT, ExeCom, TCom (users/{uid}.groups): what content they may submit
}

const fromProfile = (d: Record<string, unknown>) => ({ role: String(d.role ?? 'member'), groups: cleanGroups(d.groups) });

// First sign-in creates users/{uid}, role 'member' = any account (old-app value), not MMS membership.
// Guests and members alike; registrations.memberType sets the fee. Admins are set in the console.
async function profileOf(user: User): Promise<{ role: string; groups: string[] }> {
  const { db } = firebase();
  const ref = doc(db, 'users', user.uid);
  const snap = await getDoc(ref);
  if (snap.exists()) return fromProfile(snap.data());
  try {
    await setDoc(ref, { role: 'member', email: user.email ?? '', name: user.displayName ?? '', createdAt: serverTimestamp() });
    return { role: 'member', groups: [] };
  } catch (e) {
    // Another tab created it first (rules then refuse a second createdAt): use that profile.
    if ((e as { code?: string }).code !== 'permission-denied') throw e;
    const again = await getDoc(ref);
    if (again.exists()) return fromProfile(again.data());
    throw e;
  }
}

export function watchAccount(onChange: (account: Account | null) => void, onError: (e: Error) => void) {
  let latest = 0; // a slow role lookup must not overwrite a later sign-out or account switch
  return onAuthStateChanged(firebase().auth, (user) => {
    const call = ++latest;
    setSignedInHint(Boolean(user));
    if (!user) return onChange(null);
    profileOf(user)
      .then(({ role, groups }) => {
        if (call !== latest) return;
        setSignedInHint(true, role);
        onChange({ uid: user.uid, email: user.email ?? '', role, emailVerified: user.emailVerified, name: user.displayName ?? '', groups });
      })
      .catch((e: Error) => { if (call === latest) onError(e); });
  });
}

export const signInWithEmail = (email: string, password: string) =>
  signInWithEmailAndPassword(firebase().auth, email, password);
// New email accounts get a verification link right away (Google accounts are already verified).
export async function signUpWithEmail(email: string, password: string) {
  const cred = await createUserWithEmailAndPassword(firebase().auth, email, password);
  await sendEmailVerification(cred.user).catch(() => undefined); // the banner offers a resend
  return cred;
}
export async function resendVerification(): Promise<void> {
  const user = firebase().auth.currentUser;
  if (user && !user.emailVerified) await sendEmailVerification(user);
}
export const signInWithGoogle = () => signInWithPopup(firebase().auth, new GoogleAuthProvider());
export const resetPassword = (email: string) => sendPasswordResetEmail(firebase().auth, email);
export const signOut = () => firebaseSignOut(firebase().auth);
