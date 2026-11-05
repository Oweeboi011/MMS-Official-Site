// Climb picks for a joiner: open climbs whose difficulty is in the allowed list ('all' = any).
export function recommendClimbs<T extends { difficulty: string; status: string }>(
  climbs: T[],
  allowed: readonly T['difficulty'][] | 'all',
): T[] {
  return climbs.filter((c) => c.status === 'Open' && (allowed === 'all' || allowed.includes(c.difficulty)));
}
