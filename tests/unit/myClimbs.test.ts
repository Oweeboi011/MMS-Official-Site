import { canCancel, newestFirst, nextSteps, toMyClimb } from '../../src/frontend/data/myClimbs';

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

describe('next steps and payment log', () => {
  const base = { climbId: 'c', feeBreakdown: [{ label: 'Guide', amount: '1500', selected: true }] };
  it('tells the member what to do next', () => {
    expect(nextSteps(toMyClimb('a', { ...base, status: 'pending' }), ['medicalCertUpload'])).toEqual(['Pay your balance below.', 'Upload 1 required document.']);
    expect(nextSteps(toMyClimb('b', { ...base, status: 'pending', amountPaid: 1500, payments: [{ amount: 1500, status: 'submitted' }] }), [])).toEqual(['Payment sent: officers will verify it.']);
    expect(nextSteps(toMyClimb('c', { ...base, status: 'confirmed', amountPaid: 1500, payments: [{ amount: 1500, status: 'verified' }] }), [])).toEqual(['You’re confirmed. See you at the pre-climb meeting.']);
    expect(nextSteps(toMyClimb('d', { ...base, status: 'waitlisted' }), [])).toEqual(['You’re on the waitlist: we’ll tell you if a slot opens.']);
    expect(nextSteps(toMyClimb('e', { ...base, status: 'cancelled' }), [])).toEqual([]);
  });

  it('keeps each payment with its verdict', () => {
    expect(toMyClimb('a', { payments: [{ amount: '500', status: 'rejected', note: 'blurry' }] }).payments).toEqual([{ amount: 500, status: 'rejected', note: 'blurry' }]);
  });
});
