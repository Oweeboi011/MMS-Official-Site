import { manilaDay } from '../lib/manila';

// "Add to calendar" (.ics, RFC 5545): one all-day event per climb. Only facts the site already shows; no times invented.
interface CalendarClimb { id?: string; title: string; location: string; dates: string; start?: Date; end?: Date }

const DAY_MS = 86400000;
const compact = (day: string) => day.replaceAll('-', '');
const escapeText = (s: string) => s.replaceAll('\\', '\\\\').replaceAll(';', '\\;').replaceAll(',', '\\,').replaceAll('\n', '\\n');

// Lines over 75 octets continue on the next line after a space.
function fold(line: string): string {
  const parts: string[] = [];
  let rest = line;
  while (new TextEncoder().encode(rest).length > 75) {
    let cut = 75;
    while (new TextEncoder().encode(rest.slice(0, cut)).length > 75) cut -= 1;
    parts.push(rest.slice(0, cut));
    rest = ` ${rest.slice(cut)}`;
  }
  return [...parts, rest].join('\r\n');
}

export function climbCalendar(climb: CalendarClimb, origin: string, stamp: Date): string | null {
  if (!climb.start) return null;
  const last = climb.end ?? climb.start;
  const url = `${origin}/climbs/${climb.id ?? ''}`;
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//MMS//Open Climbs//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${climb.id ?? compact(manilaDay(climb.start))}@metropolitanms.org`,
    `DTSTAMP:${stamp.toISOString().replace(/[-:]|\.\d{3}/g, '')}`,
    `DTSTART;VALUE=DATE:${compact(manilaDay(climb.start))}`,
    `DTEND;VALUE=DATE:${compact(manilaDay(new Date(last.getTime() + DAY_MS)))}`, // end date is exclusive
    `SUMMARY:${escapeText(climb.title)}`,
    ...(climb.location ? [`LOCATION:${escapeText(climb.location)}`] : []),
    `DESCRIPTION:${escapeText('MMS open climb, guests welcome. Details and updates: ' + url)}`,
    `URL:${url}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  return `${lines.map(fold).join('\r\n')}\r\n`;
}

export const calendarFileName = (title: string) => `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'climb'}.ics`;
