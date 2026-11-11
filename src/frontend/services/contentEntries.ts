// contentEntries: officers submit page data, reviewers publish (rules: firestore.rules, ADR 0010).
import { addDoc, collection, deleteDoc, doc, getDocs, limit, query, serverTimestamp, updateDoc, where } from 'firebase/firestore/lite';
import { cleanData, toEntry, type Entry, type EntryStatus } from '../data/contentEntries';
import type { ContentPage } from '../data/contentRights';
import { logAudit } from './auditLog';
import type { Account } from './auth';
import { firebase } from './firebase';
import { readOnlyMessage, writesEnabled } from './firebaseEnv';

const entries = () => collection(firebase().db, 'contentEntries');
const newestFirst = (rows: Entry[]) => [...rows].sort((a, b) => b.updatedAt - a.updatedAt);

// Reviewers read every entry; anyone else only their own (a query must match the rule).
export async function loadEntries(account: Account, reviewer: boolean): Promise<Entry[]> {
  const q = reviewer ? query(entries(), limit(300)) : query(entries(), where('submittedBy', '==', account.uid), limit(300));
  return newestFirst((await getDocs(q)).docs.map((d) => toEntry(d.id, d.data())));
}

export interface EntryInput { id?: string; page: ContentPage; title: string; data: Record<string, string>; status: EntryStatus }

export async function saveEntry(account: Account, input: EntryInput, reviewer: boolean): Promise<void> {
  if (!writesEnabled) throw new Error(readOnlyMessage);
  const body = { title: input.title.trim(), data: cleanData(input.page, input.data), status: input.status, updatedAt: serverTimestamp() };
  const publishing = input.status === 'published';
  if (input.id) {
    await updateDoc(doc(firebase().db, 'contentEntries', input.id), { ...body, ...(publishing ? { publishedAt: serverTimestamp() } : {}), ...(reviewer && publishing ? { reviewedBy: account.uid } : {}) });
  } else {
    await addDoc(entries(), {
      ...body, page: input.page, submittedBy: account.uid, submittedByName: account.name || account.email, createdAt: serverTimestamp(),
      ...(publishing ? { publishedAt: serverTimestamp() } : {}), ...(reviewer && publishing ? { reviewedBy: account.uid } : {}),
    });
  }
  await logAudit({ action: `content ${input.id ? 'edited' : 'submitted'} (${input.status})`, targetType: 'content', targetId: input.id ?? input.page, targetLabel: input.title, details: input.page });
}

// A reviewer's decision: publish, reject with a note, or take a published entry back to draft.
export async function reviewEntry(account: Account, entry: Entry, status: EntryStatus, note = ''): Promise<void> {
  if (!writesEnabled) throw new Error(readOnlyMessage);
  const decided = { status, reviewedBy: account.uid, note: note.trim().slice(0, 500), updatedAt: serverTimestamp(), ...(status === 'published' ? { publishedAt: serverTimestamp() } : {}) };
  await updateDoc(doc(firebase().db, 'contentEntries', entry.id), decided);
  await logAudit({ action: `content ${status}`, targetType: 'content', targetId: entry.id, targetLabel: entry.title, details: entry.page });
}

export async function removeEntry(entry: Entry): Promise<void> {
  if (!writesEnabled) throw new Error(readOnlyMessage);
  await deleteDoc(doc(firebase().db, 'contentEntries', entry.id));
  await logAudit({ action: 'content deleted', targetType: 'content', targetId: entry.id, targetLabel: entry.title, details: entry.page });
}
