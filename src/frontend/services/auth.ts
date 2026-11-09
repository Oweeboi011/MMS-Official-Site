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
import { firebase } from './firebase';

export interface Account {
  uid: string;
  email: string;
  role: string;
  emailVerified: boolean;
}

// First sign-in creates users/{uid}, role 'member' = any account (old-app value), not MMS membership.
// Guests and members alike; registrations.memberType sets the fee. Admins are set in the console.
async function roleOf(user: User): Promise<string> {
  const { db } = firebase();
  const ref = doc(db, 'users', user.uid);
  const snap = await getDoc(ref);
  if (snap.exists()) return String(snap.data().role ?? 'member');
  try {
    await setDoc(ref, { role: 'member', email: user.email ?? '', name: user.displayName ?? '', createdAt: serverTimestamp() });
    return 'member';
  } catch (e) {
    // Another tab created it first (rules then refuse a second createdAt): use that profile.
    if ((e as { code?: string }).code !== 'permission-denied') throw e;
    const again = await getDoc(ref);
    if (again.exists()) return String(again.data().role ?? 'member');
    throw e;
  }
}

export function watchAccount(onChange: (account: Account | null) => void, onError: (e: Error) => void) {
  let latest = 0; // a slow role lookup must not overwrite a later sign-out or account switch
  return onAuthStateChanged(firebase().auth, (user) => {
    const call = ++latest;
    if (!user) return onChange(null);
    roleOf(user)
      .then((role) => { if (call === latest) onChange({ uid: user.uid, email: user.email ?? '', role, emailVerified: user.emailVerified }); })
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
