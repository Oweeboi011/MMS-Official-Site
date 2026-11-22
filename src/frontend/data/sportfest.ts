// Sportfest and Beachineering scoreboard: games, per-tribe placements and tribe totals. Plain data: no Firebase here.
// Classes as used on the live scoreboard: A pays 5:3:2:1 of the top points, B pays 20/15/10/5, C and D pay 100/75/50/25 percent.
export const TRIBES = ['Aeta', 'Badjao', 'Mangyan', 'Tasaday'] as const;
export type Tribe = (typeof TRIBES)[number];

export const TRIBE_COLORS: Record<Tribe, string> = { Aeta: '#1a7a72', Badjao: '#c4692a', Mangyan: '#6a7c30', Tasaday: '#7c5293' };

export type GameClass = 'A' | 'B' | 'C' | 'D';
export type GameStatus = 'upcoming' | 'ongoing' | 'completed';
export type Placement = 1 | 2 | 3 | 4;
export type MaxPoints = 5 | 10 | 20 | 40 | 60;

export interface Game { id: string; name: string; category: string; date: string; status: GameStatus; gameClass: GameClass; maxPoints: MaxPoints; year: number }
export interface Score { id: string; gameId: string; tribe: Tribe; placement: Placement; points: number }
export interface TribeTotals { tribe: Tribe; totalPoints: number; gamesPlayed: number; gold: number; silver: number; bronze: number; fourth: number }
export type Placements = Record<Tribe, Placement | null>;

export const PLACEMENTS: readonly Placement[] = [1, 2, 3, 4];
// Top points a class may carry (what the live scoreboard uses).
export const CLASS_POINTS: Record<GameClass, readonly MaxPoints[]> = { A: [5, 10], B: [20], C: [20, 40], D: [60] };
export const GAME_CLASSES: readonly GameClass[] = ['A', 'B', 'C', 'D'];
const CLASS_B: Record<Placement, number> = { 1: 20, 2: 15, 3: 10, 4: 5 };
const CLASS_A_RATIO: Record<Placement, number> = { 1: 5, 2: 3, 3: 2, 4: 1 };
const CLASS_CD_SHARE: Record<Placement, number> = { 1: 1, 2: 0.75, 3: 0.5, 4: 0.25 };

export type GameFields = Pick<Game, 'name' | 'category' | 'date' | 'status' | 'gameClass' | 'maxPoints' | 'year'>;

const BLANK_GAME: GameFields = { name: '', category: '', date: '', status: 'upcoming', gameClass: 'B', maxPoints: 20, year: 0 };

export function newGameFields(game: Game | undefined, year: number): GameFields {
  if (!game) return { ...BLANK_GAME, year };
  const { name, category, date, status, gameClass, maxPoints } = game;
  return { name, category, date, status, gameClass, maxPoints, year: game.year };
}

export const gameProblem = (f: GameFields) => (f.name.trim() && f.category.trim() ? '' : 'Add the game name and its category.');

export const defaultMaxPoints = (gameClass: GameClass): MaxPoints => CLASS_POINTS[gameClass][CLASS_POINTS[gameClass].length - 1];

export function pointsFromPlacement(placement: Placement, maxPoints: number, gameClass: GameClass): number {
  if (gameClass === 'B') return CLASS_B[placement];
  if (gameClass === 'A') return CLASS_A_RATIO[placement] * (maxPoints / 5);
  return CLASS_CD_SHARE[placement] * maxPoints;
}

const str = (v: unknown) => (typeof v === 'string' ? v : '');
const STATUSES: GameStatus[] = ['upcoming', 'ongoing', 'completed'];

export function toGame(id: string, d: Record<string, unknown>): Game {
  const gameClass = GAME_CLASSES.find((c) => c === d.gameClass) ?? 'B';
  const maxPoints = CLASS_POINTS[gameClass].find((m) => m === d.maxPoints) ?? defaultMaxPoints(gameClass);
  return {
    id, name: str(d.name), category: str(d.category), date: str(d.date), gameClass, maxPoints,
    status: STATUSES.find((s) => s === d.status) ?? 'upcoming', year: typeof d.year === 'number' ? d.year : 0,
  };
}

