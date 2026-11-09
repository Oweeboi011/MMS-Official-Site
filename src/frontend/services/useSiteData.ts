import { useEffect, useMemo, useState } from 'react';
import { announcements, officers, openClimbs, surveys, type Announcement, type Officer, type Survey } from '../data/content';
import {
  currentExecom, leadershipBlocks, leadershipPath, pendingSettings, sampleSettings, toAnnouncement, toSettings, toSurveys,
  type SiteSettings,
} from '../data/liveContent';
import { splitSchedule, toClimb, toClimbDetail, type ClimbDetail, type ScheduleClimb } from '../data/climbs';
import type { ContentBlock } from '../data/subpages';
import type { Doc } from '../lib/firestoreRest';
import { manilaYear } from '../lib/manila';
import { announcementsLoader, climbLoader, climbsLoader, loadCurrentOfficers, loadOfficers, loadSettings, loadSurveys, publicReadsEnabled } from './publicData';

// undefined = loading or failed (show nothing); null = nothing there (not configured, no doc). `load` must be module-level.
function useLoaded<T>(load: (() => Promise<T | null | undefined>) | null): T | null | undefined {
  const [value, setValue] = useState<T | null | undefined>(load && publicReadsEnabled ? undefined : null);
  useEffect(() => {
    if (!load || !publicReadsEnabled) return undefined;
    let live = true;
    void load().then((v) => { if (live) setValue(v); });
    return () => { live = false; };
  }, [load]);
  return value;
}

// Nothing entered yet (empty or no answer) → sample list, as before item 22 (officers confirm content first, item 11).
function liveOr<T>(docs: Doc[] | null | undefined, live: (d: Doc[]) => T[], sample: T[]): T[] {
  if (docs === undefined) return [];
  return docs?.length ? live(docs) : sample;
}

const ANNOUNCEMENTS_PAGE = 30;
export const useAnnouncements = (limit = ANNOUNCEMENTS_PAGE): Announcement[] =>
  liveOr(useLoaded(announcementsLoader(limit)), (d) => d.map(toAnnouncement), announcements).slice(0, limit);
export const useSurveys = (): Survey[] => liveOr(useLoaded(loadSurveys), (d) => toSurveys(d, new Date()), surveys);
export const useExecom = (): Officer[] => liveOr(useLoaded(loadCurrentOfficers), currentExecom, officers);

export function useSiteSettings(): SiteSettings {
  const doc = useLoaded(loadSettings);
  if (doc === undefined) return pendingSettings;
  return doc ? toSettings(doc) : sampleSettings;
}

export function useLeadershipBlocks(path: string, blocks: ContentBlock[] | undefined): ContentBlock[] | undefined {
  const docs = useLoaded(path === leadershipPath ? loadOfficers : null);
  if (path !== leadershipPath || !blocks || docs === null || docs?.length === 0) return blocks;
  return leadershipBlocks(blocks, docs ?? []);
}

export interface ClimbSchedule {
  upcoming: ScheduleClimb[];
  completed: ScheduleClimb[];
  loading: boolean;
}

const sampleSchedule: ClimbSchedule = { upcoming: openClimbs.map((c) => ({ ...c, over: false })), completed: [], loading: false };

// year = null: this year's schedule (sample until climbs exist). A past year: its completed climbs, never sample.
export function useClimbSchedule(year: number | null): ClimbSchedule {
  const now = new Date();
  const thisYear = manilaYear(now);
  const docs = useLoaded(climbsLoader(year ?? thisYear, year !== null));
  if (docs === undefined) return { upcoming: [], completed: [], loading: true };
  if (!docs?.length && year === null) return sampleSchedule;
  const climbs = (docs ?? []).flatMap((d) => toClimb(d, now) ?? []);
  const { upcoming, completed } = splitSchedule(climbs, year ?? thisYear);
  return { upcoming: year === null ? upcoming : [], completed, loading: false };
}

// undefined = loading or failed; null = no such public climb.
export function useClimb(id: string): ClimbDetail | null | undefined {
  const load = useMemo(() => () => climbLoader(id), [id]);
  const doc = useLoaded(load);
  if (doc === undefined) return undefined;
  return doc ? toClimbDetail(doc, new Date()) : null;
}
