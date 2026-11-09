import { describe as describeClimb, planCopy } from '../../tools/admin/copyPlan.mjs';

const doc = (id: string, data: Record<string, unknown> = {}) => ({ id, data });

describe('old-app climb copy plan', () => {
  const source = [doc('a'), doc('b'), doc('c')];

  it('creates missing climbs and leaves existing ones alone by default', () => {
    const plan = planCopy(source, new Set(['b']), false);
    expect(plan.create.map((d: { id: string }) => d.id)).toEqual(['a', 'c']);
    expect(plan.skip.map((d: { id: string }) => d.id)).toEqual(['b']);
    expect(plan.overwrite).toEqual([]);
  });

  it('overwrites existing climbs only when asked', () => {
    const plan = planCopy(source, new Set(['b']), true);
    expect(plan.overwrite.map((d: { id: string }) => d.id)).toEqual(['b']);
    expect(plan.skip).toEqual([]);
  });

  it('describes a climb with its date and title', () => {
    const startDate = { toDate: () => new Date('2026-12-05T00:00:00Z') };
    expect(describeClimb(doc('x', { title: 'Mt. Pulag', startDate }))).toBe('x  2026-12-05  Mt. Pulag');
    expect(describeClimb(doc('y'))).toBe('y  no date  (untitled)');
  });
});
