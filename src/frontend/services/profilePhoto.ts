// Your own profile photo: one private file per member (storage.rules: owner and admins only) and a hasPhoto flag on memberDetails.
import { deleteField, doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore/lite';
import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { compressImage } from '../lib/compressImage';
import { firebase } from './firebase';
import { readOnlyMessage, writesEnabled } from './firebaseEnv';
import { bucket } from './uploads';

const photoRef = (uid: string) => ref(bucket(), `profile-photos/${uid}/avatar`);
const detailsDoc = (uid: string) => doc(firebase().db, 'memberDetails', uid);

export async function myPhotoUrl(uid: string): Promise<string> {
  if (!(await getDoc(detailsDoc(uid))).data()?.hasPhoto) return '';
  return getDownloadURL(photoRef(uid));
}

export async function savePhoto(uid: string, original: File): Promise<string> {
  if (!writesEnabled) throw new Error(readOnlyMessage);
  const file = await compressImage(original);
  const snap = await uploadBytes(photoRef(uid), file, { contentType: file.type || undefined });
  await setDoc(detailsDoc(uid), { hasPhoto: true, updatedAt: serverTimestamp() }, { merge: true });
  return getDownloadURL(snap.ref);
}

export async function removePhoto(uid: string): Promise<void> {
  if (!writesEnabled) throw new Error(readOnlyMessage);
  await deleteObject(photoRef(uid));
  await setDoc(detailsDoc(uid), { hasPhoto: deleteField(), updatedAt: serverTimestamp() }, { merge: true });
}
