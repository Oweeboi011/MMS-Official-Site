// #151 admin dashboard: upcoming climbs with registration counts (count queries: 1 read per 1,000 matches, cheap).
import { collection, getCount, getDocs, limit, orderBy, query, where } from 'firebase/firestore/lite';
import { mapClimb, type ScheduleClimb } from '../data/climbs';
import { manilaDay, fromManilaDay } from '../lib/manila';
import { firebase } from './firebase';

export interface DashboardRow {
  climb: ScheduleClimb & { id: string };
  status: string;
  confirmed: number;
  pending: number;
  waitlisted: number;
  toReview: number;
}

export async function upcomingDashboard(now = new Date()): Promise<DashboardRow[]> {
  const { db } = firebase();
  const regs = collection(db, 'registrations');
  const snap = await getDocs(query(collection(db, 'climbs'), where('startDate', '>=', fromManilaDay(manilaDay(now))), orderBy('startDate'), limit(20)));
  const count = async (climbId: string, field: string, value: string) =>
    (await getCount(query(regs, where('climbId', '==', climbId), where(field, '==', value)))).data().count;
  return Promise.all(snap.docs.map(async (d) => {
    const data = d.data();
    const [confirmed, pending, waitlisted, toReview] = await Promise.all([
      count(d.id, 'status', 'confirmed'), count(d.id, 'status', 'pending'), count(d.id, 'status', 'waitlisted'), count(d.id, 'paymentStatus', 'submitted'),
    ]);
    return { climb: { ...mapClimb({ ...data, id: d.id }, now), id: d.id }, status: String(data.status ?? ''), confirmed, pending, waitlisted, toReview };
  }));
}
