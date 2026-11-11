import { toAdminReg } from '../../src/frontend/data/adminRegistrations';
import { docCompliance, failuresByDay, noticeVolume, oldestPending, overdueUnpaid, paymentBreakdown, paymentTurnaround, repeatedFailures, staleDrafts, trafficSummary, waiverRate, weeklyRegistrations } from '../../src/frontend/data/insightStats';

const NOW = Date.UTC(2026, 10, 10, 4); // Nov 10 noon, Manila
const DAY = 86400000;
const ts = (ms: number) => ({ toMillis: () => ms });
const reg = (id: string, d: Record<string, unknown>) => toAdminReg(id, { climbId: 'c1', status: 'pending', paymentStatus: 'unpaid', createdAt: ts(NOW - DAY), ...d });

describe('insight stats', () => {
  const regs = [
    reg('a', { paymentStatus: 'verified', waiverSigned: true, waiverSignedName: 'A', medicalCertUpload: { url: 'https://x/m', fileName: 'm' }, paymentSubmittedAt: ts(NOW - 5 * DAY), verifiedAt: ts(NOW - 3 * DAY) }),
    reg('b', { createdAt: ts(NOW - 20 * DAY) }),
    reg('c', { paymentStatus: 'rejected', createdAt: ts(NOW - 9 * DAY) }),
    reg('d', { status: 'cancelled', paymentStatus: 'verified' }),
  ];

  it('counts active registrations: waiver rate and payment breakdown', () => {
    expect(waiverRate(regs)).toBe(33);
    expect(paymentBreakdown(regs)).toEqual({ total: 3, verified: 1, submitted: 0, unpaid: 1, rejected: 1 });
    expect(waiverRate([])).toBe(0);
  });

  it('averages the days from sent to verified', () => {
    expect(paymentTurnaround(regs)).toEqual({ avgDays: 2, count: 1 });
    expect(paymentTurnaround([reg('x', {})])).toBeNull();
  });

  it('measures document compliance against what each climb requires', () => {
    const climbs = [{ id: 'c1', title: 'T', status: 'open', createdAt: 0, requires: { requiresMedicalCert: true } }];
    const medical = docCompliance(regs, climbs).find((d) => d.label === 'Medical certificate');
    expect(medical).toEqual({ label: 'Medical certificate', required: 3, done: 1 });
    expect(docCompliance(regs, climbs).find((d) => d.label === 'Mountaineering / trekking permit')?.required).toBe(0);
  });

  it('buckets registrations by week and failures by day', () => {
    const weeks = weeklyRegistrations(regs, NOW, 4);
    expect(weeks).toHaveLength(4);
    expect(weeks.reduce((s, [, n]) => s + n, 0)).toBe(4);
    const days = failuresByDay([{ source: 's', message: 'm', createdAt: NOW - 3_600_000 }, { source: 's', message: 'm', createdAt: NOW - 40 * DAY }], NOW, 14);
    expect(days).toHaveLength(14);
    expect(days.reduce((s, [, n]) => s + n, 0)).toBe(1);
  });

  it('finds repeated failures, notice volume, overdue payments, stale drafts and the oldest pending', () => {
    const fail = (message: string) => ({ source: 'email', message, createdAt: NOW });
    expect(repeatedFailures([fail('a'), fail('a'), fail('a'), fail('b')])).toEqual([{ source: 'email', message: 'a', count: 3 }]);
    expect(noticeVolume(['x', 'y', 'x', ''])).toEqual([['x', 2], ['y', 1], ['other', 1]]);
    expect(overdueUnpaid(regs, NOW).map((o) => [o.reg.id, o.ageDays])).toEqual([['b', 20], ['c', 9]]);
    expect(staleDrafts([{ id: 'd', title: 'D', status: 'draft', createdAt: NOW - 45 * DAY, requires: {} }, { id: 'e', title: 'E', status: 'draft', createdAt: NOW - DAY, requires: {} }], NOW).map((s) => s.climb.id)).toEqual(['d']);
    expect(oldestPending(regs)?.id).toBe('b');
  });
});

describe('trafficSummary', () => {
  const views = [
    { at: NOW, path: '/a', session: 's1' }, { at: NOW - 1000, path: '/a', session: 's1' },
    { at: NOW - DAY, path: '/b', session: 's2' }, { at: NOW - 40 * DAY, path: '/old', session: 's3' },
  ];
  it('counts views per day, visits and top pages inside the window', () => {
    const t = trafficSummary(views, NOW, 30);
    expect(t.perDay).toHaveLength(30);
    expect(t.perDay.at(-1)).toEqual(['2026-11-10', 2]);
    expect(t.perDay.at(-2)?.[1]).toBe(1);
    expect(t.sessions).toBe(3);
    expect(t.top[0]).toEqual(['/a', 2]);
  });
});
