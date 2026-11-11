// #163 audit trail of sensitive admin actions (old app shape; rules: admins create + read, nobody edits or deletes).
import { addDoc, collection, getDocs, limit, orderBy, query, serverTimestamp } from 'firebase/firestore/lite';
import { firebase } from './firebase';

export interface AuditEvent { action: string; targetType: 'registration' | 'climb' | 'user' | 'content'; targetId: string; targetLabel?: string; details?: string }
export interface AuditEntry extends AuditEvent { id: string; actorName: string; createdAt: number }

// Best effort: a logging failure must never block the action it describes.
export async function logAudit(e: AuditEvent): Promise<void> {
  const user = firebase().auth.currentUser;
  try {
    await addDoc(collection(firebase().db, 'auditLog'), {
      actorUid: user?.uid ?? null, actorName: user?.email ?? 'Admin', action: e.action, targetType: e.targetType,
      targetId: e.targetId, targetLabel: (e.targetLabel ?? '').slice(0, 200), details: (e.details ?? '').slice(0, 500), createdAt: serverTimestamp(),
    });
  } catch {
    // best effort
  }
}

const millis = (v: unknown) => (v && typeof v === 'object' && 'toMillis' in v ? (v as { toMillis: () => number }).toMillis() : 0);

export async function recentAudit(max = 200): Promise<AuditEntry[]> {
  const snap = await getDocs(query(collection(firebase().db, 'auditLog'), orderBy('createdAt', 'desc'), limit(max)));
  return snap.docs.map((d) => {
    const v = d.data();
    return { id: d.id, actorName: String(v.actorName ?? ''), action: String(v.action ?? ''), targetType: v.targetType, targetId: String(v.targetId ?? ''),
      targetLabel: String(v.targetLabel ?? ''), details: String(v.details ?? ''), createdAt: millis(v.createdAt) };
  });
}
