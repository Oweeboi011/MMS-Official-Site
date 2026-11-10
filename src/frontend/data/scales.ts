// The two rating scales, with the old app's words (mms-open-climbs utils/trailClass). Trail class: 1-6 technical terrain.
// Difficulty: the 1-9 Philippine composite score, stored as "7/9".
const TRAIL_CLASS: Record<number, string> = { 1: 'Easy walking', 2: 'Simple hiking', 3: 'Scrambling', 4: 'Easy climbing', 5: 'Technical climbing', 6: 'Extreme/technical terrain' };
const DIFFICULTY: Record<number, string> = { 1: 'Very easy', 2: 'Easy', 3: 'Beginner-friendly', 4: 'Moderate', 5: 'Moderately difficult', 6: 'Fairly difficult', 7: 'Difficult', 8: 'Very difficult', 9: 'Most difficult' };

export function trailClassText(value: string): string {
  const n = Number(value);
  return TRAIL_CLASS[n] ? `Class ${n} · ${TRAIL_CLASS[n]}` : value;
}

export function difficultyText(value: string): string {
  const n = Number(/^(\d)\s*\/\s*9$/.exec(value)?.[1]);
  return DIFFICULTY[n] ? `${value} · ${DIFFICULTY[n]}` : value;
}
