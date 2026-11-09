// #135 admin user management: list accounts and set roles (rules: admins update any users/{uid} except
// canEmailMembers / createdAt; the syncAdminClaim trigger mirrors role into the token claim).
import { collection, doc, getDocs, limit, query, serverTimestamp, updateDoc } from 'firebase/firestore/lite';
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
