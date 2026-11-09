import { CSV_HEADERS, derivePaymentStatus, emptyWalkIn, expensesTotal, matches, noShowPatch, refundPatch, refundedTotal, reviewPayment, summary, toAdminReg, toCsv, walkInDoc, walkInProblem } from '../../src/frontend/data/adminRegistrations';

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

describe('walk-ins and search', () => {
  const climb = { id: 'c1', title: 'Mt. Pulag', dateLabel: 'Nov 20', location: 'Benguet' };
  it('records a walk-in with no account, and cash as a verified payment', () => {
    const doc = walkInDoc(climb, { ...emptyWalkIn(), name: ' Carlo ', cash: '₱1,500' }, 'tl@x.com', 'NOW', 'STAMP');
    expect(doc).toMatchObject({ climbId: 'c1', userId: null, name: 'Carlo', status: 'confirmed', paymentStatus: 'verified', amountPaid: 1500, addedByAdmin: true, confirmedAt: 'NOW' });
    expect(doc.payments).toEqual([{ amount: 1500, proofs: [], submittedAt: 'STAMP', status: 'verified', recordedBy: 'tl@x.com', note: 'Cash, recorded by an officer' }]);
    expect(walkInDoc(climb, { ...emptyWalkIn(), name: 'D' }, 'x', 'NOW', 'S')).toMatchObject({ paymentStatus: 'unpaid', amountPaid: null, payments: [] });
    expect(walkInProblem(emptyWalkIn())).toMatch(/name/);
    expect(walkInProblem({ ...emptyWalkIn(), name: 'D', cash: 'abc' })).toMatch(/peso/);
  });

  it('matches name, email, mobile or climb, and status', () => {
    expect(matches(reg, 'ANA', '')).toBe(true);
    expect(matches(reg, 'pulag', 'pending')).toBe(true);
    expect(matches(reg, 'pulag', 'confirmed')).toBe(false);
    expect(matches(reg, 'apo', '')).toBe(false);
  });
});

describe('refunds, no-shows, expenses', () => {
  it('appends a refund without touching payments and totals refunds', () => {
    const r = toAdminReg('r', { refunds: [{ amount: 100 }], payments: [{ amount: 800, status: 'verified' }] });
    const p = refundPatch(r, 250.555, ' gcash ref 9 ', 'tl@x.com', 'STAMP', 'NOW');
    expect(p.refunds).toHaveLength(2);
    expect(p.refunds[1]).toMatchObject({ amount: 250.56, note: 'gcash ref 9', recordedBy: 'tl@x.com', refundedAt: 'STAMP' });
    expect(p).not.toHaveProperty('payments');
    expect(refundedTotal(toAdminReg('r2', { refunds: p.refunds }))).toBeCloseTo(350.56);
  });

  it('marks and clears a no-show as a flag', () => {
    expect(noShowPatch(true, 'tl', 'NOW')).toEqual({ noShow: true, noShowMarkedBy: 'tl', noShowMarkedAt: 'NOW', updatedAt: 'NOW' });
    expect(noShowPatch(false, 'tl', 'NOW')).toEqual({ noShow: false, noShowMarkedBy: null, noShowMarkedAt: null, updatedAt: 'NOW' });
    expect(expensesTotal([{ label: 'Permit', amount: 300 }, { label: 'Van', amount: 4500 }])).toBe(4800);
  });
});
