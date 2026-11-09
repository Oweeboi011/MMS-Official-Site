// climbPrivate/{id} over the SDK (needs the signed-in user: rules let registrants and admins read).
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore/lite';
import { toClimbPrivate, type ClimbPrivate } from '../data/climbPrivate';
import { firebase } from './firebase';
import { readOnlyMessage, writesEnabled } from './firebaseEnv';

// null = not a registrant (permission denied) or nothing set yet.
export async function loadClimbPrivate(climbId: string): Promise<ClimbPrivate | null> {
  try {
    const snap = await getDoc(doc(firebase().db, 'climbPrivate', climbId));
    return snap.exists() ? toClimbPrivate(snap.data()) : null;
  } catch (e) {
    if ((e as { code?: string }).code === 'permission-denied') return null;
    throw e;
  }
}

export async function loadClimbPrivateRaw(climbId: string): Promise<Record<string, unknown>> {
  const snap = await getDoc(doc(firebase().db, 'climbPrivate', climbId));
  return snap.exists() ? snap.data() : {};
}

// Merge: the participants list (written by functions) is left alone.
export async function saveClimbPrivate(climbId: string, data: { preClimbMeetings: unknown; resources: unknown }): Promise<void> {
  if (!writesEnabled) throw new Error(readOnlyMessage);
  await setDoc(doc(firebase().db, 'climbPrivate', climbId), { ...data, updatedAt: serverTimestamp() }, { merge: true });
}
