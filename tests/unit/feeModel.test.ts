import { feeModel, pesoLabel } from '../../src/frontend/data/feeModel';

const fee = (label: string, amount: string, extra: Partial<{ optional: boolean; isGuestFee: boolean }> = {}) => ({ label, amount, note: '', optional: false, isGuestFee: false, ...extra });

describe('fee model', () => {
  it('totals the required fees only; optional and guest fees stay apart', () => {
    const m = feeModel([fee('Guide', '1500'), fee('Permit', '₱500'), fee('Van', '800', { optional: true }), fee('Guest Fee', '450', { isGuestFee: true })]);
    expect(m.total).toBe(2000);
    expect(m.required.map((f) => f.label)).toEqual(['Guide', 'Permit']);
    expect(m.optional.map((f) => f.label)).toEqual(['Van']);
    expect(m.guest?.label).toBe('Guest Fee');
    expect(m.hasTba).toBe(false);
  });

  it('flags TBA required fees instead of counting them as zero', () => {
    const m = feeModel([fee('Guide', '1500'), fee('Transport', 'TBA')]);
    expect(m).toMatchObject({ total: 1500, hasTba: true, hasAmount: true });
    expect(feeModel([fee('Transport', 'TBA')])).toMatchObject({ hasAmount: false, hasTba: true });
    expect(feeModel([])).toMatchObject({ total: 0, hasAmount: false, guest: null });
  });

  it('writes pesos, keeping non-numeric text as it is', () => {
    expect(pesoLabel('1500')).toBe('₱1,500');
    expect(pesoLabel('TBA')).toBe('TBA');
    expect(pesoLabel('')).toBe('TBA');
  });
});
