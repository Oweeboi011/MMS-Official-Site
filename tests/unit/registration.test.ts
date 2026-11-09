import { buildRegistrationDoc, feeLines, feeTotal, initialForm, validateRegistration, type FeeItem } from '../../src/frontend/data/registration';

const fees: FeeItem[] = [
  { label: 'Guide Fee', amount: '1500', note: '', optional: false, isGuestFee: false },
  { label: 'Guest Fee', amount: '450', note: '', optional: true, isGuestFee: true },
  { label: 'Van', amount: '800', note: '', optional: true, isGuestFee: false },
  { label: 'Env Fee', amount: 'TBA', note: '', optional: false, isGuestFee: false },
];
const filled = { ...initialForm(), fullName: 'Ana Cruz', mobile: '0917', ecName: 'B', ecMobile: '0918', ecRelationship: 'Sister', waiverAgreed: true, privacyConsent: true, sigName: 'Ana Cruz' };

describe('registration', () => {
  it('requires contact, emergency contact, waiver, signature and privacy consent', () => {
    expect(Object.keys(validateRegistration(initialForm())).sort()).toEqual(['ecMobile', 'ecName', 'ecRelationship', 'fullName', 'mobile', 'privacyConsent', 'sigName', 'waiverAgreed'].sort());
    expect(validateRegistration(filled)).toEqual({});
    expect(validateRegistration({ ...filled, sigName: 'Al' }).sigName).toMatch(/at least 3/);
  });

  it('charges the guest fee to guests only and optional fees only when ticked', () => {
    const guest = feeLines(fees, 'joiner', { Van: true });
    expect(guest.map((l) => l.selected)).toEqual([true, true, true, true]);
    const member = feeLines(fees, 'member', {});
    expect(member.map((l) => l.selected)).toEqual([true, false, false, true]);
    expect(feeTotal(guest)).toEqual({ total: 2750, tba: true });
    expect(feeTotal(member)).toEqual({ total: 1500, tba: true });
  });

  it('builds a doc the rules accept from a member: pending, unpaid, own email, signed waiver', () => {
    const doc = buildRegistrationDoc({ id: 'c1', title: 'Mt. Pulag', dateLabel: 'Nov 20–22', location: 'Benguet' }, { uid: 'u1', email: 'a@x.com' }, { ...filled, fullName: ' Ana Cruz ' }, fees, 'NOW');
    expect(doc).toMatchObject({
      climbId: 'c1', userId: 'u1', email: 'a@x.com', name: 'Ana Cruz', status: 'pending', paymentStatus: 'unpaid', payments: [], amountPaid: null,
      memberType: 'joiner', waiverSigned: true, waiverSignedName: 'Ana Cruz', privacyNoticeVersion: '2026-10-18', createdAt: 'NOW',
      emergencyContact: { name: 'B', mobile: '0918', relationship: 'Sister' },
    });
    expect(doc).not.toHaveProperty('verifiedAt');
    expect(doc.feeBreakdown).toHaveLength(4);
  });
});
