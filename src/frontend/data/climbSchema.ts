// Admin editor for `climbs` (old Open Climbs shape, read by data/climbs.ts). Rules: admins write, anyone reads.
import type { CollectionSpec, Doc, FormValues } from './siteSchemas';

const day = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Manila', year: 'numeric', month: '2-digit', day: '2-digit' });
const dayOf = (v: unknown) => {
  if (v && typeof v === 'object' && 'toDate' in v) return day.format((v as { toDate: () => Date }).toDate());
  return typeof v === 'string' ? v : 'no date';
};

function check(v: FormValues): string | null {
  const rating = String(v.difficulty ?? '').trim();
  if (rating && !/^[1-9]\/9$/.test(rating)) return 'Difficulty: write it as N/9, e.g. 4/9.';
  if (v.endDate && v.startDate && String(v.endDate) < String(v.startDate)) return 'End date is before the start date.';
  return null;
}

export const climbsSpec: CollectionSpec = {
  id: 'climbs', label: 'Climbs', titleField: 'title', check,
  orderBy: { field: 'startDate', desc: true },
  rowLabel: (d: Doc) => `${dayOf(d.startDate)} · ${String(d.title ?? '(untitled)')} · ${String(d.status ?? '')}`,
  fields: [
    { key: 'title', label: 'Mountain / climb name', kind: 'text', required: true, max: 200 },
    { key: 'location', label: 'Location (town, province)', kind: 'text', required: true, max: 200, hint: 'Also used to find the weather forecast.' },
    { key: 'type', label: 'Type', kind: 'select', required: true, options: ['minor', 'major', 'special'] },
    { key: 'status', label: 'Status', kind: 'select', required: true, options: ['draft', 'open', 'closed', 'completed', 'cancelled'], hint: 'Draft = hidden from the public. Cancelled = hidden from lists; its link explains.' },
    { key: 'cancellationStatus', label: 'Postponed?', kind: 'select', options: ['postponed'], hint: 'Pick "postponed" to tag it; clear when new dates are set.' },
    { key: 'startDate', label: 'Start date', kind: 'date', required: true },
    { key: 'endDate', label: 'End date (multi-day)', kind: 'date' },
    { key: 'dateLabel', label: 'Date label override (e.g. "Nov 20–22")', kind: 'text', max: 60 },
    { key: 'difficulty', label: 'Difficulty (N/9)', kind: 'text', max: 4 },
    { key: 'trailClass', label: 'Trail class (1–6)', kind: 'int', range: [1, 6] },
    { key: 'elevation', label: 'Elevation (m)', kind: 'int', range: [0, 9000] },
    { key: 'jumpOff', label: 'Jump-off', kind: 'text', max: 200 },
    { key: 'jumpOffElevation', label: 'Jump-off elevation (m)', kind: 'int', range: [0, 9000] },
    { key: 'distanceToSummit', label: 'Jump-off to peak (e.g. 6 km)', kind: 'text', max: 40 },
    { key: 'roundTripDistance', label: 'Round trip (e.g. 12 km)', kind: 'text', max: 40 },
    { key: 'elevationGain', label: 'Elevation gain (e.g. 900 m)', kind: 'text', max: 40 },
    { key: 'recommendedDays', label: 'Recommended (e.g. 2 days)', kind: 'text', max: 40 },
    { key: 'maxParticipants', label: 'Slots', kind: 'int', range: [1, 500] },
    { key: 'description', label: 'About the climb', kind: 'longText', max: 4000 },
    { key: 'features', label: 'Features', kind: 'text', max: 300 },
    { key: 'waterSourceNote', label: 'Water source note', kind: 'longText', max: 500 },
    { key: 'thingsToBring', label: 'Things to bring (one per line; blank = default list)', kind: 'lines', max: 120 },
    { key: 'trailImages', label: 'Photo links (one https:// link per line)', kind: 'lines', linesAreLinks: true, max: 500 },
    { key: 'googleMapsUrl', label: 'Google Maps link', kind: 'link' },
    { key: 'allTrailsUrl', label: 'AllTrails link', kind: 'link' },
    { key: 'komootUrl', label: 'Komoot link', kind: 'link', hint: 'Several routes or the itinerary: Firebase console for now.' },
  ],
};
