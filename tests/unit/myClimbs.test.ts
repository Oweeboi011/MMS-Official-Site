import { canCancel, newestFirst, toMyClimb } from '../../src/frontend/data/myClimbs';

const stamp = (ms: number) => ({ toMillis: () => ms });

describe('My Climbs rows', () => {
  it('totals the selected fees and labels status and payment', () => {
    const row = toMyClimb('r1', {
      climbId: 'c1', climbTitle: 'Mt. Pulag', climbDate: 'Nov 20–22', status: 'confirmed', paymentStatus: 'submitted', amountPaid: 500, createdAt: stamp(1),
      feeBreakdown: [{ label: 'Guide', amount: '1500', selected: true }, { label: 'Van', amount: '800', optional: true, selected: false }, { label: 'Env', amount: 'TBA', selected: true }],
    });
    expect(row).toMatchObject({ id: 'r1', climbId: 'c1', statusLabel: 'Confirmed', paymentLabel: 'Payment under review', total: 1500, tba: true, paid: 500 });
  });

  it('lets members cancel until the climb is over, never twice', () => {
    const row = toMyClimb('r', { status: 'pending' });
    expect(canCancel(row, false)).toBe(true);
    expect(canCancel(row, true)).toBe(false);
    expect(canCancel(toMyClimb('r', { status: 'cancelled' }), false)).toBe(false);
  });

  it('lists newest first', () => {
    const rows = [toMyClimb('a', { createdAt: stamp(1) }), toMyClimb('b', { createdAt: stamp(3) })];
    expect(newestFirst(rows).map((r) => r.id)).toEqual(['b', 'a']);
  });
});
