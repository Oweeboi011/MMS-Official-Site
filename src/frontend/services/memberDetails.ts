// Your own memberDetails/{uid} (rules: owner or admin; hasOnly the known fields).
import { deleteField, doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore/lite';
import { toDetails, toPatch, type Details } from '../data/memberDetails';
import { firebase } from './firebase';
import { readOnlyMessage, writesEnabled } from './firebaseEnv';

export async function myDetails(uid: string): Promise<Details> {
  return toDetails((await getDoc(doc(firebase().db, 'memberDetails', uid))).data());
}

export async function saveMyDetails(uid: string, details: Details): Promise<void> {
  if (!writesEnabled) throw new Error(readOnlyMessage);
  await setDoc(doc(firebase().db, 'memberDetails', uid), { ...Object.fromEntries(Object.entries(toPatch(details)).map(([k, v]) => [k, v ?? deleteField()])), updatedAt: serverTimestamp() }, { merge: true });
}
