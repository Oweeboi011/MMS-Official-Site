import { Timestamp, addDoc, collection, deleteDoc, deleteField, doc, getDocs, limit, query, serverTimestamp, setDoc } from 'firebase/firestore/lite';
import { fromForm, type CollectionSpec, type FormValues } from '../data/siteSchemas';
import { firebase } from './firebase';
import { readOnlyMessage, writesEnabled } from './firebaseEnv';
import { forgetPublicData } from './publicData';

export interface Row {
  id: string;
  data: Record<string, unknown>;
}

// Capped: public writes (inquiries) must not turn every tab open into an unbounded billed read.
export const MAX_ROWS = 200;

export async function listRows(spec: CollectionSpec): Promise<Row[]> {
  const snap = await getDocs(query(collection(firebase().db, spec.id), limit(MAX_ROWS)));
  return snap.docs.map((d) => ({ id: d.id, data: d.data() }));
}

// Edits merge (keeps fields the form doesn't show, e.g. reviews.feedbackId); blanked fields are deleted.
function assertWritable() {
  if (!writesEnabled) throw new Error(readOnlyMessage);
}

export async function saveRow(spec: CollectionSpec, id: string | null, values: FormValues, locked: string[] = []): Promise<string> {
  assertWritable();
  const { db } = firebase();
  const docId = spec.singleton ?? id;
  const fields = fromForm(spec, values, Timestamp.fromDate, docId ? deleteField() : undefined);
  for (const key of locked) { // never overwrite a value the form can't show
    const [head, tail] = key.split('.');
    if (!tail) delete fields[head];
    else if (fields[head] && typeof fields[head] === 'object') delete (fields[head] as Record<string, unknown>)[tail];
  }
  const data = { ...fields, updatedAt: serverTimestamp() };
  const saved = docId ?? (await addDoc(collection(db, spec.id), data)).id;
  if (docId) await setDoc(doc(db, spec.id, docId), data, { merge: true });
  forgetPublicData();
  return saved;
}

export async function removeRow(spec: CollectionSpec, id: string): Promise<void> {
  assertWritable();
  await deleteDoc(doc(firebase().db, spec.id, id));
  forgetPublicData();
}
