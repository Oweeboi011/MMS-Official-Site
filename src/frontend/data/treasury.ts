// #155 / #82 treasurer summary: money per climb from its registrations (old app "payments: cash flow, service headcounts").
import type { AdminReg } from './adminRegistrations';

export interface ClimbMoney {
  climbId: string;
  title: string;
  date: string;
  people: number; // pending + confirmed + waitlisted
  expected: number; // their fees (and pledges sent with fees)
  tba: boolean;
  verified: number;
  inReview: number;
  outstanding: number;
  services: [string, number][]; // optional fees ticked, with how many people
}

const LIVE = new Set(['pending', 'confirmed', 'waitlisted']);
type Line = { label?: unknown; optional?: unknown; selected?: unknown };

function servicesOf(regs: AdminReg[]): [string, number][] {
  const counts = new Map<string, number>();
  for (const r of regs) {
    for (const l of (Array.isArray(r.raw.feeBreakdown) ? r.raw.feeBreakdown : []) as Line[]) {
      if (l.optional === true && l.selected === true && typeof l.label === 'string') counts.set(l.label, (counts.get(l.label) ?? 0) + 1);
    }
  }
  return [...counts].sort((a, b) => b[1] - a[1]);
}

const sum = (regs: AdminReg[], status: string) => regs.reduce((t, r) => t + r.payments.filter((p) => p.status === status).reduce((s, p) => s + p.amount, 0), 0);

export function treasury(all: AdminReg[]): ClimbMoney[] {
  const byClimb = new Map<string, AdminReg[]>();
  for (const r of all) byClimb.set(r.climbId, [...(byClimb.get(r.climbId) ?? []), r]);
  return [...byClimb].map(([climbId, regs]) => {
    const live = regs.filter((r) => LIVE.has(r.status));
    const expected = live.reduce((t, r) => t + r.total, 0);
    const verified = sum(regs, 'verified');
    return {
      climbId, title: regs[0].title, date: regs[0].date, people: live.length, expected, tba: live.some((r) => r.tba),
      verified, inReview: sum(regs, 'submitted'), outstanding: Math.max(expected - verified, 0), services: servicesOf(live),
    };
  });
}
