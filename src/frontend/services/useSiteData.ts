import { useEffect, useState } from 'react';
import { announcements, officers, openClimbs, surveys, type Announcement, type Officer, type Survey } from '../data/content';
import {
  currentExecom, leadershipBlocks, leadershipPath, pendingSettings, sampleSettings, storiesBlocks, storiesPath, toAnnouncement, toSettings, toSurveys,
  type SiteSettings,
} from '../data/liveContent';
import { splitSchedule, toClimb, type ScheduleClimb } from '../data/climbs';
import type { ContentBlock } from '../data/subpages';
import type { Doc } from '../lib/firestoreRest';
import { manilaYear } from '../lib/manila';
import { climbLogBlocks, climbLogPath } from '../data/climbLog';
import { entryBlocks, entryPageOf } from '../data/entryBlocks';
import { announcementsLoader, climbsLoader, entriesLoader, loadClimbLog, loadCurrentOfficers, loadOfficers, loadReviews, loadSettings, loadSurveys, publicReadsEnabled } from './publicData';

// undefined = loading or failed (show nothing); null = nothing there (not configured, no doc). `load` must be module-level.
export function useLoaded<T>(load: (() => Promise<T | null | undefined>) | null): T | null | undefined {
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

// Nothing entered (null or empty) keeps the sample blocks; still loading ([]) shows none, so sample never flashes over real data.
function swapIn(blocks: ContentBlock[], docs: Doc[] | null | undefined, live: (b: ContentBlock[], d: Doc[]) => ContentBlock[]): ContentBlock[] {
  return docs === null || docs?.length === 0 ? blocks : live(blocks, docs ?? []);
}

// Officer-submitted entries (ADR 0010): real entries replace the sample blocks, never mixed; none keeps the sample.
// A page with no sample blocks (e.g. videos) shows only entries.
function fromEntries(path: string, blocks: ContentBlock[] | undefined, docs: Doc[] | null | undefined): ContentBlock[] | undefined {
  if (docs === undefined) return blocks ? [] : blocks;
  const live = entryBlocks(path, docs ?? []);
  return live.length ? live : blocks;
}

// Pages whose sample blocks give way to live data: leadership (officers) and stories (approved reviews).
export function useLiveBlocks(path: string, blocks: ContentBlock[] | undefined): ContentBlock[] | undefined {
  const entryPage = entryPageOf(path);
  const entryDocs = useLoaded(entryPage ? entriesLoader(entryPage) : null);
  const officerDocs = useLoaded(path === leadershipPath ? loadOfficers : null);
  const reviewDocs = useLoaded(path === storiesPath ? loadReviews : null);
  const logDocs = useLoaded(path === climbLogPath ? loadClimbLog : null);
  if (entryPage) return fromEntries(path, blocks, entryDocs);
  if (!blocks) return blocks;
  if (path === leadershipPath) return swapIn(blocks, officerDocs, leadershipBlocks);
  if (path === climbLogPath) return swapIn(blocks, logDocs, (b, d) => climbLogBlocks(b, d, new Date()));
  return path === storiesPath ? swapIn(blocks, reviewDocs, storiesBlocks) : blocks;
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
