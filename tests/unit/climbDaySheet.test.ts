import { toAdminReg } from '../../src/frontend/data/adminRegistrations';
import { sheetRows, sheetTotals } from '../../src/frontend/data/climbDaySheet';

describe('climb-day sheet', () => {
  it('lists pending + confirmed by name with emergency, health, waiver and balance', () => {
    const regs = [
      toAdminReg('b', { name: 'Ben', status: 'confirmed', mobile: '0917', emergencyContact: { name: 'Mia', relationship: 'Sister', mobile: '0918' }, medicalConditions: 'Asthma',
        waiverSigned: true, waiverSignedName: 'Ben R', feeBreakdown: [{ label: 'Guide', amount: '1000', selected: true }], amountPaid: 1000 }),
      toAdminReg('a', { name: 'Ana', status: 'pending', feeBreakdown: [{ label: 'Guide', amount: '1000', selected: true }], donation: { cashPledge: 200, inKind: 'books', payWithFees: false } }),
      toAdminReg('x', { name: 'Zed', status: 'cancelled' }),
    ];
    const rows = sheetRows(regs);
    expect(rows.map((r) => r.name)).toEqual(['Ana', 'Ben']);
    expect(rows[1]).toMatchObject({ emergency: 'Mia (Sister) 0918', medical: 'Asthma', waiver: 'signed: Ben R', balance: 0 });
    expect(rows[0]).toMatchObject({ waiver: 'NOT signed', balance: 1000, pledge: '₱200 cash on the day · books' });
    expect(sheetTotals(rows)).toEqual({ people: 2, withMedical: 1, unsignedWaivers: 1, owing: 1 });
  });
});
