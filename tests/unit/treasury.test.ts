import { toAdminReg } from '../../src/frontend/data/adminRegistrations';
import { treasury } from '../../src/frontend/data/treasury';

const reg = (id: string, d: Record<string, unknown>) => toAdminReg(id, { climbId: 'c1', climbTitle: 'Mt. Pulag', climbDate: 'Nov 20', ...d });

describe('treasurer summary', () => {
  it('totals expected, verified, in review and outstanding per climb, and counts optional services', () => {
    const fees = (van: boolean) => [{ label: 'Guide', amount: '1000', selected: true }, { label: 'Van', amount: '500', optional: true, selected: van }];
    const [c] = treasury([
      reg('a', { status: 'confirmed', feeBreakdown: fees(true), payments: [{ amount: 1500, status: 'verified' }] }),
      reg('b', { status: 'pending', feeBreakdown: fees(false), payments: [{ amount: 400, status: 'submitted' }, { amount: 100, status: 'rejected' }] }),
      reg('x', { status: 'cancelled', feeBreakdown: fees(true) }),
    ]);
    expect(c).toMatchObject({ climbId: 'c1', people: 2, expected: 2500, verified: 1500, inReview: 400, outstanding: 1000, services: [['Van', 1]] });
  });
});
