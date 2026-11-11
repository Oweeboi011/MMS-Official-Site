// The Firestore side of the admin Insights page: every registration and climb, recent notifications and failures.
// Admins read all of these (rules); each read is independent so one denied collection doesn't blank the page.
import { collection, getDocs, limit, orderBy, query } from 'firebase/firestore/lite';
import { toAdminReg, type AdminReg } from '../data/adminRegistrations';
import { toClimbFacts, type ClimbFacts, type Failure } from '../data/insightStats';
import { firebase } from './firebase';
import { listUsers } from './users';

const millis = (v: unknown) => (v && typeof v === 'object' && 'toMillis' in v ? (v as { toMillis: () => number }).toMillis() : 0);
const settled = <T>(p: Promise<T>, fallback: T) => p.catch(() => fallback);

export interface InsightData { regs: AdminReg[]; climbs: ClimbFacts[]; failures: Failure[]; noticeTypes: string[]; users: number }

export async function loadInsightData(): Promise<InsightData> {
  const { db } = firebase();
  const [regSnap, climbSnap, failSnap, noticeSnap, users] = await Promise.all([
    getDocs(query(collection(db, 'registrations'), limit(1000))),
    getDocs(query(collection(db, 'climbs'), limit(500))),
    settled(getDocs(query(collection(db, 'failedRequests'), orderBy('createdAt', 'desc'), limit(300))), null),
    settled(getDocs(query(collection(db, 'notifications'), orderBy('createdAt', 'desc'), limit(500))), null),
    settled(listUsers(), []),
  ]);
  return {
    regs: regSnap.docs.map((d) => toAdminReg(d.id, d.data())),
    climbs: climbSnap.docs.map((d) => toClimbFacts(d.id, d.data())),
    failures: (failSnap?.docs ?? []).map((d) => ({ source: String(d.data().source ?? ''), message: String(d.data().message ?? ''), createdAt: millis(d.data().createdAt) })),
    noticeTypes: (noticeSnap?.docs ?? []).map((d) => String(d.data().type ?? '')),
    users: users.length,
  };
}
