// Climb registration: form, checks and the Firestore doc (same shape as mms-open-climbs, so its functions and rules apply).
import { PRIVACY_NOTICE_VERSION } from './privacyNotice';

export interface FeeItem { label: string; amount: string; note: string; optional: boolean; isGuestFee: boolean }
export type MemberType = 'member' | 'joiner'; // joiner = guest (CONTEXT.md)

export interface RegistrationForm {
  fullName: string;
  mobile: string;
  dateOfBirth: string;
  address: string;
  ecName: string;
  ecMobile: string;
  ecRelationship: string;
  medicalConditions: string;
  experienceLevel: string;
  memberType: MemberType;
  waiverAgreed: boolean;
  privacyConsent: boolean;
  sigName: string;
  extras: Record<string, boolean>; // optional fees ticked, by label
}

export const EXPERIENCE_LEVELS = [
  ['beginner', 'Beginner (0–5 climbs)'],
  ['intermediate', 'Intermediate (5–20 climbs)'],
  ['experienced', 'Experienced (20+ climbs)'],
] as const;

export const initialForm = (): RegistrationForm => ({
  fullName: '', mobile: '', dateOfBirth: '', address: '', ecName: '', ecMobile: '', ecRelationship: '', medicalConditions: '',
  experienceLevel: 'beginner', memberType: 'joiner', waiverAgreed: false, privacyConsent: false, sigName: '', extras: {},
});

export type FormErrors = Partial<Record<keyof RegistrationForm, string>>;

const REQUIRED: [keyof RegistrationForm, string][] = [
  ['fullName', 'Enter your full name.'],
  ['mobile', 'Enter your mobile number.'],
  ['ecName', "Enter your emergency contact's name."],
  ['ecMobile', "Enter your emergency contact's mobile number."],
  ['ecRelationship', 'Enter your relationship to this contact.'],
];

// Field problems that block submitting, in page order.
export function validateRegistration(form: RegistrationForm): FormErrors {
  const errors: FormErrors = {};
  for (const [key, message] of REQUIRED) if (!String(form[key]).trim()) errors[key] = message;
  if (form.fullName.trim().length > 120) errors.fullName = 'At most 120 characters.';
  if (!form.waiverAgreed) errors.waiverAgreed = 'You must agree to the Waiver and Release of Liability.';
  if (form.sigName.trim().length < 3) errors.sigName = 'Type your full name (at least 3 characters) to sign the waiver.';
  if (!form.privacyConsent) errors.privacyConsent = 'Please agree to the Privacy Notice so we can process your registration.';
  return errors;
}

export interface FeeLine { label: string; amount: string; optional: boolean; selected: boolean }

// Guest fee follows member type (guests owe it, members never); other optional fees follow the ticks.
export function feeLines(fees: FeeItem[], memberType: MemberType, extras: Record<string, boolean>): FeeLine[] {
  return fees.map((f) => {
    let selected = !f.optional;
    if (f.isGuestFee) selected = memberType === 'joiner';
    else if (f.optional) selected = extras[f.label] === true;
    return { label: f.label, amount: f.amount, optional: f.optional, selected };
  });
}

const amountOf = (text: string) => Number.parseFloat(text.replace(/[^0-9.]/g, ''));

export function feeTotal(lines: FeeLine[]): { total: number; tba: boolean } {
  let total = 0;
  let tba = false;
  for (const l of lines.filter((x) => x.selected)) {
    const n = amountOf(l.amount);
    if (Number.isFinite(n)) total += n;
    else tba = true;
  }
  return { total, tba };
}

export interface ClimbRef { id: string; title: string; dateLabel: string; location: string }

// `now` = serverTimestamp(). Status, payment and verification fields are what the rules allow a member to create.
export function buildRegistrationDoc(climb: ClimbRef, user: { uid: string; email: string }, form: RegistrationForm, fees: FeeItem[], now: unknown) {
  const t = (s: string) => s.trim();
  return {
    climbId: climb.id, climbTitle: climb.title, climbDate: climb.dateLabel, climbLocation: climb.location,
    userId: user.uid, email: user.email,
    name: t(form.fullName), mobile: t(form.mobile), dateOfBirth: form.dateOfBirth, address: t(form.address),
    emergencyContact: { name: t(form.ecName), mobile: t(form.ecMobile), relationship: t(form.ecRelationship) },
    medicalConditions: t(form.medicalConditions), experienceLevel: form.experienceLevel, memberType: form.memberType,
    privacyConsentAt: now, privacyNoticeVersion: PRIVACY_NOTICE_VERSION,
    waiverSigned: true, waiverSignedAt: now, waiverSignedName: t(form.sigName),
    paymentProofs: [], payments: [], paymentStatus: 'unpaid', amountPaid: null, paymentSubmittedAt: null,
    feeBreakdown: feeLines(fees, form.memberType, form.extras),
    status: 'pending', createdAt: now,
  };
}
