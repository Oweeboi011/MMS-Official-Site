import { splitTerms, termPattern } from '../../src/frontend/lib/terms';

describe('splitTerms', () => {
  it('marks whole-word terms, longest first', () => {
    expect(splitTerms('BMCM then BMC.', termPattern(['BMC', 'BMCM']))).toEqual([{ term: 'BMCM' }, ' then ', { term: 'BMC' }, '.']);
  });

  it('ignores partial words and keeps plain text intact', () => {
    expect(splitTerms('SARTorial', termPattern(['SART']))).toEqual(['SARTorial']);
    expect(splitTerms('', termPattern(['SART']))).toEqual(['']);
  });
});
