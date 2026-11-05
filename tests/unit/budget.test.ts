import { shouldDisableBilling } from '../../src/backend/functions/src/budget.js';

describe('billing hard stop (backend)', () => {
  it('disables at or over budget', () => {
    expect(shouldDisableBilling({ costAmount: 1.7, budgetAmount: 1.7 })).toBe(true);
    expect(shouldDisableBilling({ costAmount: 2.5, budgetAmount: 1.7 })).toBe(true);
  });

  it('keeps billing under budget', () => {
    expect(shouldDisableBilling({ costAmount: 0, budgetAmount: 1.7 })).toBe(false);
    expect(shouldDisableBilling({ costAmount: 1.69, budgetAmount: 1.7 })).toBe(false);
  });

  it('ignores malformed notifications instead of disabling', () => {
    expect(shouldDisableBilling(undefined)).toBe(false);
    expect(shouldDisableBilling({})).toBe(false);
    expect(shouldDisableBilling({ costAmount: 'x', budgetAmount: 1.7 })).toBe(false);
    expect(shouldDisableBilling({ costAmount: 5, budgetAmount: 0 })).toBe(false);
  });
});
