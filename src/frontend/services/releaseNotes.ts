// Published release notes, newest first (rules: signed-in read; index status + publishedAt desc).
import { collection, getDocs, limit, orderBy, query, where } from 'firebase/firestore/lite';
import { toReleaseNote, type ReleaseNote } from '../data/releaseNotes';
import { firebase } from './firebase';

export async function publishedNotes(max = 20): Promise<ReleaseNote[]> {
  const snap = await getDocs(query(collection(firebase().db, 'releaseNotes'), where('status', '==', 'published'), orderBy('publishedAt', 'desc'), limit(max)));
  return snap.docs.map((d) => toReleaseNote(d.id, d.data()));
}
