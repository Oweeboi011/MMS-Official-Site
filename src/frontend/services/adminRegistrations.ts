// Admin side of `registrations` (rules: admins read and update any). Lazy: /admin/climbs/:id only.
import { Timestamp, addDoc, collection, doc, getDoc, getDocs, limit, orderBy, query, serverTimestamp, setDoc, updateDoc, where, writeBatch } from 'firebase/firestore/lite';
import { noShowPatch, refundPatch, reviewPayment, splitPatches, toAdminReg, walkInDoc, type AdminReg, type Expense, type WalkIn } from '../data/adminRegistrations';
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

export async function recordRefund(reg: AdminReg, amount: number, note: string, by: string) {
  await patch(reg.id, refundPatch(reg, amount, note, by, Timestamp.now(), serverTimestamp()));
  await logAudit({ action: 'refund recorded', targetType: 'registration', targetId: reg.id, targetLabel: `${reg.name} · ${reg.title}`, details: `₱${amount}` });
}

export async function setNoShow(reg: AdminReg, noShow: boolean, by: string) {
  await patch(reg.id, noShowPatch(noShow, by, serverTimestamp()));
  await logAudit({ action: noShow ? 'marked no-show' : 'no-show cleared', targetType: 'registration', targetId: reg.id, targetLabel: `${reg.name} · ${reg.title}` });
}

// climbExpenses/{climbId}: admin-only cost lines (old app ExpensesCard: items [{ label, amount }]).
export async function loadExpenses(climbId: string): Promise<Expense[]> {
  const snap = await getDoc(doc(firebase().db, 'climbExpenses', climbId));
  const items = snap.exists() && Array.isArray(snap.data().items) ? (snap.data().items as Record<string, unknown>[]) : [];
  return items.map((i) => ({ label: String(i.label ?? ''), amount: Number(i.amount) || 0 })).filter((i) => i.label);
}

export async function saveExpenses(climbId: string, items: Expense[]) {
  if (!writesEnabled) throw new Error(readOnlyMessage);
  await setDoc(doc(firebase().db, 'climbExpenses', climbId), { items, updatedAt: serverTimestamp() }, { merge: true });
  await logAudit({ action: 'expenses saved', targetType: 'climb', targetId: climbId, details: `${items.length} line(s)` });
}

// All registrations change together or not at all.
export async function splitPayment(payer: AdminReg, index: number, shares: { reg: AdminReg; amount: number }[], actor: string) {
  if (!writesEnabled) throw new Error(readOnlyMessage);
  const ids = crypto.getRandomValues(new Uint32Array(shares.length));
  const { payer: payerPatch, recipients, moved } = splitPatches(payer, index, shares, actor, (i) => `${Date.now().toString(36)}_${ids[i].toString(36)}`);
  const { db } = firebase();
  const batch = writeBatch(db);
  batch.update(doc(db, 'registrations', payer.id), { ...payerPatch, updatedAt: serverTimestamp() });
  for (const r of recipients) batch.update(doc(db, 'registrations', r.id), { ...r.patch, updatedAt: serverTimestamp() });
  await batch.commit();
  await logAudit({ action: 'payment split', targetType: 'registration', targetId: payer.id, targetLabel: `${payer.name} · ${payer.title}`, details: `₱${moved} to ${shares.map((s) => s.reg.name).join(', ')}` });
}
