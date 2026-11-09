// Officer view of one climb's registrations (old Open Climbs shapes; payment logic from its utils/payments.js).
import type { Doc } from '../lib/firestoreRest';
import { toMyClimb, type MyClimb } from './myClimbs';

export type EntryStatus = 'submitted' | 'verified' | 'rejected';
interface PaymentEntry { amount: number; proofs: { url: string; fileName: string }[]; status: EntryStatus; note: string; submittedAt: unknown; raw: Doc }

export interface AdminReg extends MyClimb {
  name: string;
  email: string;
  mobile: string;
  memberType: string;
  notes: string;
  payments: PaymentEntry[];
  raw: Doc;
}

const str = (v: unknown) => (typeof v === 'string' ? v : '');
const amountOf = (v: unknown) => {
  const n = Number.parseFloat(String(v ?? '').replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) ? n : 0;
};
const statusOf = (v: unknown): EntryStatus => (v === 'verified' || v === 'rejected' ? v : 'submitted');

function entriesOf(d: Doc): PaymentEntry[] {
  return (Array.isArray(d.payments) ? d.payments : []).map((p) => {
    const o = (p ?? {}) as Doc;
    const proofs = (Array.isArray(o.proofs) ? o.proofs : []).map((x) => (x ?? {}) as Doc).filter((x) => str(x.url).startsWith('https://')).map((x) => ({ url: str(x.url), fileName: str(x.fileName) || 'Receipt' }));
    return { amount: amountOf(o.amount), proofs, status: statusOf(o.status), note: str(o.note), submittedAt: o.submittedAt, raw: o };
  });
}

export function toAdminReg(id: string, d: Doc): AdminReg {
  return { ...toMyClimb(id, d), name: str(d.name), email: str(d.email), mobile: str(d.mobile), memberType: str(d.memberType) === 'member' ? 'Member' : 'Guest', notes: str(d.adminNotes), payments: entriesOf(d), raw: d };
}

export function derivePaymentStatus(entries: { status: EntryStatus }[]): string {
  if (!entries.length) return 'unpaid';
  if (entries.some((e) => e.status === 'submitted')) return 'submitted';
  return entries.some((e) => e.status === 'verified') ? 'verified' : 'rejected';
}

// Reviews one payment; payments, amountPaid and paymentStatus always move together (old buildPaymentPatch).
export function reviewPayment(reg: AdminReg, index: number, status: 'verified' | 'rejected', reviewer: { name: string; uid: string }, now: unknown) {
  const at = new Date().toISOString(); // serverTimestamp() isn't allowed inside arrays
  const payments = reg.payments.map((e, i) => (i === index ? { ...e.raw, status, reviewedBy: reviewer.name || reviewer.uid, reviewedAt: at } : e.raw));
  const rolled = rollUp(payments);
  const paymentStatus = rolled.paymentStatus;
  return {
    ...rolled,
    verifiedAt: paymentStatus === 'verified' ? now : null,
    verifiedBy: paymentStatus === 'verified' ? { name: reviewer.name, uid: reviewer.uid } : null,
    updatedAt: now,
  };
}

export const REG_STATUSES = ['pending', 'confirmed', 'waitlisted', 'cancelled', 'rejected'] as const;

export function summary(regs: AdminReg[]) {
  const count = (s: string) => regs.filter((r) => r.status === s).length;
  return {
    confirmed: count('confirmed'), pending: count('pending'), waitlisted: count('waitlisted'), cancelled: count('cancelled'),
    toReview: regs.filter((r) => r.payments.some((p) => p.status === 'submitted')).length,
    collected: regs.reduce((sum, r) => sum + r.paid, 0),
  };
}

// CSV for the LGU / jump-off (old app columns). Cells starting = + - @ are prefixed so spreadsheets never run them.
const day = (v: unknown) => (v && typeof v === 'object' && 'toDate' in v ? (v as { toDate: () => Date }).toDate().toLocaleDateString('en-PH', { timeZone: 'Asia/Manila' }) : '');
const cell = (v: unknown) => {
  const text = String(v ?? '');
  const safe = /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
  return `"${safe.replace(/"/g, '""')}"`;
};

