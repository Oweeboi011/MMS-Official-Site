// #144 outreach donation drives (old app utils/donations): members pledge cash and/or items on a registration.
// Cash sent with fees joins the balance; it is the beneficiary's money, not the club's.
type Doc = Record<string, unknown>;
const str = (v: unknown) => (typeof v === 'string' ? v.trim() : '');

export interface Drive { beneficiary: string; description: string; items: string[] }
export interface Pledge { cashPledge: number | null; inKind: string; payWithFees: boolean }

export function driveOf(d: Doc): Drive | null {
  const drive = (d.donationDrive ?? {}) as Doc;
  if (drive.enabled !== true) return null;
  const needed = Array.isArray(drive.neededItems) ? drive.neededItems.map((i) => str((i as Doc)?.name)).filter(Boolean) : [];
  const suggested = str(drive.suggestedItems).split('\n').map((s) => s.trim()).filter(Boolean);
  return { beneficiary: str(drive.beneficiary), description: str(drive.description), items: needed.length ? needed : suggested };
}

export function pledgeOf(v: unknown): Pledge | null {
  if (!v || typeof v !== 'object') return null;
  const p = v as Doc;
  return { cashPledge: typeof p.cashPledge === 'number' ? p.cashPledge : null, inKind: str(p.inKind), payWithFees: p.payWithFees === true };
}

const MAX_CASH = 1_000_000; // rules: pledgeIsValid
const MAX_TEXT = 500;

// Form → stored pledge (rules' shape), or null when nothing was pledged.
export function toPledge(cash: string, inKind: string, payWithFees: boolean): Pledge | null {
  const n = Number(cash.replace(/[^0-9.]/g, ''));
  const cashPledge = n > 0 ? Math.min(Math.round(n * 100) / 100, MAX_CASH) : null;
  const items = inKind.trim().slice(0, MAX_TEXT);
  if (!cashPledge && !items) return null;
  return { cashPledge, inKind: items, payWithFees: Boolean(cashPledge) && payWithFees };
}

// The part of a pledge added to what the member pays by GCash.
export const pledgeInBalance = (p: Pledge | null) => (p?.payWithFees && p.cashPledge ? p.cashPledge : 0);
