import { toClimbDetail } from '../../src/frontend/data/climbDetail';
import { driveOf, pledgeInBalance, toPledge } from '../../src/frontend/data/donations';
import { toMyClimb } from '../../src/frontend/data/myClimbs';

describe('donation drives and pledges', () => {
  it('reads a drive only when it is on; needed items win over suggestions', () => {
    expect(driveOf({ donationDrive: { enabled: false, beneficiary: 'X' } })).toBeNull();
    expect(driveOf({ donationDrive: { enabled: true, beneficiary: 'Sitio School', suggestedItems: 'Notebooks\n\nPencils' } }))
      .toEqual({ beneficiary: 'Sitio School', description: '', items: ['Notebooks', 'Pencils'] });
    expect(driveOf({ donationDrive: { enabled: true, neededItems: [{ name: 'Rice' }], suggestedItems: 'X' } })?.items).toEqual(['Rice']);
    expect(toClimbDetail({ title: 'T', donationDrive: { enabled: true } }, new Date())?.drive).not.toBeNull();
  });

  it('builds the pledge shape the rules accept', () => {
    expect(toPledge('₱1,500', ' 2 boxes ', true)).toEqual({ cashPledge: 1500, inKind: '2 boxes', payWithFees: true });
    expect(toPledge('', 'Books', true)).toEqual({ cashPledge: null, inKind: 'Books', payWithFees: false });
    expect(toPledge('0', ' ', true)).toBeNull();
    expect(toPledge('99999999', '', false)?.cashPledge).toBe(1_000_000);
  });

  it('adds a cash pledge sent with fees to the balance', () => {
    const fees = { feeBreakdown: [{ label: 'Guide', amount: '1500', selected: true }] };
    expect(toMyClimb('a', { ...fees, donation: { cashPledge: 200, inKind: '', payWithFees: true } }).total).toBe(1700);
    expect(toMyClimb('b', { ...fees, donation: { cashPledge: 200, inKind: '', payWithFees: false } }).total).toBe(1500);
    expect(pledgeInBalance(null)).toBe(0);
  });
});
