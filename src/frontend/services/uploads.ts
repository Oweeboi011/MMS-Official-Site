// Member uploads: receipts and required documents (storage.rules: own folder, create-only, ≤ 10 MB) + the registration update.
import { arrayUnion, doc, serverTimestamp, Timestamp, updateDoc } from 'firebase/firestore/lite';
import { connectStorageEmulator, getDownloadURL, getStorage, ref, uploadBytes, type FirebaseStorage } from 'firebase/storage';
import { firebase } from './firebase';
import { readOnlyMessage, storageBucket, useEmulators, writesEnabled } from './firebaseEnv';

let storage: FirebaseStorage | null = null;
function bucket(): FirebaseStorage {
  if (storage) return storage;
  storage = getStorage(firebase().app, `gs://${storageBucket}`);
  if (useEmulators) connectStorageEmulator(storage, '127.0.0.1', 9199);
  return storage;
}

interface Uploaded { url: string; fileName: string }

const safeName = (name: string) => name.replace(/[^\w.-]+/g, '_').slice(-80);

async function upload(prefix: string, climbId: string, uid: string, file: File): Promise<Uploaded> {
  if (!writesEnabled) throw new Error(readOnlyMessage);
  const path = `${prefix}/${climbId}/${uid}/${Date.now()}_${safeName(file.name)}`;
  const snap = await uploadBytes(ref(bucket(), path), file, { contentType: file.type || undefined });
  return { url: await getDownloadURL(snap.ref), fileName: file.name };
}

export interface PaymentInput { registrationId: string; climbId: string; uid: string; amount: number; previousPaid: number; note: string; files: File[] }

// One new unreviewed payment entry appended; amountPaid = previous + this (rules: memberAppendsOnePayment).
export async function submitPayment(p: PaymentInput): Promise<void> {
  const proofs = await Promise.all(p.files.map((f) => upload('payment-proofs', p.climbId, p.uid, f)));
  const entry = { amount: p.amount, proofs, submittedAt: Timestamp.now(), status: 'submitted', ...(p.note.trim() ? { note: p.note.trim().slice(0, 500) } : {}) };
  await updateDoc(doc(firebase().db, 'registrations', p.registrationId), {
    payments: arrayUnion(entry), paymentProofs: arrayUnion(...proofs), amountPaid: p.previousPaid + p.amount,
    paymentStatus: 'submitted', paymentSubmittedAt: serverTimestamp(), verifiedAt: null, verifiedBy: null, updatedAt: serverTimestamp(),
  });
}

export async function submitDocument(registrationId: string, climbId: string, uid: string, prefix: string, field: string, file: File): Promise<void> {
  const uploaded = await upload(prefix, climbId, uid, file);
  await updateDoc(doc(firebase().db, 'registrations', registrationId), { [field]: uploaded, updatedAt: serverTimestamp() });
}