export const CSV_HEADERS = ['#', 'Name', 'Email', 'Mobile', 'Date of Birth', 'Address', 'Experience', 'Type', 'EC Name', 'EC Relationship', 'EC Mobile', 'Medical Conditions', 'Status', 'Payment Status', 'Amount Paid', 'Payment Breakdown', 'Registration Form Uploaded', 'Medical Cert Uploaded', 'Waiver Signed As', 'Waiver Date', 'Registered'];

export function toCsv(regs: AdminReg[]): string {
  const rows = regs.map((r, i) => {
    const d = r.raw;
    const ec = (d.emergencyContact ?? {}) as Doc;
    return [
      i + 1, r.name, r.email, r.mobile, d.dateOfBirth, d.address, d.experienceLevel, r.memberType, ec.name, ec.relationship, ec.mobile, d.medicalConditions,
      r.status, d.paymentStatus, r.paid, r.payments.map((p) => [p.amount, p.status, p.note && `(${p.note})`].filter(Boolean).join(' ')).join('; '),
      r.uploaded.includes('registrationFormUpload') ? 'Yes' : 'No', r.uploaded.includes('medicalCertUpload') ? 'Yes' : 'No',
      d.waiverSignedName, day(d.waiverSignedAt), day(d.createdAt),
    ];
  });
  return [CSV_HEADERS, ...rows].map((row) => row.map(cell).join(',')).join('\r\n');
}

export interface WalkIn { name: string; mobile: string; email: string; memberType: 'member' | 'joiner'; status: 'confirmed' | 'pending' | 'waitlisted'; cash: string; notes: string }
export const emptyWalkIn = (): WalkIn => ({ name: '', mobile: '', email: '', memberType: 'joiner', status: 'confirmed', cash: '', notes: '' });

export function walkInProblem(w: WalkIn): string | null {
  if (!w.name.trim()) return 'Enter the participant’s name.';
  if (w.cash.trim() && amountOf(w.cash) <= 0) return 'Cash received: a peso amount, or leave blank.';
  return null;
}

// Someone added by an officer (no account): old app AddJoinerModal shape. Cash handed over is recorded as verified.
export function walkInDoc(climb: { id: string; title: string; dateLabel: string; location: string }, w: WalkIn, recorder: string, now: unknown, stamp: unknown) {
  const cash = amountOf(w.cash);
  const payments = cash > 0 ? [{ amount: cash, proofs: [], submittedAt: stamp, status: 'verified', recordedBy: recorder, note: 'Cash, recorded by an officer' }] : [];
  return {
    climbId: climb.id, climbTitle: climb.title, climbDate: climb.dateLabel, climbLocation: climb.location,
    userId: null, name: w.name.trim(), email: w.email.trim(), mobile: w.mobile.trim(), memberType: w.memberType,
    emergencyContact: { name: '', mobile: '', relationship: '' }, medicalConditions: '', experienceLevel: 'beginner',
    waiverSigned: false, status: w.status, paymentStatus: cash > 0 ? 'verified' : 'unpaid', amountPaid: cash > 0 ? cash : null,
    paymentProofs: [], payments, adminNotes: w.notes.trim() || 'Added by an officer (walk-in), not self-registered.',
    addedByAdmin: true, createdAt: now, updatedAt: now, ...(w.status === 'confirmed' ? { confirmedAt: now } : {}),
  };
}

// All-registrations search: name, email, mobile or climb.
export function matches(reg: AdminReg, text: string, status: string): boolean {
  const q = text.trim().toLowerCase();
  const hay = [reg.name, reg.email, reg.mobile, reg.title].join(' ').toLowerCase();
  return (!q || hay.includes(q)) && (!status || reg.status === status);
}

