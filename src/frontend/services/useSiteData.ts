import { useEffect, useState } from 'react';
import { announcements, officers, surveys, type Announcement, type Officer, type Survey } from '../data/content';
import {
  currentExecom, leadershipBlocks, leadershipPath, pendingSettings, sampleSettings, toAnnouncement, toSettings, toSurveys,
  type SiteSettings,
} from '../data/liveContent';
import type { ContentBlock } from '../data/subpages';
import type { Doc } from '../lib/firestoreRest';
import { loadAnnouncements, loadOfficers, loadSettings, loadSurveys, publicReadsEnabled } from './publicData';

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

export const useAnnouncements = (): Announcement[] => liveOr(useLoaded(loadAnnouncements), (d) => d.map(toAnnouncement), announcements);
export const useSurveys = (): Survey[] => liveOr(useLoaded(loadSurveys), (d) => toSurveys(d, new Date()), surveys);
export const useExecom = (): Officer[] => liveOr(useLoaded(loadOfficers), currentExecom, officers);

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
