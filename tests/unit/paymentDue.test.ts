import { dueLabel, paymentDueOf } from '../../src/frontend/data/climbDetail';

describe('payment due date', () => {
  const start = new Date('2026-11-20T00:00:00+08:00');

  it('uses the officers’ date when set, else five days before the start', () => {
    expect(paymentDueOf({ paymentDueDate: '2026-11-12' }, start)).toBe('2026-11-12');
    expect(paymentDueOf({}, start)).toBe('2026-11-15');
    expect(paymentDueOf({ paymentDueDate: 'soon' }, start)).toBe('2026-11-15');
  });

  it('is blank for an undated climb, and reads as a Manila day', () => {
    expect(paymentDueOf({}, undefined)).toBe('');
    expect(dueLabel('2026-11-15')).toBe('November 15');
  });
});
