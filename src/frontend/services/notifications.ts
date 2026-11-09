// Your notifications (rules: owner reads; owner may only flip `read`). Index: userId + createdAt desc.
import { collection, doc, getDocs, limit, orderBy, query, updateDoc, where } from 'firebase/firestore/lite';
import { toNotice, type Notice } from '../data/notifications';
import { firebase } from './firebase';
import { readOnlyMessage, writesEnabled } from './firebaseEnv';

export async function myNotifications(uid: string): Promise<Notice[]> {
  const snap = await getDocs(query(collection(firebase().db, 'notifications'), where('userId', '==', uid), orderBy('createdAt', 'desc'), limit(30)));
  return snap.docs.map((d) => toNotice(d.id, d.data()));
}

export async function markRead(ids: string[]): Promise<void> {
  if (!writesEnabled) throw new Error(readOnlyMessage);
  await Promise.all(ids.map((id) => updateDoc(doc(firebase().db, 'notifications', id), { read: true })));
}
