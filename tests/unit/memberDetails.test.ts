import { EMPTY, MAX, missingEmergency, toDetails, toPatch, validate } from '../../src/frontend/data/memberDetails';

describe('member details', () => {
  it('reads only known values and drops made-up choices', () => {
    expect(toDetails({ batch: 'Halcon 1994', tribe: 'vikings', experienceLevel: 'pro', mobile: 5 })).toEqual({ ...EMPTY, batch: 'Halcon 1994' });
    expect(toDetails(undefined)).toEqual(EMPTY);
  });

  it('reads full name and nickname, trims them, and limits their length', () => {
    expect(toDetails({ fullName: 'Ana Reyes', nickname: 'Annie' })).toMatchObject({ fullName: 'Ana Reyes', nickname: 'Annie' });
    expect(toPatch({ ...EMPTY, nickname: ' Annie ' })).toMatchObject({ nickname: 'Annie', fullName: null });
    expect(validate({ ...EMPTY, nickname: 'x'.repeat(MAX.nickname + 1) })).toMatch(/nickname/);
  });

  it('turns blanks into deletions and trims the rest', () => {
    expect(toPatch({ ...EMPTY, mobile: ' 0917 ', tribe: 'aeta' })).toMatchObject({ mobile: '0917', tribe: 'aeta', address: null, batch: null });
  });

  it('flags over-long answers and missing emergency contacts', () => {
    expect(validate({ ...EMPTY, batch: 'x'.repeat(MAX.batch + 1) })).toMatch(/batch/);
    expect(validate(EMPTY)).toBe('');
    expect(missingEmergency(EMPTY)).toBe(true);
    expect(missingEmergency({ ...EMPTY, ecName: 'Ana', ecMobile: '0918' })).toBe(false);
  });
});
