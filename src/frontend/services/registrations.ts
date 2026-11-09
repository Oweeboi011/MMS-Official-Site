// Member side of `registrations` (rules: own docs only; create while the climb is open).
import { addDoc, collection, doc, getDocs, limit, query, serverTimestamp, updateDoc, where } from 'firebase/firestore/lite';
import { newestFirst, toMyClimb, type MyClimb } from '../data/myClimbs';
import { buildRegistrationDoc, type ClimbRef, type FeeItem, type RegistrationForm } from '../data/registration';
import { firebase } from './firebase';
import { readOnlyMessage, writesEnabled } from './firebaseEnv';

// The rules only allow reading your own registrations, so the query must filter by userId.
export async function hasRegistered(climbId: string, uid: string): Promise<boolean> {
  const { db } = firebase();
  const snap = await getDocs(query(collection(db, 'registrations'), where('userId', '==', uid), where('climbId', '==', climbId), limit(1)));
  return !snap.empty;
}

export async function register(climb: ClimbRef, user: { uid: string; email: string }, form: RegistrationForm, fees: FeeItem[]): Promise<string> {
  if (!writesEnabled) throw new Error(readOnlyMessage);
  const ref = await addDoc(collection(firebase().db, 'registrations'), buildRegistrationDoc(climb, user, form, fees, serverTimestamp()));
  return ref.id;
}

export async function myRegistrations(uid: string): Promise<MyClimb[]> {
  const snap = await getDocs(query(collection(firebase().db, 'registrations'), where('userId', '==', uid), limit(100)));
  return newestFirst(snap.docs.map((d) => toMyClimb(d.id, d.data())));
}

// Exactly the fields the rules allow a member to change when withdrawing.
export async function cancelRegistration(id: string, reason: string): Promise<void> {
  if (!writesEnabled) throw new Error(readOnlyMessage);
  await updateDoc(doc(firebase().db, 'registrations', id), {
    status: 'cancelled', cancelledByMember: true, cancellationReason: reason.trim().slice(0, 500) || 'Cancelled by the member',
    cancelledAt: serverTimestamp(), updatedAt: serverTimestamp(),
  });
}
