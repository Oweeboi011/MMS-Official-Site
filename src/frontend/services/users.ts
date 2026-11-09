// #135 admin user management: list accounts and set roles (rules: admins update any users/{uid} except
// canEmailMembers / createdAt; the syncAdminClaim trigger mirrors role into the token claim).
import { getFunctions, httpsCallable } from 'firebase/functions';
import { collection, doc, getDocs, limit, query, serverTimestamp, updateDoc, where } from 'firebase/firestore/lite';
import { logAudit } from './auditLog';
import { firebase } from './firebase';
import { readOnlyMessage, writesEnabled } from './firebaseEnv';

export interface UserRow { uid: string; email: string; name: string; role: string }

export async function listUsers(): Promise<UserRow[]> {
  const snap = await getDocs(query(collection(firebase().db, 'users'), limit(500)));
  return snap.docs.map((d) => {
    const v = d.data();
    return { uid: d.id, email: String(v.email ?? ''), name: String(v.name ?? v.displayName ?? ''), role: String(v.role ?? 'member') };
  }).sort((a, b) => a.email.localeCompare(b.email));
}

export async function setRole(uid: string, role: 'member' | 'admin', label = ''): Promise<void> {
  if (!writesEnabled) throw new Error(readOnlyMessage);
  await updateDoc(doc(firebase().db, 'users', uid), { role, updatedAt: serverTimestamp() });
  await logAudit({ action: 'role changed', targetType: 'user', targetId: uid, targetLabel: label, details: role });
}

const callable = <I, O>(name: string) => httpsCallable<I, O>(getFunctions(firebase().app, 'asia-southeast1'), name);

// createUser callable: makes the Auth account + users doc; its welcome email needs Brevo (item 8), so emailSent may be false.
export async function createAccount(email: string, displayName: string): Promise<{ uid: string; emailSent: boolean }> {
  if (!writesEnabled) throw new Error(readOnlyMessage);
  const { data } = await callable<{ email: string; displayName: string }, { uid: string; emailSent: boolean }>('createUser')({ email: email.trim(), displayName: displayName.trim() });
  await logAudit({ action: 'account created', targetType: 'user', targetId: data.uid, targetLabel: email });
  return data;
}

// deleteUserAccount callable: removes the Auth account and profile (it refuses your own).
export async function deleteAccount(uid: string, label: string): Promise<void> {
  if (!writesEnabled) throw new Error(readOnlyMessage);
  await callable<{ uid: string }, { success: boolean }>('deleteUserAccount')({ uid });
  await logAudit({ action: 'account deleted', targetType: 'user', targetId: uid, targetLabel: label });
}

// A walk-in (added by an officer, no account) joins an account by email, so it shows on their My Climbs.
export async function linkWalkIn(registrationId: string, email: string, label: string): Promise<void> {
  if (!writesEnabled) throw new Error(readOnlyMessage);
  const snap = await getDocs(query(collection(firebase().db, 'users'), where('email', '==', email.trim().toLowerCase()), limit(1)));
  if (snap.empty) throw new Error(`No account with ${email}. Create it under Accounts and roles first.`);
  const uid = snap.docs[0].id;
  await updateDoc(doc(firebase().db, 'registrations', registrationId), { userId: uid, email: email.trim().toLowerCase(), updatedAt: serverTimestamp() });
  await logAudit({ action: 'walk-in linked', targetType: 'registration', targetId: registrationId, targetLabel: label, details: email });
}
