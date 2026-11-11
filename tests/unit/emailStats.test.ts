import { clampDays, statsUrl, summarizeStats } from '../../src/backend/functions/src/shared/emailStats.js';

describe('clampDays', () => {
  it('keeps 1–90 whole days and defaults to 30', () => {
    expect(clampDays(7)).toBe(7);
    expect(clampDays(0.4)).toBe(30);
    expect(clampDays(-5)).toBe(1);
    expect(clampDays(500)).toBe(90);
    expect(clampDays('abc')).toBe(30);
    expect(clampDays(undefined)).toBe(30);
    expect(clampDays(12.9)).toBe(12);
  });
});

describe('statsUrl', () => {
  it('asks for the window ending today', () => {
    const url = statsUrl(10, new Date(Date.UTC(2026, 10, 11)));
    expect(url).toContain('startDate=2026-11-01');
    expect(url).toContain('endDate=2026-11-11');
  });
});

describe('summarizeStats', () => {
  it('fills missing counters with 0 and adds the range', () => {
    expect(summarizeStats({ requests: 5, delivered: 4, extra: 9 }, 30)).toEqual({
      requests: 5, delivered: 4, hardBounces: 0, softBounces: 0, blocked: 0, opens: 0, uniqueOpens: 0, clicks: 0, spamReports: 0, rangeDays: 30,
    });
  });
});
