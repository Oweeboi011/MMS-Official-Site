import type { AdminReg } from './adminRegistrations';
import { REQUIRED_DOCS } from './requiredDocs';

// Figures for the admin Insights page, ported from the old app's App Insights (mms-open-climbs). Pure: the page loads
// the documents, these count them.
const DAY = 86400000;
const millis = (v: unknown) => (v && typeof v === 'object' && 'toMillis' in v ? (v as { toMillis: () => number }).toMillis() : 0);
const day = (ms: number) => new Date(ms + 8 * 3600_000).toISOString().slice(0, 10); // Manila calendar day

export interface ClimbFacts { id: string; title: string; status: string; createdAt: number; requires: Record<string, boolean> }
// A climb reduced to what the admin figures need: its status, when it was made, and which documents it requires.
export function toClimbFacts(id: string, d: Record<string, unknown>): ClimbFacts {
  return {
    id, title: String(d.title ?? ''), status: String(d.status ?? ''), createdAt: millis(d.createdAt),
    requires: Object.fromEntries(REQUIRED_DOCS.map((t) => [t.requiresField, d[t.requiresField] === true])),
  };
}

export interface Failure { source: string; message: string; createdAt: number }

const active = (regs: AdminReg[]) => regs.filter((r) => r.status !== 'cancelled');
const paymentStatus = (r: AdminReg) => String(r.raw.paymentStatus ?? 'unpaid');

export const waiverRate = (regs: AdminReg[]): number => {
  const live = active(regs);
  return live.length ? Math.round((live.filter((r) => r.waiver).length / live.length) * 100) : 0;
};

export function paymentBreakdown(regs: AdminReg[]) {
  const live = active(regs);
  const count = (s: string) => live.filter((r) => paymentStatus(r) === s).length;
  return { total: live.length, verified: count('verified'), submitted: count('submitted'), unpaid: count('unpaid'), rejected: count('rejected') };
}

// Days between a payment being sent and verified, over verified registrations that have both times.
export function paymentTurnaround(regs: AdminReg[]): { avgDays: number; count: number } | null {
  const spans = regs.flatMap((r) => {
    const sent = millis(r.raw.paymentSubmittedAt);
    const verified = millis(r.raw.verifiedAt);
    return paymentStatus(r) === 'verified' && sent && verified ? [(verified - sent) / DAY] : [];
  });
  return spans.length ? { avgDays: spans.reduce((s, d) => s + d, 0) / spans.length, count: spans.length } : null;
}

export function docCompliance(regs: AdminReg[], climbs: ClimbFacts[]) {
  const byId = new Map(climbs.map((c) => [c.id, c]));
  return REQUIRED_DOCS.map((doc) => {
    let required = 0;
    let done = 0;
    for (const r of active(regs)) {
      if (!byId.get(r.climbId)?.requires[doc.requiresField]) continue;
      required += 1;
      if (r.uploaded.includes(doc.uploadField)) done += 1;
    }
    return { label: doc.label, required, done };
  });
}

// Registrations per week, newest last: `weeks` buckets of 7 days ending now.
export function weeklyRegistrations(regs: AdminReg[], now: number, weeks = 8): [string, number][] {
  return Array.from({ length: weeks }, (_, i) => {
    const end = now - (weeks - 1 - i) * 7 * DAY;
    const start = end - 7 * DAY;
    const label = `Wk of ${new Date(end + 8 * 3600_000).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', timeZone: 'UTC' })}`;
    return [label, regs.filter((r) => r.createdAt > start && r.createdAt <= end).length] as [string, number];
  });
}

export function failuresByDay(failures: Failure[], now: number, days = 14): [string, number][] {
  const counts = new Map<string, number>();
  for (let i = days - 1; i >= 0; i -= 1) counts.set(day(now - i * DAY), 0);
  for (const f of failures) {
    const key = day(f.createdAt);
    if (counts.has(key)) counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return [...counts.entries()];
}

// The same failure (source + message) seen `min` or more times.
export function repeatedFailures(failures: Failure[], min = 3, limit = 8) {
  const seen = new Map<string, { source: string; message: string; count: number }>();
  for (const f of failures) {
    const key = `${f.source}::${f.message}`;
    const entry = seen.get(key) ?? { source: f.source || 'unknown', message: f.message, count: 0 };
    entry.count += 1;
    seen.set(key, entry);
  }
  return [...seen.values()].filter((e) => e.count >= min).sort((a, b) => b.count - a.count).slice(0, limit);
}

export function noticeVolume(types: string[]): [string, number][] {
  const counts = new Map<string, number>();
  for (const t of types) counts.set(t || 'other', (counts.get(t || 'other') ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1]);
}

// Not paid (or payment rejected) and waiting longest.
export function overdueUnpaid(regs: AdminReg[], now: number, limit = 10) {
  return active(regs)
    .filter((r) => ['unpaid', 'rejected'].includes(paymentStatus(r)) && r.createdAt > 0)
    .map((r) => ({ reg: r, ageDays: Math.floor((now - r.createdAt) / DAY) }))
    .sort((a, b) => b.ageDays - a.ageDays)
    .slice(0, limit);
}

export const staleDrafts = (climbs: ClimbFacts[], now: number, days = 30) =>
  climbs
    .filter((c) => c.status === 'draft' && c.createdAt > 0)
    .map((c) => ({ climb: c, ageDays: Math.floor((now - c.createdAt) / DAY) }))
    .filter((c) => c.ageDays >= days)
    .sort((a, b) => b.ageDays - a.ageDays);

export function oldestPending(regs: AdminReg[]): AdminReg | null {
  const pending = active(regs).filter((r) => r.status === 'pending' && r.createdAt > 0);
  return pending.length ? pending.reduce((o, r) => (r.createdAt < o.createdAt ? r : o)) : null;
}
