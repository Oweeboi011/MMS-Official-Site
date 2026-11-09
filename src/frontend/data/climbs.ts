// `climbs` docs (old Open Climbs shape) → schedule rows. Rules: docs/guides/CONTEXT.md#climbs.
import type { Doc } from '../lib/firestoreRest';
import { fromManilaDay, manilaDay, manilaYear } from '../lib/manila';
import type { Difficulty, OpenClimb } from './content';

export interface ScheduleClimb extends OpenClimb {
  id?: string;
  start?: Date;
  end?: Date;
  over: boolean;
  postponed?: boolean;
  rating?: string; // Philippine scale, e.g. "4/9"
}

const str = (v: unknown) => (typeof v === 'string' ? v : '');
const TYPES: Record<string, OpenClimb['type']> = { minor: 'Minor', major: 'Major', special: 'Special' };
const monthFmt = new Intl.DateTimeFormat('en-US', { month: 'short', timeZone: 'Asia/Manila' });

function toDate(v: unknown): Date | undefined {
  if (v instanceof Date) return v;
  return /^\d{4}-\d{2}-\d{2}$/.test(str(v)) ? fromManilaDay(str(v)) : undefined;
}

// 1–3 easy, 4–6 moderate, 7–9 advanced on the /9 scale. Bands: officers to confirm with the climb finder (open item 17).
function difficultyOf(rating: string): Difficulty {
  const n = Number(/^(\d)\s*\/\s*9$/.exec(rating)?.[1]);
  if (!n) return 'Not yet rated';
  if (n <= 3) return 'Easy';
  return n <= 6 ? 'Moderate' : 'Advanced';
}

function dateRange(start: Date, end: Date | undefined): string {
  const [s, e] = [start, end ?? start].map((d) => ({ m: monthFmt.format(d), d: Number(manilaDay(d).slice(8)) }));
  if (manilaDay(start) === manilaDay(end ?? start)) return `${s.m} ${s.d}`;
  return s.m === e.m ? `${s.m} ${s.d}–${e.d}` : `${s.m} ${s.d} – ${e.m} ${e.d}`;
}

const elevationOf = (v: unknown) => (typeof v === 'number' ? `${v.toLocaleString('en-US')}m` : str(v) || undefined);

// Drafts and cancelled climbs never reach the public schedule.
export const isPublic = (d: Doc) => !['draft', 'cancelled'].includes(str(d.status)) && str(d.cancellationStatus) !== 'cancelled';
const isOver = (d: Doc, last: Date | undefined, now: Date) => str(d.status) === 'completed' || (!!last && manilaDay(last) < manilaDay(now));

function datesOf(d: Doc, start: Date | undefined, end: Date | undefined) {
  if (!start) return { day: '', month: str(d.month), dates: str(d.dateLabel) };
  return { day: manilaDay(start).slice(8), month: monthFmt.format(start), dates: str(d.dateLabel) || dateRange(start, end) };
}

export const toClimb = (d: Doc, now: Date): ScheduleClimb | null => (isPublic(d) ? mapClimb(d, now) : null);

export function mapClimb(d: Doc, now: Date): ScheduleClimb {
  const start = toDate(d.startDate);
  const end = toDate(d.endDate);
  const rating = str(d.difficulty);
  return {
    id: str(d.id) || undefined,
    start,
    end,
    over: isOver(d, end ?? start, now),
    postponed: str(d.cancellationStatus) === 'postponed',
    title: str(d.title),
    location: str(d.location),
    ...datesOf(d, start, end),
    difficulty: difficultyOf(rating),
    rating: rating || undefined,
    elevation: elevationOf(d.elevation),
    type: TYPES[str(d.type).toLowerCase()] ?? 'Minor',
    status: str(d.status) === 'closed' ? 'Closed' : 'Open',
  };
}

const time = (c: ScheduleClimb) => c.start?.getTime() ?? Infinity;

// Upcoming: not over, soonest first (undated last). Completed: over in `year`, newest first.
export function splitSchedule(climbs: ScheduleClimb[], year: number) {
  return {
    upcoming: climbs.filter((c) => !c.over).sort((a, b) => time(a) - time(b)),
    completed: climbs.filter((c) => c.over && c.start && manilaYear(c.start) === year).sort((a, b) => time(b) - time(a)),
  };
}
