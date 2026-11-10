// #157 / #156 admin insights: the ported insight callables + recent errors and page views (admin reads).
import { getFunctions, httpsCallable } from 'firebase/functions';
import { collection, getDocs, limit, orderBy, query, where } from 'firebase/firestore/lite';
import type { PageView } from '../data/insightStats';
import { firebase } from './firebase';

export const INSIGHTS = [
  ['getFunctionHealth', 'Functions (24 h)'],
  ['getStorageUsage', 'Storage'],
  ['getBillingCost', 'Billing this month'],
  ['getEmailStats', 'Email (Brevo)'],
] as const;

export async function callInsight(name: string): Promise<Record<string, unknown>> {
  const fn = httpsCallable(getFunctions(firebase().app, 'asia-southeast1'), name);
  return (await fn({})).data as Record<string, unknown>;
}

const millis = (v: unknown) => (v && typeof v === 'object' && 'toMillis' in v ? (v as { toMillis: () => number }).toMillis() : 0);

export async function recentErrors(max = 50) {
  const snap = await getDocs(query(collection(firebase().db, 'failedRequests'), orderBy('createdAt', 'desc'), limit(max)));
  return snap.docs.map((d) => ({ id: d.id, type: String(d.data().type ?? ''), source: String(d.data().source ?? ''), message: String(d.data().message ?? ''), path: String(d.data().path ?? ''), at: millis(d.data().createdAt) }));
}

// Page views in the window (max 2,000 reads), newest first.
export async function recentViews(days = 30): Promise<PageView[]> {
  const since = new Date(Date.now() - days * 86400_000);
  const snap = await getDocs(query(collection(firebase().db, 'pageViews'), where('timestamp', '>=', since), orderBy('timestamp', 'desc'), limit(2000)));
  return snap.docs.map((d) => ({ at: millis(d.data().timestamp), path: String(d.data().path ?? ''), session: String(d.data().sessionId ?? '') }));
}
