// #151 admin dashboard: every climb with its registration counts, headline totals and the newest registrations. Counts use
// aggregate queries (one read per 1,000 matches), so the whole page stays cheap.
import { collection, getCount, getDocs, limit, orderBy, query, where, type QueryConstraint } from 'firebase/firestore/lite';
import { toAdminReg } from '../data/adminRegistrations';
import { mapClimb } from '../data/climbs';
import type { DashboardData, DashboardRow } from '../data/dashboardModel';
import { feeItemsFromDoc, feeModel, pesoLabel } from '../data/feeModel';
import { firebase } from './firebase';

// The member total for a dense list: "₱3,590", "₱3,590+" when some fee is still TBA, or "TBA".
function feeLabel(model: ReturnType<typeof feeModel>): string {
  if (!model.hasAmount) return 'TBA';
  return pesoLabel(String(model.total)) + (model.hasTba ? '+' : '');
}

export async function loadDashboard(now = new Date()): Promise<DashboardData> {
  const { db } = firebase();
  const regs = collection(db, 'registrations');
  const count = async (...constraints: QueryConstraint[]) => (await getCount(query(regs, ...constraints))).data().count;
  const forClimb = (climbId: string, field: string, value: string) => count(where('climbId', '==', climbId), where(field, '==', value));
  const [climbSnap, recentSnap, registrations, toReview, unpaid, pending] = await Promise.all([
    getDocs(query(collection(db, 'climbs'), orderBy('startDate', 'desc'), limit(100))),
    getDocs(query(regs, orderBy('createdAt', 'desc'), limit(10))),
    count(), count(where('paymentStatus', '==', 'submitted')), count(where('paymentStatus', '==', 'unpaid')), count(where('status', '==', 'pending')),
  ]);
  const rows: DashboardRow[] = await Promise.all(climbSnap.docs.map(async (d) => {
    const data = d.data();
    const [confirmed, pendingHere, waitlisted, unpaidHere, toReviewHere] = await Promise.all([
      forClimb(d.id, 'status', 'confirmed'), forClimb(d.id, 'status', 'pending'), forClimb(d.id, 'status', 'waitlisted'), forClimb(d.id, 'paymentStatus', 'unpaid'), forClimb(d.id, 'paymentStatus', 'submitted'),
    ]);
    const model = feeModel(feeItemsFromDoc(data.fees));
    return {
      climb: { ...mapClimb({ ...data, id: d.id }, now), id: d.id }, status: String(data.status ?? ''), confirmed, pending: pendingHere, waitlisted, unpaid: unpaidHere, toReview: toReviewHere,
      fee: feeLabel(model),
    };
  }));
  return {
    rows, totals: { climbs: rows.length, registrations, toReview, unpaid, pending },
    recent: recentSnap.docs.map((d) => toAdminReg(d.id, d.data())),
  };
}
