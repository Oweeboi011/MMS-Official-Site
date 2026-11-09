import { render } from '@testing-library/react';
import RichText from '../../src/frontend/components/RichText';
import { toClimb } from '../../src/frontend/data/climbs';

describe('difficulty bands (old app badges, owner decision 2026-11-09)', () => {
  it('maps 1–2 Easy, 3–4 Moderate, 5–9 Advanced', () => {
    const band = (r: string) => toClimb({ difficulty: r }, new Date())?.difficulty;
    expect(['1/9', '2/9', '3/9', '4/9', '5/9', '9/9', ''].map(band)).toEqual(['Easy', 'Easy', 'Moderate', 'Moderate', 'Advanced', 'Advanced', 'Not yet rated']);
  });
});

describe('RichText', () => {
  it('renders **bold** as <strong>, never as HTML', () => {
    const { container } = render(<p><RichText text={'a **b** c <i>x</i>'} /></p>);
    expect(container.querySelector('strong')?.textContent).toBe('b');
    expect(container.querySelector('i')).toBeNull();
    expect(container.textContent).toBe('a b c <i>x</i>');
  });
});
