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
  return { ...toMyClimb(id, d), name: str(d.name), email: str(d.email), mobile: str(d.mobile), memberType: str(d.memberType) === 'member' ? 'Member' : 'Guest', payments: entriesOf(d), raw: d };
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
  const statuses = payments.map((p) => ({ status: statusOf(p.status) }));
  const paymentStatus = derivePaymentStatus(statuses);
  return {
    payments,
    amountPaid: payments.filter((p) => statusOf(p.status) !== 'rejected').reduce((sum, p) => sum + amountOf(p.amount), 0),
    paymentStatus,
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
