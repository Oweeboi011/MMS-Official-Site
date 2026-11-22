import { climbsSpec } from '../../src/frontend/data/climbSchema';
import { fromForm, listColumns, lockedKeys, toForm, validate } from '../../src/frontend/data/siteSchemas';

const stamp = (d: Date) => ({ iso: d.toISOString() });
const base = { ...toForm(climbsSpec), title: 'Mt. Pulag', location: 'Kabayan, Benguet', type: 'major', status: 'open', startDate: '2026-11-20' };

describe('climbs editor', () => {
  it('saves dates as Manila-midnight timestamps and lists one item per line', () => {
    const doc = fromForm(climbsSpec, { ...base, endDate: '2026-11-22', thingsToBring: ' Water \n\nHead lamp ', elevation: '2926' }, stamp);
    expect(doc).toMatchObject({
      startDate: { iso: '2026-11-19T16:00:00.000Z' }, endDate: { iso: '2026-11-21T16:00:00.000Z' },
      thingsToBring: ['Water', 'Head lamp'], elevation: 2926, type: 'major',
    });
    expect(doc).not.toHaveProperty('trailImages');
  });

  it('round-trips lists and accepts legacy text dates (saving converts them)', () => {
    const form = toForm(climbsSpec, { startDate: '2025-03-14', thingsToBring: ['A', 'B'] });
    expect(form.startDate).toBe('2025-03-14');
    expect(form.thingsToBring).toBe('A\nB');
    expect(lockedKeys(climbsSpec, { startDate: '2025-03-14', thingsToBring: ['A'] })).toEqual([]);
    expect(lockedKeys(climbsSpec, { startDate: 'March 14', thingsToBring: [{ x: 1 }] })).toEqual(['startDate', 'thingsToBring']);
  });

  it('checks difficulty, date order and photo links', () => {
    expect(validate(climbsSpec, base)).toBeNull();
    expect(validate(climbsSpec, { ...base, difficulty: '10/9' })).toMatch(/N\/9/);
    expect(validate(climbsSpec, { ...base, endDate: '2026-11-19' })).toMatch(/before the start/);
    expect(validate(climbsSpec, { ...base, trailImages: 'https://a.example/1.jpg\nftp://b' })).toMatch(/https/);
    expect(validate(climbsSpec, { ...base, trailClass: '7' })).toMatch(/1 to 6/);
  });

  it('lists climbs as a table of date, name, type, status and slots', () => {
    const doc = { title: 'Mt. Apo', type: 'major', status: 'draft', maxParticipants: 30, startDate: { toDate: () => new Date('2026-04-12T16:00:00Z') } };
    expect(listColumns(climbsSpec).map((c) => c.get(doc))).toEqual(['2026-04-13', 'Mt. Apo', 'major', 'draft', '30']);
  });
});

describe('climbs editor lists', () => {
  const field = (key: string) => climbsSpec.fields.find((f) => f.key === key)!;
  it('round-trips fees with their flags', () => {
    const fees = [{ label: 'Guest Fee', amount: '450', note: '', optional: true, isGuestFee: true }];
    const form = toForm(climbsSpec, { fees });
    expect(fromForm(climbsSpec, { ...base, fees: form.fees }, stamp).fees).toEqual(fees);
    expect(field('fees').kind).toBe('records');
  });

  it('flags a fee row without an amount', () => {
    const fees = JSON.stringify([{ label: 'Guide Fee', amount: '', note: '', optional: false, isGuestFee: false }]);
    expect(validate(climbsSpec, { ...base, fees })).toBe('Fees, row 1, Amount (₱ or TBA) is required.');
  });
});
