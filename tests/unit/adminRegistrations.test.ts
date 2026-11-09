import { CSV_HEADERS, derivePaymentStatus, reviewPayment, summary, toAdminReg, toCsv } from '../../src/frontend/data/adminRegistrations';

const pay = (amount: number, status = 'submitted', extra = {}) => ({ amount, proofs: [{ url: 'https://x/r.jpg', fileName: 'r.jpg' }], status, submittedAt: 1, ...extra });
const reg = toAdminReg('r1', {
  name: 'Ana', email: 'ana@x.com', mobile: '0917', memberType: 'joiner', status: 'pending', climbTitle: 'Mt. Pulag',
  payments: [pay(500, 'verified', { reviewedBy: 'old' }), pay(800)], amountPaid: 1300,
  feeBreakdown: [{ label: 'Guide', amount: '1300', selected: true }],
});

describe('admin registrations', () => {
  it('verifying the last open payment verifies the registration and stamps the reviewer', () => {
    const p = reviewPayment(reg, 1, 'verified', { name: 'tl@x.com', uid: 'a1' }, 'NOW');
    expect(p.paymentStatus).toBe('verified');
    expect(p.amountPaid).toBe(1300);
    expect(p.payments[0]).toMatchObject({ amount: 500, status: 'verified', reviewedBy: 'old' }); // untouched
    expect(p.payments[1]).toMatchObject({ amount: 800, status: 'verified', reviewedBy: 'tl@x.com' });
    expect(p.verifiedBy).toEqual({ name: 'tl@x.com', uid: 'a1' });
    expect(p.verifiedAt).toBe('NOW');
  });

  it('a rejected payment drops out of amountPaid', () => {
    const p = reviewPayment(reg, 1, 'rejected', { name: 'tl', uid: 'a1' }, 'NOW');
    expect(p.amountPaid).toBe(500);
    expect(p.paymentStatus).toBe('verified');
    expect(derivePaymentStatus([])).toBe('unpaid');
    expect(derivePaymentStatus([{ status: 'rejected' }])).toBe('rejected');
  });

  it('summarises statuses and open reviews', () => {
    expect(summary([reg])).toMatchObject({ pending: 1, toReview: 1, collected: 1300 });
  });

  it('exports CSV with quotes escaped and formulas neutralised', () => {
    const evil = toAdminReg('r2', { name: '=HYPERLINK("http://x")', medicalConditions: 'says "hi"', status: 'confirmed' });
    const csv = toCsv([reg, evil]).split('\r\n');
    expect(csv[0]).toBe(CSV_HEADERS.map((h) => `"${h}"`).join(','));
    expect(csv[2]).toContain(`"'=HYPERLINK(""http://x"")"`);
    expect(csv[2]).toContain('"says ""hi"""');
    expect(csv[1]).toContain('"500 verified; 800 submitted"');
  });
});
