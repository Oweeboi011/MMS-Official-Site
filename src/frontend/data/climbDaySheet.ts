// #96 / #153 climb-day sheet (old app ClimbDaySheet): who's coming, emergency contacts, health, waiver/docs, balance.
// Confidential: health + emergency details; printed for the jump-off, then destroyed (RA 10173).
import type { AdminReg } from './adminRegistrations';

type Doc = Record<string, unknown>;
const str = (v: unknown) => (typeof v === 'string' ? v.trim() : '');

export interface SheetRow { id: string; name: string; type: string; mobile: string; emergency: string; medical: string; waiver: string; docs: number; balance: number; tba: boolean; pledge: string }

export function sheetRows(regs: AdminReg[]): SheetRow[] {
  return regs
    .filter((r) => r.status === 'confirmed' || r.status === 'pending')
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((r) => {
      const ec = (r.raw.emergencyContact ?? {}) as Doc;
      const emergency = [str(ec.name), str(ec.relationship) && `(${str(ec.relationship)})`, str(ec.mobile)].filter(Boolean).join(' ');
      const pledge = r.pledge ? [r.pledge.cashPledge && `₱${r.pledge.cashPledge}${r.pledge.payWithFees ? ' with fees' : ' cash on the day'}`, r.pledge.inKind].filter(Boolean).join(' · ') : '';
      return {
        id: r.id, name: r.name || '(no name)', type: r.memberType, mobile: r.mobile, emergency, medical: str(r.raw.medicalConditions),
        waiver: r.waiver ? `signed: ${r.waiver.name}` : 'NOT signed', docs: r.uploaded.length, balance: Math.max(r.total - r.paid, 0), tba: r.tba, pledge,
      };
    });
}

export function sheetTotals(rows: SheetRow[]) {
  return {
    people: rows.length,
    withMedical: rows.filter((r) => r.medical).length,
    unsignedWaivers: rows.filter((r) => r.waiver === 'NOT signed').length,
    owing: rows.filter((r) => r.balance > 0).length,
  };
}
