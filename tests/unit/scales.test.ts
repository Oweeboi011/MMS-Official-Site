import { difficultyText, trailClassText } from '../../src/frontend/data/scales';

describe('rating scales', () => {
  it('puts the old app’s words next to the numbers', () => {
    expect(trailClassText('4')).toBe('Class 4 · Easy climbing');
    expect(difficultyText('7/9')).toBe('7/9 · Difficult');
    expect(difficultyText('4 / 9')).toBe('4 / 9 · Moderate');
  });

  it('leaves anything else as typed', () => {
    expect(trailClassText('7')).toBe('7');
    expect(difficultyText('hard')).toBe('hard');
  });
});
