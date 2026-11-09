// A member's registrations (old Open Climbs shape) → My Climbs rows.
import type { Doc } from '../lib/firestoreRest';
import { feeTotal, type FeeLine } from './registration';

export interface MyClimb {
  id: string;
  climbId: string;
  title: string;
  date: string;
  status: string;
  statusLabel: string;
  paymentLabel: string;
  total: number;
  tba: boolean;
  paid: number;
  createdAt: number;
}

const str = (v: unknown) => (typeof v === 'string' ? v : '');
const STATUS: Record<string, string> = {
  pending: 'Pending confirmation', confirmed: 'Confirmed', waitlisted: 'Waitlisted', cancelled: 'Cancelled', rejected: 'Not accepted',
};
const PAYMENT: Record<string, string> = { unpaid: 'Not paid yet', submitted: 'Payment under review', verified: 'Payment verified', rejected: 'Payment not accepted' };
const millis = (v: unknown) => (v && typeof v === 'object' && 'toMillis' in v ? (v as { toMillis: () => number }).toMillis() : 0);

function lines(v: unknown): FeeLine[] {
  return (Array.isArray(v) ? v : []).map((l) => {
    const o = (l ?? {}) as Doc;
    return { label: str(o.label), amount: typeof o.amount === 'number' ? String(o.amount) : str(o.amount), optional: o.optional === true, selected: o.selected !== false };
  });
}

export function toMyClimb(id: string, d: Doc): MyClimb {
  const status = str(d.status) || 'pending';
  const { total, tba } = feeTotal(lines(d.feeBreakdown));
  return {
    id, climbId: str(d.climbId), title: str(d.climbTitle) || 'Climb', date: str(d.climbDate),
    status, statusLabel: STATUS[status] ?? status, paymentLabel: PAYMENT[str(d.paymentStatus)] ?? 'Not paid yet',
    total, tba, paid: typeof d.amountPaid === 'number' ? d.amountPaid : 0, createdAt: millis(d.createdAt),
  };
}

export const newestFirst = (rows: MyClimb[]) => [...rows].sort((a, b) => b.createdAt - a.createdAt);

// Members may withdraw until the climb is over (old app registrationPolicy); later, an admin handles it.
export const canCancel = (row: MyClimb, climbOver: boolean) => ['pending', 'confirmed', 'waitlisted'].includes(row.status) && !climbOver;

// DRAFT club-wide refund policy from mms-open-climbs: the windows and percentages are for officers to confirm (#125).
export const draftCancellationPolicy = [
  'To cancel, use Cancel registration here (or message the climb officers).',
  '15 days or more before the climb: full refund of fees paid, less anything already paid out on your behalf (permits, guide or porter fees, bookings).',
  '7 to 14 days before: 50% refund of fees paid, less anything already paid out on your behalf.',
  'Less than 7 days before, or not showing up: no refund.',
  'If MMS cancels or postpones the climb, you can move to the new date or get a full refund of fees not yet spent.',
  'Refunds are sent by GCash within 14 days. Donations are not refundable once handed over.',
];
