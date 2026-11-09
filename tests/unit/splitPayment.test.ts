import { splitPatches, toAdminReg } from '../../src/frontend/data/adminRegistrations';

const payer = toAdminReg('p', { name: 'Ana', payments: [{ amount: 3000, status: 'verified', proofs: [{ url: 'https://x/r.jpg' }], reviewedBy: 'tl' }] });
const ben = toAdminReg('b', { name: 'Ben', payments: [] });
const id = (i: number) => `s${i}`;

describe('split payment', () => {
  it('moves a share onto the friend, with the receipt and verdict, and tags both sides', () => {
    const { payer: p, recipients, moved } = splitPatches(payer, 0, [{ reg: ben, amount: 1500 }], 'tl@x.com', id);
    expect(moved).toBe(1500);
    expect(p.payments[0]).toMatchObject({ amount: 1500, originalAmount: 3000, splitTo: [{ registrationId: 'b', name: 'Ben', amount: 1500, splitId: 's0' }] });
    expect(p.amountPaid).toBe(1500);
    expect(recipients[0].id).toBe('b');
    expect(recipients[0].patch.payments[0]).toMatchObject({ amount: 1500, status: 'verified', proofs: [{ url: 'https://x/r.jpg' }], paidBy: { registrationId: 'p', splitId: 's0' } });
    expect(recipients[0].patch).toMatchObject({ amountPaid: 1500, paymentStatus: 'verified' });
  });

  it('refuses splits that do not add up', () => {
    expect(() => splitPatches(payer, 0, [{ reg: ben, amount: 5000 }], 'x', id)).toThrow(/Only ₱3,000/);
    expect(() => splitPatches(payer, 0, [{ reg: payer, amount: 10 }], 'x', id)).toThrow(/person who paid/);
    expect(() => splitPatches(payer, 0, [{ reg: ben, amount: 0 }], 'x', id)).toThrow(/Choose who/);
    const rejected = toAdminReg('r', { payments: [{ amount: 100, status: 'rejected' }] });
    expect(() => splitPatches(rejected, 0, [{ reg: ben, amount: 50 }], 'x', id)).toThrow(/rejected/);
  });
});