// Refunds live apart from `payments` (members append to payments; a refund must never be overwritten by them).
const refundList = (d: Doc) => (Array.isArray(d.refunds) ? d.refunds.map((r) => (r ?? {}) as Doc) : []);
export const refundedTotal = (reg: AdminReg) => refundList(reg.raw).reduce((t, r) => t + amountOf(r.amount), 0);

export function refundPatch(reg: AdminReg, amount: number, note: string, recordedBy: string, stamp: unknown, now: unknown) {
  const refund = { id: `r${Date.now().toString(36)}`, amount: Math.round(amount * 100) / 100, proofs: [], refundedAt: stamp, recordedBy, ...(note.trim() ? { note: note.trim().slice(0, 500) } : {}) };
  return { refunds: [...refundList(reg.raw), refund], updatedAt: now };
}

// No-show is a flag, not a status: the registration stays confirmed (old app utils/noShow).
export const noShowPatch = (noShow: boolean, markedBy: string, now: unknown) => ({
  noShow, noShowMarkedBy: noShow ? markedBy : null, noShowMarkedAt: noShow ? now : null, updatedAt: now,
});

export interface Expense { label: string; amount: number }
export const expensesTotal = (items: Expense[]) => items.reduce((t, e) => t + e.amount, 0);

// payments + amountPaid + paymentStatus always move together (old buildPaymentPatch).
function rollUp(payments: Doc[]) {
  return {
    payments,
    amountPaid: payments.filter((p) => statusOf(p.status) !== 'rejected').reduce((sum, p) => sum + amountOf(p.amount), 0),
    paymentStatus: derivePaymentStatus(payments.map((p) => ({ status: statusOf(p.status) }))),
  };
}

const round2 = (n: number) => Math.round(n * 100) / 100;

// #153 split (old utils/splitPayment): one GCash payment covered friends on the same climb. Each share moves off the
// payer's entry onto the friend's own history, with the receipt and verdict; both sides carry the same splitId.
export function splitPatches(payer: AdminReg, index: number, shares: { reg: AdminReg; amount: number }[], actor: string, splitId: (i: number) => string) {
  const entry = payer.payments[index];
  if (!entry) throw new Error('That payment no longer exists.');
  if (entry.status === 'rejected') throw new Error('A rejected payment can’t be split.');
  if (entry.raw.paidBy) throw new Error('This payment was split onto this record from someone else’s; it can’t be split again.');
  const parts = shares.map((s, i) => ({ reg: s.reg, amount: round2(s.amount), splitId: splitId(i) })).filter((s) => s.amount > 0);
  if (!parts.length) throw new Error('Choose who else this payment covers and how much.');
  if (parts.some((s) => s.reg.id === payer.id)) throw new Error('A payment can’t be split onto the person who paid it.');
  const moved = round2(parts.reduce((t, s) => t + s.amount, 0));
  if (moved > entry.amount + 0.005) throw new Error(`Only ₱${entry.amount.toLocaleString('en-PH')} is left on this payment to split.`);
  const original = (entry.raw.originalAmount as number | undefined) ?? entry.amount;
  const prior = Array.isArray(entry.raw.splitTo) ? (entry.raw.splitTo as Doc[]) : [];
  const payerPayments = payer.payments.map((e, i) => (i !== index ? e.raw : {
    ...e.raw, amount: round2(entry.amount - moved), originalAmount: original,
    splitTo: [...prior, ...parts.map((s) => ({ registrationId: s.reg.id, name: s.reg.name, amount: s.amount, splitId: s.splitId }))],
  }));
  const recipients = parts.map((s) => ({
    id: s.reg.id,
    patch: rollUp([...s.reg.payments.map((p) => p.raw), {
      amount: s.amount, proofs: entry.raw.proofs ?? [], submittedAt: entry.raw.submittedAt ?? null, status: entry.status,
      paidBy: { registrationId: payer.id, name: payer.name, splitId: s.splitId },
      note: `Paid by ${payer.name || 'another registrant'}: part of their ₱${original.toLocaleString('en-PH')} payment`, recordedBy: actor,
    }]),
  }));
  return { payer: rollUp(payerPayments), recipients, moved };
}
