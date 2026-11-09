// Admin side of `registrations` (rules: admins read and update any). Lazy: /admin/climbs/:id only.
import { Timestamp, addDoc, collection, doc, getDocs, limit, orderBy, query, serverTimestamp, updateDoc, where } from 'firebase/firestore/lite';
import { reviewPayment, toAdminReg, walkInDoc, type AdminReg, type WalkIn } from '../data/adminRegistrations';
import { firebase } from './firebase';
import { readOnlyMessage, writesEnabled } from './firebaseEnv';

export async function climbRegistrations(climbId: string): Promise<AdminReg[]> {
  const snap = await getDocs(query(collection(firebase().db, 'registrations'), where('climbId', '==', climbId), limit(500)));
  return snap.docs.map((d) => toAdminReg(d.id, d.data())).sort((a, b) => a.createdAt - b.createdAt);
}

async function patch(id: string, data: Record<string, unknown>) {
  if (!writesEnabled) throw new Error(readOnlyMessage);
  await updateDoc(doc(firebase().db, 'registrations', id), data);
}

export const setRegistrationStatus = (id: string, status: string) => patch(id, { status, updatedAt: serverTimestamp() });

export const reviewRegistrationPayment = (reg: AdminReg, index: number, status: 'verified' | 'rejected', reviewer: { name: string; uid: string }) =>
  patch(reg.id, reviewPayment(reg, index, status, reviewer, serverTimestamp()));

export const setAdminNotes = (id: string, notes: string) => patch(id, { adminNotes: notes.trim().slice(0, 2000), updatedAt: serverTimestamp() });

export async function addWalkIn(climb: { id: string; title: string; dateLabel: string; location: string }, w: WalkIn, recorder: string): Promise<void> {
  if (!writesEnabled) throw new Error(readOnlyMessage);
  await addDoc(collection(firebase().db, 'registrations'), walkInDoc(climb, w, recorder, serverTimestamp(), Timestamp.now()));
}

// Newest 300 across all climbs, for search (old app AllRegistrations).
export async function recentRegistrations(): Promise<AdminReg[]> {
  const snap = await getDocs(query(collection(firebase().db, 'registrations'), orderBy('createdAt', 'desc'), limit(300)));
  return snap.docs.map((d) => toAdminReg(d.id, d.data()));
}
