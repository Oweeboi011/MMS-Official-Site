// A member's registrations (old Open Climbs shape) → My Climbs rows.
import type { Doc } from '../lib/firestoreRest';
import { feeTotal, type FeeLine } from './registration';
import { pledgeInBalance, pledgeOf, type Pledge } from './donations';
import { REQUIRED_DOCS } from './requiredDocs';

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
  uploaded: string[]; // registration upload fields already holding a file
  receipts: { url: string; fileName: string }[]; // https only
  waiver: { name: string; signedAt: number; location: string } | null;
  pledge: Pledge | null;
  details: Details;
  name: string; // as registered
  paymentStatus: string;
  fees: FeeLine[]; // the fee lines this registration owes (selected ones)
  refunded: number;
  verifiedAt: number;
  payments: { amount: number; status: string; note: string }[];
}

// The fields a member may change after registering (rules: memberIsUpdatingOwnDetails).
export interface Details { mobile: string; ecName: string; ecMobile: string; ecRelationship: string; medicalConditions: string }

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

function receiptsOf(v: unknown) {
  return (Array.isArray(v) ? v : []).map((p) => (p ?? {}) as Doc)
    .filter((p) => str(p.url).startsWith('https://'))
    .map((p) => ({ url: str(p.url), fileName: str(p.fileName) || 'Receipt' }));
}

function detailsOf(d: Doc): Details {
  const ec = (d.emergencyContact ?? {}) as Doc;
  return { mobile: str(d.mobile), ecName: str(ec.name), ecMobile: str(ec.mobile), ecRelationship: str(ec.relationship), medicalConditions: str(d.medicalConditions) };
}

export function detailsProblem(x: Details): string | null {
  if (!x.mobile.trim() || !x.ecName.trim() || !x.ecMobile.trim() || !x.ecRelationship.trim()) return 'Mobile and all emergency contact fields are required.';
  return null;
}

export function toMyClimb(id: string, d: Doc): MyClimb {
  const status = str(d.status) || 'pending';
  const { total: fees, tba } = feeTotal(lines(d.feeBreakdown));
  const pledge = pledgeOf(d.donation);
  const total = fees + pledgeInBalance(pledge);
  return {
    id, climbId: str(d.climbId), title: str(d.climbTitle) || 'Climb', date: str(d.climbDate),
    status, statusLabel: STATUS[status] ?? status, paymentLabel: PAYMENT[str(d.paymentStatus)] ?? 'Not paid yet',
    paymentStatus: str(d.paymentStatus) || 'unpaid', fees: lines(d.feeBreakdown).filter((l) => l.selected), verifiedAt: millis(d.verifiedAt),
    refunded: (Array.isArray(d.refunds) ? d.refunds : []).reduce((t: number, r) => t + (Number(((r ?? {}) as Doc).amount) || 0), 0),
    pledge, total, tba, paid: typeof d.amountPaid === 'number' ? d.amountPaid : 0, createdAt: millis(d.createdAt),
    uploaded: REQUIRED_DOCS.map((t) => t.uploadField).filter((f) => d[f] && typeof d[f] === 'object'),
    receipts: receiptsOf(d.paymentProofs),
    details: detailsOf(d),
    name: str(d.name),
    payments: (Array.isArray(d.payments) ? d.payments : []).map((p) => (p ?? {}) as Doc).map((p) => ({ amount: typeof p.amount === 'number' ? p.amount : Number(p.amount) || 0, status: str(p.status) || 'submitted', note: str(p.note) })),
    waiver: d.waiverSigned === true ? { name: str(d.waiverSignedName), signedAt: millis(d.waiverSignedAt), location: str(d.climbLocation) } : null,
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

// What the member should do next, in order (old app My Climbs 'next steps').
const LIVE = ['pending', 'confirmed', 'waitlisted'];
const plural = (n: number) => (n === 1 ? '' : 's');

function todo(row: MyClimb, missing: number): string[] {
  const has = (status: string) => row.payments.some((p) => p.status === status);
  return [
    row.status === 'waitlisted' && 'You’re on the waitlist: we’ll tell you if a slot opens.',
    has('submitted') && 'Payment sent: officers will verify it.',
    has('rejected') && 'A payment was not accepted: check the note and send it again.',
    row.total > row.paid && row.status !== 'waitlisted' && 'Pay your balance below.',
    missing > 0 && `Upload ${missing} required document${plural(missing)}.`,
  ].filter((s): s is string => Boolean(s));
}

export function nextSteps(row: MyClimb, requiredUploads: string[]): string[] {
  if (!LIVE.includes(row.status)) return [];
  const steps = todo(row, requiredUploads.filter((f) => !row.uploaded.includes(f)).length);
  if (steps.length) return steps;
  return [row.status === 'confirmed' ? 'You’re confirmed. See you at the pre-climb meeting.' : 'All set on your side: officers will confirm your slot.'];
}
