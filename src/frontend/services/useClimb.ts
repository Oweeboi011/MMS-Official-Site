// One climb for /climbs/:id. Separate from useSiteData so its mapper loads with the climb page chunk.
import { useMemo } from 'react';
import { toClimbDetail, type ClimbDetail } from '../data/climbDetail';
import { climbLoader } from './publicData';
import { useLoaded } from './useSiteData';

// undefined = loading or failed; null = no such public climb.
export function useClimb(id: string): ClimbDetail | null | undefined {
  const load = useMemo(() => () => climbLoader(id), [id]);
  const doc = useLoaded(load);
  if (doc === undefined) return undefined;
  return doc ? toClimbDetail(doc, new Date()) : null;
}
