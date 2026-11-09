// Admin side of `registrations` (rules: admins read and update any). Lazy: /admin/climbs/:id only.
import { Timestamp, addDoc, collection, doc, getDocs, limit, orderBy, query, serverTimestamp, updateDoc, where } from 'firebase/firestore/lite';
import { reviewPayment, toAdminReg, walkInDoc, type AdminReg, type WalkIn } from '../data/adminRegistrations';
import { logAudit } from './auditLog';
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

export async function setRegistrationStatus(id: string, status: string, label = '') {
  await patch(id, { status, updatedAt: serverTimestamp() });
  await logAudit({ action: 'registration status', targetType: 'registration', targetId: id, targetLabel: label, details: status });
}

export async function reviewRegistrationPayment(reg: AdminReg, index: number, status: 'verified' | 'rejected', reviewer: { name: string; uid: string }) {
  await patch(reg.id, reviewPayment(reg, index, status, reviewer, serverTimestamp()));
  await logAudit({ action: `payment ${status}`, targetType: 'registration', targetId: reg.id, targetLabel: `${reg.name} · ${reg.title}`, details: `₱${reg.payments[index]?.amount ?? 0}` });
}

export async function setAdminNotes(id: string, notes: string, label = '') {
  await patch(id, { adminNotes: notes.trim().slice(0, 2000), updatedAt: serverTimestamp() });
  await logAudit({ action: 'notes edited', targetType: 'registration', targetId: id, targetLabel: label });
}

export async function addWalkIn(climb: { id: string; title: string; dateLabel: string; location: string }, w: WalkIn, recorder: string): Promise<void> {
  if (!writesEnabled) throw new Error(readOnlyMessage);
  const ref = await addDoc(collection(firebase().db, 'registrations'), walkInDoc(climb, w, recorder, serverTimestamp(), Timestamp.now()));
  await logAudit({ action: 'walk-in added', targetType: 'registration', targetId: ref.id, targetLabel: `${w.name} · ${climb.title}`, details: w.cash ? `cash ₱${w.cash}` : '' });
}

// Newest 300 across all climbs, for search (old app AllRegistrations).
export async function recentRegistrations(): Promise<AdminReg[]> {
  const snap = await getDocs(query(collection(firebase().db, 'registrations'), orderBy('createdAt', 'desc'), limit(300)));
  return snap.docs.map((d) => toAdminReg(d.id, d.data()));
}
