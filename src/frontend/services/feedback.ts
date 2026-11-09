// #146 rate a climb: one `feedback/{climbId}_{uid}` per member (rules: registrants only, create once, 1–5).
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore/lite';
import { firebase } from './firebase';
import { readOnlyMessage, writesEnabled } from './firebaseEnv';

const id = (climbId: string, uid: string) => `${climbId}_${uid}`;

// Your earlier rating for this climb, or null.
export async function myRating(climbId: string, uid: string): Promise<number | null> {
  const snap = await getDoc(doc(firebase().db, 'feedback', id(climbId, uid)));
  return snap.exists() ? Number(snap.data().rating) : null;
}

export interface Rating { climbId: string; climbTitle: string; uid: string; name: string; rating: number; comments: string }

export async function rateClimb(r: Rating): Promise<void> {
  if (!writesEnabled) throw new Error(readOnlyMessage);
  await setDoc(doc(firebase().db, 'feedback', id(r.climbId, r.uid)), {
    climbId: r.climbId, climbTitle: r.climbTitle.slice(0, 200), userId: r.uid, name: r.name.slice(0, 120),
    rating: Math.round(r.rating), comments: r.comments.trim().slice(0, 2000), createdAt: serverTimestamp(),
  });
}
