// #78 "My details" (memberDetails/{uid}: private to the member and admins). Limits mirror firestore.rules.
type Doc = Record<string, unknown>;

export const LEVELS = [['beginner', 'Beginner'], ['intermediate', 'Intermediate'], ['experienced', 'Experienced']] as const;
// The Four Tribes of the annual Sportsfest (site: Training → Sportsfest).
export const TRIBES = [['aeta', 'Aeta'], ['badjao', 'Badjao'], ['mangyan', 'Mangyan'], ['tasaday', 'Tasaday']] as const;

export interface Details {
  fullName: string; nickname: string; mobile: string; dateOfBirth: string; address: string; experienceLevel: string; medicalConditions: string;
  ecName: string; ecMobile: string; ecRelationship: string; batch: string; tribe: string;
}

export const MAX = { fullName: 120, nickname: 60, mobile: 40, dateOfBirth: 20, address: 300, medicalConditions: 2000, ecName: 120, ecMobile: 40, ecRelationship: 60, batch: 80 } as const;
export const EMPTY: Details = { fullName: '', nickname: '', mobile: '', dateOfBirth: '', address: '', experienceLevel: '', medicalConditions: '', ecName: '', ecMobile: '', ecRelationship: '', batch: '', tribe: '' };

const str = (v: unknown) => (typeof v === 'string' ? v : '');
const oneOf = (v: unknown, options: readonly (readonly [string, string])[]) => (options.some(([k]) => k === v) ? (v as string) : '');

export function toDetails(d: Doc | undefined): Details {
  if (!d) return EMPTY;
  return {
    fullName: str(d.fullName), nickname: str(d.nickname), mobile: str(d.mobile), dateOfBirth: str(d.dateOfBirth), address: str(d.address), medicalConditions: str(d.medicalConditions),
    ecName: str(d.ecName), ecMobile: str(d.ecMobile), ecRelationship: str(d.ecRelationship), batch: str(d.batch),
    experienceLevel: oneOf(d.experienceLevel, LEVELS), tribe: oneOf(d.tribe, TRIBES),
  };
}

export function validate(d: Details): string {
  const tooLong = (Object.keys(MAX) as (keyof typeof MAX)[]).find((k) => d[k].trim().length > MAX[k]);
  return tooLong ? `Too long: ${tooLong} (max ${MAX[tooLong]} characters).` : '';
}

// Trimmed values; a blank answer comes back as null so the service can delete the field (rules reject '' for the choices).
export function toPatch(d: Details): Record<string, string | null> {
  return Object.fromEntries(Object.entries(d).map(([k, v]) => [k, v.trim() || null]));
}

// Fields officers rely on for an emergency; shown as a gentle nudge, never a block.
export const missingEmergency = (d: Details) => !d.ecName.trim() || !d.ecMobile.trim();
