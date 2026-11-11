import { climbLogBlocks, completedEntries } from '../../src/frontend/data/climbLog';

const NOW = new Date('2026-11-12T00:00:00Z');
const d = (over: Record<string, unknown>) => ({ title: 'Mt. X', type: 'minor', status: 'open', startDate: new Date('2026-10-10T00:00:00Z'), endDate: new Date('2026-10-11T00:00:00Z'), registrationCount: 12, ...over });
const sample = [{ type: 'text' as const, paragraphs: ['sample'] }];

describe('completedEntries', () => {
  it('keeps finished, public, non-postponed climbs, newest first', () => {
    const docs = [
      d({ title: 'Old', startDate: new Date('2025-03-01T00:00:00Z'), endDate: new Date('2025-03-01T00:00:00Z') }),
      d({ title: 'New' }),
      d({ title: 'Upcoming', startDate: new Date('2026-12-05T00:00:00Z'), endDate: new Date('2026-12-06T00:00:00Z') }),
      d({ title: 'Draft', status: 'draft' }),
      d({ title: 'Cancelled', cancellationStatus: 'cancelled' }),
      d({ title: 'Postponed', cancellationStatus: 'postponed' }),
      d({ title: 'Marked done', status: 'completed', startDate: new Date('2026-11-20T00:00:00Z'), endDate: new Date('2026-11-21T00:00:00Z') }),
    ];
    expect(completedEntries(docs, NOW).map((e) => e.climb.title)).toEqual(['Marked done', 'New', 'Old']);
  });
});

describe('climbLogBlocks', () => {
  it('keeps the sample when no climb has finished', () => {
    expect(climbLogBlocks(sample, [], NOW)).toBe(sample);
    expect(climbLogBlocks(sample, [d({ startDate: new Date('2026-12-05T00:00:00Z'), endDate: new Date('2026-12-06T00:00:00Z') })], NOW)).toBe(sample);
  });

  it('lists completed open climbs with the year, type counts and how many joined', () => {
    const [stats, table] = climbLogBlocks(sample, [d({}), d({ title: 'Big one', type: 'major', registrationCount: 20 })], NOW);
    expect(stats).toMatchObject({ type: 'stats', items: [{ value: '2', label: 'Climbs logged' }, { value: '1', label: 'Minor climbs' }, { value: '1', label: 'Major climbs' }, { value: '0', label: 'Special climbs' }] });
    expect(table).toMatchObject({ type: 'table', columns: ['Date', 'Climb', 'Type', 'Joined'] });
    const rows = (table as { rows: string[][] }).rows;
    expect(rows).toContainEqual(['Oct 10–11, 2026', 'Big one', 'Major', '20']);
  });
});
