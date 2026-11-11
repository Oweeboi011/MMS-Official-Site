// The MMS Climb/Hike Log: every completed open climb, newest first. Plain data: no Firebase here.
import type { Doc } from '../lib/firestoreRest';
import { manilaYear } from '../lib/manila';
import { mapClimb, isPublic, type ScheduleClimb } from './climbs';
import type { ContentBlock } from './subpages';

export const climbLogPath = '/explore/climb-log';

interface LogEntry { climb: ScheduleClimb; joined: number | null }

const joinedOf = (d: Doc) => (typeof d.registrationCount === 'number' ? d.registrationCount : null);

// Public (not draft or cancelled), over, and dated; postponed climbs have not happened.
export function completedEntries(docs: Doc[], now: Date): LogEntry[] {
  return docs
    .filter(isPublic)
    .map((d) => ({ climb: mapClimb(d, now), joined: joinedOf(d) }))
    .filter(({ climb }) => climb.over && !climb.postponed && climb.start)
    .sort((a, b) => (b.climb.start?.getTime() ?? 0) - (a.climb.start?.getTime() ?? 0));
}

const dated = ({ climb }: LogEntry) => `${climb.dates}, ${manilaYear(climb.start as Date)}`;

// Real completed climbs replace the sample log; none keeps the sample. Counts are of what the log lists.
export function climbLogBlocks(blocks: ContentBlock[], docs: Doc[], now: Date): ContentBlock[] {
  const entries = completedEntries(docs, now);
  if (!entries.length) return blocks;
  const of = (type: string) => String(entries.filter((e) => e.climb.type === type).length);
  return [
    { type: 'stats', items: [{ value: String(entries.length), label: 'Climbs logged' }, { value: of('Minor'), label: 'Minor climbs' }, { value: of('Major'), label: 'Major climbs' }, { value: of('Special'), label: 'Special climbs' }] },
    {
      type: 'table', eyebrow: 'Completed open climbs', title: 'Climb log.', pageSize: 20,
      columns: ['Date', 'Climb', 'Type', 'Joined'],
      rows: entries.map((e) => [dated(e), e.climb.title, e.climb.type, e.joined === null ? '' : String(e.joined)]),
    },
  ];
}