export function toScore(id: string, d: Record<string, unknown>): Score | null {
  const tribe = TRIBES.find((t) => t === d.tribe);
  const placement = PLACEMENTS.find((p) => p === d.placement);
  if (!tribe || !placement) return null;
  return { id, gameId: str(d.gameId), tribe, placement, points: Number(d.points) || 0 };
}

export function computeTribeTotals(scores: Score[]): TribeTotals[] {
  const totals = new Map<Tribe, TribeTotals>(TRIBES.map((tribe) => [tribe, { tribe, totalPoints: 0, gamesPlayed: 0, gold: 0, silver: 0, bronze: 0, fourth: 0 }]));
  const medal: Record<Placement, 'gold' | 'silver' | 'bronze' | 'fourth'> = { 1: 'gold', 2: 'silver', 3: 'bronze', 4: 'fourth' };
  for (const s of scores) {
    const t = totals.get(s.tribe);
    if (!t) continue;
    t.totalPoints += s.points;
    t.gamesPlayed += 1;
    t[medal[s.placement]] += 1;
  }
  return [...totals.values()].sort((a, b) => b.totalPoints - a.totalPoints || b.gold - a.gold || b.silver - a.silver || b.bronze - a.bronze);
}

export const emptyPlacements = (): Placements => ({ Aeta: null, Badjao: null, Mangyan: null, Tasaday: null });

// Ties are allowed (two tribes can share a place), as on the live scoreboard.
export function placementsOf(scores: Score[]): Placements {
  const p = emptyPlacements();
  for (const s of scores) p[s.tribe] = s.placement;
  return p;
}

// The score rows to save for one game (unplaced tribes get none).
export function scoreRows(game: Pick<Game, 'gameClass' | 'maxPoints'>, p: Placements) {
  return TRIBES.flatMap((tribe) => {
    const placement = p[tribe];
    return placement === null ? [] : [{ tribe, placement, points: pointsFromPlacement(placement, game.maxPoints, game.gameClass) }];
  });
}

const sameGame = (a: Game, b: Game) => a.year === b.year && a.name.trim().toLowerCase() === b.name.trim().toLowerCase();

// Upcoming games with no results that repeat a played game of the same name and year (left over from the old app).
export function duplicateIds(games: Game[], scored: ReadonlySet<string>): Set<string> {
  const stubs = games.filter((g) => g.status === 'upcoming' && !scored.has(g.id));
  return new Set(stubs.filter((s) => games.some((g) => g.id !== s.id && sameGame(g, s) && (g.status !== 'upcoming' || scored.has(g.id)))).map((s) => s.id));
}

// Next year's list starts from this year's games: same name, class and points, back to upcoming with no date.
export function gamesForYear(games: Game[], from: number, to: number): GameFields[] {
  const have = games.filter((g) => g.year === to);
  return games
    .filter((g) => g.year === from && !have.some((h) => sameGame(h, { ...g, year: to })))
    .map(({ name, category, gameClass, maxPoints }) => ({ name, category, date: '', status: 'upcoming' as const, gameClass, maxPoints, year: to }));
}

export const years = (games: Game[]) => [...new Set(games.map((g) => g.year))].sort((a, b) => b - a);

export const SCORING_TABLE: { label: string; gameClass: GameClass; maxPoints: MaxPoints }[] = [
  { label: 'Class A, 5 points', gameClass: 'A', maxPoints: 5 },
  { label: 'Class A, 10 points', gameClass: 'A', maxPoints: 10 },
  { label: 'Class B, 20 points', gameClass: 'B', maxPoints: 20 },
  { label: 'Class C, 20 points', gameClass: 'C', maxPoints: 20 },
  { label: 'Class C, 40 points', gameClass: 'C', maxPoints: 40 },
  { label: 'Class D, 60 points', gameClass: 'D', maxPoints: 60 },
];
