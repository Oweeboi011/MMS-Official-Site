import { recommendClimbs } from '../../src/frontend/lib/recommend';

type D = 'Easy' | 'Moderate' | 'Advanced' | 'Not yet rated';
const climbs: { title: string; difficulty: D; status: string }[] = [
  { title: 'Easy', difficulty: 'Easy', status: 'Open' },
  { title: 'Moderate', difficulty: 'Moderate', status: 'Open' },
  { title: 'Advanced', difficulty: 'Advanced', status: 'Open' },
  { title: 'Closed easy', difficulty: 'Easy', status: 'Closed' },
];
const titles = (allowed: readonly D[] | 'all') => recommendClimbs(climbs, allowed).map((c) => c.title);

describe('recommendClimbs', () => {
  it('suggests only open climbs at the allowed difficulties', () => {
    expect(titles(['Easy', 'Moderate'])).toEqual(['Easy', 'Moderate']);
  });

  it('never suggests advanced climbs to first-timers, even when nothing else is open', () => {
    expect(recommendClimbs(climbs.slice(2), ['Easy', 'Moderate'])).toEqual([]);
  });

  it("'all' means every open climb", () => {
    expect(titles('all')).toEqual(['Easy', 'Moderate', 'Advanced']);
  });
});
