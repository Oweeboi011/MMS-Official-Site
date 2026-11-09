// Admin editor for `climbs` (old Open Climbs shape, read by data/climbs.ts). Rules: admins write, anyone reads.
import { flatCodec, groupedCodec, type Column } from './records';
import { setupGaps } from './climbSetup';
import { REQUIRED_DOCS } from './requiredDocs';
import type { CollectionSpec, Doc, Field, FormValues } from './siteSchemas';

// Old app's shapes: fees[{label, amount, note, optional, isGuestFee}], officers[{role, name}], itinerary[{day, entries[{time, activity}]}].
const feeColumns: Column[] = [
  { key: 'label', label: 'Fee', required: true, max: 80 },
  { key: 'amount', label: 'Amount (₱ or TBA)', required: true, max: 20 },
  { key: 'note', label: 'Note', max: 200 },
  { key: 'optional', label: 'Optional', kind: 'bool' },
  { key: 'isGuestFee', label: 'Guest fee', kind: 'bool' },
];
const OFFICER_ROLES = ['Senior Team Leader', 'Team Leader', 'Assistant Team Leader', 'Scribe'] as const;
const officerColumns: Column[] = [
  { key: 'role', label: 'Role', kind: 'select', required: true, options: OFFICER_ROLES },
  { key: 'name', label: 'Name', required: true, max: 120 },
];
const itineraryColumns: Column[] = [
  { key: 'day', label: 'Day', required: true, max: 40 },
  { key: 'time', label: 'Time', max: 20 },
  { key: 'activity', label: 'Activity', required: true, max: 200 },
];
const routeColumns: Column[] = [
  { key: 'label', label: 'Route name', max: 60 },
  { key: 'allTrailsUrl', label: 'AllTrails link', kind: 'link', max: 500 },
  { key: 'komootUrl', label: 'Komoot link', kind: 'link', max: 500 },
  { key: 'googleMapsUrl', label: 'Google Maps link', kind: 'link', max: 500 },
];

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
  todo: setupGaps,
  rowLink: (id) => ({ to: `/admin/climbs/${id}`, label: 'Registrations, payments, CSV →' }),
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
    { key: 'gcashName', label: 'GCash account name (MMS account only)', kind: 'text', max: 120, hint: 'Never a personal wallet (open item 23).' },
    { key: 'gcashNumber', label: 'GCash number', kind: 'text', max: 20 },
    { key: 'gcashQrUrl', label: 'GCash / QR Ph code image link', kind: 'link' },
    ...REQUIRED_DOCS.flatMap((t): Field[] => [
      { key: t.requiresField, label: `Require: ${t.label}`, kind: 'bool' },
      { key: t.sampleUrlField, label: `${t.label}: template / sample link`, kind: 'link' },
    ]),
    { key: 'donationDrive.enabled', label: 'Outreach donation drive on', kind: 'bool' },
    { key: 'donationDrive.beneficiary', label: 'Drive beneficiary (school, community…)', kind: 'text', max: 200 },
    { key: 'donationDrive.description', label: 'Drive description', kind: 'longText', max: 1000 },
    { key: 'donationDrive.suggestedItems', label: 'Items needed (one per line)', kind: 'longText', max: 2000 },
    { key: 'fees', label: 'Fees', kind: 'records', columns: feeColumns, codec: flatCodec(feeColumns), hint: 'Amount in pesos, or TBA. Guest fee: charged to guests only, never members.' },
    { key: 'officers', label: 'Climb officers (shown on the climb page)', kind: 'records', columns: officerColumns, codec: flatCodec(officerColumns) },
    { key: 'itinerary', label: 'Itinerary', kind: 'records', columns: itineraryColumns, codec: groupedCodec('day', 'entries', itineraryColumns), hint: 'One row per activity; rows with the same day name in a row form that day.' },
    { key: 'trailMaps', label: 'Trail routes (maps)', kind: 'records', columns: routeColumns, codec: flatCodec(routeColumns), hint: 'One row per route; the first is shown first. Replaces the single links below.' },
    { key: 'googleMapsUrl', label: 'Google Maps link (single route, older climbs)', kind: 'link' },
    { key: 'allTrailsUrl', label: 'AllTrails link (single route)', kind: 'link' },
    { key: 'komootUrl', label: 'Komoot link (single route)', kind: 'link' },
  ],
};
