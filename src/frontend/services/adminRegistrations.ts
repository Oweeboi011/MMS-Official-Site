// Admin side of `registrations` (rules: admins read and update any). Lazy: /admin/climbs/:id only.
import { collection, doc, getDocs, limit, query, serverTimestamp, updateDoc, where } from 'firebase/firestore/lite';
import { reviewPayment, toAdminReg, type AdminReg } from '../data/adminRegistrations';
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
