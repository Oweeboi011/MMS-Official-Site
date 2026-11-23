import { accentVars } from '../../src/frontend/lib/accent';

describe('accentVars', () => {
  it('pairs each brand token with its text-safe twin', () => {
    expect(accentVars('var(--navy)')).toEqual({ '--accent': 'var(--navy)', '--accent-ink': 'var(--navy-ink)' });
    expect(accentVars('var(--green)')['--accent-ink']).toBe('var(--green-ink)');
    expect(accentVars('var(--red)')['--accent-ink']).toBe('var(--red-ink)');
  });
  it('leaves any other colour as it is', () => {
    expect(accentVars('#e1b827')).toEqual({ '--accent': '#e1b827', '--accent-ink': '#e1b827' });
    expect(accentVars('var(--gold)')['--accent-ink']).toBe('var(--gold)');
  });
});
