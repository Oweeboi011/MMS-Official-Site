// Which documents each climb requires, for the registrations list. Admin read of `climbs` (public anyway).
import { collection, getDocs, limit, query } from 'firebase/firestore/lite';
import { toClimbFacts, type ClimbFacts } from '../data/insightStats';
import { firebase } from './firebase';

export async function loadClimbFlags(): Promise<ClimbFacts[]> {
  const snap = await getDocs(query(collection(firebase().db, 'climbs'), limit(500)));
  return snap.docs.map((d) => toClimbFacts(d.id, d.data()));
}
