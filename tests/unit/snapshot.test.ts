import { snapshotFor } from '../../src/frontend/services/publicData';

const doc = (name: string, fields: Record<string, unknown>) => ({ document: { name: `p/climbs/${name}`, fields } });
const snap = ({
  announcements: [doc('a1', { title: { stringValue: 'One' } }), doc('a2', { title: { stringValue: 'Two' } })],
  officers: [doc('o1', { name: { stringValue: 'Pres' }, current: { booleanValue: true } }), doc('o2', { name: { stringValue: 'Past' }, current: { booleanValue: false } })],
  climbs: [doc('c1', { title: { stringValue: 'Pulag' }, startDate: { timestampValue: '2026-11-20T00:00:00Z' } }), doc('c2', { title: { stringValue: 'Apo' }, startDate: { timestampValue: '2027-02-01T00:00:00Z' } })],
  settings: { fields: { motto: { stringValue: 'Once an MMS' } } },
}) as unknown as Parameters<typeof snapshotFor>[1];

describe('static fallback snapshot', () => {
  it('answers each public read from the deploy-time copy', () => {
    expect(snapshotFor('announcements:1', snap) as unknown[]).toHaveLength(1);
    expect((snapshotFor('officers:current', snap) as { name: string }[]).map((o) => o.name)).toEqual(['Pres']);
    expect(snapshotFor('officers', snap) as unknown[]).toHaveLength(2);
    expect(snapshotFor('settings', snap)).toEqual({ motto: 'Once an MMS' });
    expect((snapshotFor('climbs:2026:false', snap) as { title: string }[]).map((c) => c.title)).toEqual(['Pulag', 'Apo']);
    expect((snapshotFor('climbs:2026:true', snap) as { title: string }[]).map((c) => c.title)).toEqual(['Pulag']);
    expect(snapshotFor('climb:c2', snap)).toMatchObject({ id: 'c2', title: 'Apo' });
    expect(snapshotFor('climb:zz', snap)).toBeNull();
    expect(snapshotFor('surveys', {} as Parameters<typeof snapshotFor>[1])).toBeUndefined();
    expect(snapshotFor('constructor:x', snap)).toBeUndefined(); // no prototype lookups
    expect(snapshotFor('__proto__', snap)).toBeUndefined();
  });
});
