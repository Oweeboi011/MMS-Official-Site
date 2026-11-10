import type { FeeItem } from './registration';

// A climb's fees mix three kinds of line (old app feeSummary): required (everyone), optional (only if availed) and the
// guest fee (joiners only). The headline total is the required fees only; TBA lines are flagged, never counted as 0.
const amountOf = (text: string): number | null => {
  const n = parseFloat(text.replace(/[^0-9.]/g, ''));
  return Number.isNaN(n) ? null : n;
};

export const pesoLabel = (text: string): string => {
  const n = amountOf(text);
  return n === null ? text || 'TBA' : `₱${n.toLocaleString('en-PH')}`;
};

export function feeModel(items: FeeItem[]) {
  const guest = items.find((f) => f.isGuestFee) ?? null;
  const required = items.filter((f) => !f.isGuestFee && !f.optional);
  const optional = items.filter((f) => !f.isGuestFee && f.optional);
  const amounts = required.map((f) => amountOf(f.amount));
  const total = amounts.reduce<number>((sum, n) => sum + (n ?? 0), 0);
  return {
    required, optional, guest, total,
    hasTba: amounts.some((n) => n === null),
    hasAmount: amounts.some((n) => n !== null),
  };
}

// A climb document's `fees` array as fee items (label required; a blank amount is TBA).
export function feeItemsFromDoc(fees: unknown): FeeItem[] {
  return (Array.isArray(fees) ? fees : []).map((f) => (f ?? {}) as Record<string, unknown>).filter((f) => typeof f.label === 'string' && f.label).map((f) => ({
    label: String(f.label), amount: String(f.amount ?? '').trim() || 'TBA', note: typeof f.note === 'string' ? f.note : '', optional: f.optional === true, isGuestFee: f.isGuestFee === true,
  }));
}
