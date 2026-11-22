import {
  computeTribeTotals, duplicateIds, emptyPlacements, gamesForYear, placementsOf, pointsFromPlacement, scoreRows, toGame, toScore, years, type Placement, type Score,
} from '../../src/frontend/data/sportfest';

const score = (tribe: Score['tribe'], placement: Placement, points: number, gameId = 'g1'): Score => ({ id: `${gameId}${tribe}`, gameId, tribe, placement, points });

describe('pointsFromPlacement', () => {
  it('pays Class B 20/15/10/5 and scales Class A 5:3:2:1', () => {
    const places: Placement[] = [1, 2, 3, 4];
    expect(places.map((p) => pointsFromPlacement(p, 20, 'B'))).toEqual([20, 15, 10, 5]);
    expect(places.map((p) => pointsFromPlacement(p, 10, 'A'))).toEqual([10, 6, 4, 2]);
    expect(places.map((p) => pointsFromPlacement(p, 5, 'A'))).toEqual([5, 3, 2, 1]);
    expect(places.map((p) => pointsFromPlacement(p, 40, 'C'))).toEqual([40, 30, 20, 10]);
    expect(places.map((p) => pointsFromPlacement(p, 60, 'D'))).toEqual([60, 45, 30, 15]);
  });
});

describe('computeTribeTotals', () => {
  it('ranks by points, then golds, and counts medals and games', () => {
    const totals = computeTribeTotals([score('Aeta', 1, 20), score('Badjao', 2, 15), score('Aeta', 2, 15, 'g2'), score('Badjao', 1, 20, 'g2'), score('Mangyan', 3, 10)]);
    expect(totals.map((t) => t.tribe)).toEqual(['Aeta', 'Badjao', 'Mangyan', 'Tasaday']); // Aeta and Badjao tie on 35; both 1 gold, 1 silver → stable
    expect(totals[0]).toMatchObject({ tribe: 'Aeta', totalPoints: 35, gamesPlayed: 2, gold: 1, silver: 1 });
    expect(totals[3]).toMatchObject({ tribe: 'Tasaday', totalPoints: 0, gamesPlayed: 0 });
  });

  it('breaks a points tie by gold medals', () => {
    const totals = computeTribeTotals([score('Aeta', 1, 10), score('Badjao', 2, 10, 'g2')]);
    expect(totals[0].tribe).toBe('Aeta');
  });
});

describe('placements', () => {
  it('lets tied tribes share a place', () => {
    const rows = scoreRows({ gameClass: 'C', maxPoints: 20 }, { ...emptyPlacements(), Aeta: 1, Badjao: 1, Tasaday: 3 });
    expect(rows.map((r) => r.points)).toEqual([20, 20, 10]);
  });

  it('turns placements into priced score rows and back', () => {
    const rows = scoreRows({ gameClass: 'A', maxPoints: 10 }, { ...emptyPlacements(), Aeta: 2, Tasaday: 1 });
    expect(rows).toEqual([{ tribe: 'Aeta', placement: 2, points: 6 }, { tribe: 'Tasaday', placement: 1, points: 10 }]);
    expect(placementsOf([score('Aeta', 2, 6)])).toEqual({ ...emptyPlacements(), Aeta: 2 });
  });
});

describe('reading stored docs', () => {
  it('fills safe defaults for a game and drops a score with an unknown tribe', () => {
    expect(toGame('g1', { name: 'Tug of war', category: 'Sports', gameClass: 'A', maxPoints: 7, status: 'weird', year: 2026 })).toMatchObject({ gameClass: 'A', maxPoints: 10, status: 'upcoming', year: 2026 });
    expect(toGame('g2', { gameClass: 'D', maxPoints: 60 })).toMatchObject({ gameClass: 'D', maxPoints: 60 });
    expect(toGame('g3', { gameClass: 'Z', maxPoints: 5 })).toMatchObject({ gameClass: 'B', maxPoints: 20 });
    expect(toScore('s1', { gameId: 'g1', tribe: 'Vikings', placement: 1, points: 20 })).toBeNull();
    expect(toScore('s1', { gameId: 'g1', tribe: 'Aeta', placement: 1, points: 20 })).toMatchObject({ tribe: 'Aeta', placement: 1 });
  });

  it('lists the years newest first', () => {
    expect(years([toGame('a', { year: 2025 }), toGame('b', { year: 2026 }), toGame('c', { year: 2026 })])).toEqual([2026, 2025]);
  });
});

describe('yearly games', () => {
  const g = (id: string, name: string, year: number, status: string) => toGame(id, { name, category: 'Sports', gameClass: 'C', maxPoints: 40, status, year });

  it('flags upcoming stubs that repeat a played game', () => {
    const games = [g('a', 'Tug of war', 2026, 'completed'), g('b', 'tug of war ', 2026, 'upcoming'), g('c', 'Fire making', 2026, 'upcoming')];
    expect([...duplicateIds(games, new Set())]).toEqual(['b']);
    expect([...duplicateIds([g('a', 'Relay', 2026, 'upcoming'), g('b', 'Relay', 2026, 'upcoming')], new Set(['a']))]).toEqual(['b']);
  });

  it('copies last year’s games as upcoming, skipping ones already there', () => {
    const games = [g('a', 'Tug of war', 2026, 'completed'), g('b', 'Relay', 2026, 'completed'), g('c', 'Relay', 2027, 'upcoming')];
    expect(gamesForYear(games, 2026, 2027)).toEqual([{ name: 'Tug of war', category: 'Sports', date: '', status: 'upcoming', gameClass: 'C', maxPoints: 40, year: 2027 }]);
  });
});
