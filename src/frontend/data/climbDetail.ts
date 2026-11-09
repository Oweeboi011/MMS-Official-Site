// One climb's page data (/climbs/:id). Own module so it loads with the climb page, not the home page.
import type { Doc } from '../lib/firestoreRest';
import { fromManilaDay, manilaDay } from '../lib/manila';
import type { Coords } from '../lib/trailEmbeds';
import { isPublic, mapClimb, type ScheduleClimb } from './climbs';
import type { Stat } from './content';
import type { FeeItem } from './registration';
import { driveOf, type Drive } from './donations';
import { REQUIRED_DOCS, type DocType } from './requiredDocs';

const https = (v: unknown) => (typeof v === 'string' && v.startsWith('https://') ? v : '');

const noticeDay = (ms: unknown) => (typeof ms === 'number' && ms > 0 ? new Date(ms).toLocaleDateString('en-PH', { dateStyle: 'medium', timeZone: 'Asia/Manila' }) : '');

function noticesOf(v: unknown) {
  return (Array.isArray(v) ? v : []).map((n) => (n ?? {}) as Doc)
    .filter((n) => str(n.message))
    .sort((a, b) => Number(b.pinned === true) - Number(a.pinned === true) || (Number(b.createdAt) || 0) - (Number(a.createdAt) || 0))
    .map((n) => ({ message: str(n.message), pinned: n.pinned === true, date: noticeDay(n.createdAt) }));
}

function payToOf(d: Doc) {
  const payTo = { name: str(d.gcashName), number: str(d.gcashNumber), qrUrl: https(d.gcashQrUrl) };
  return payTo.name || payTo.number || payTo.qrUrl ? payTo : null;
}

const str = (v: unknown) => (typeof v === 'string' ? v : '');

const DEFAULT_DUE_DAYS_BEFORE = 5; // old app registrationPolicy default; officers can set paymentDueDate
export function paymentDueOf(d: Doc, start?: Date): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(str(d.paymentDueDate))) return str(d.paymentDueDate);
  return start ? manilaDay(new Date(start.getTime() - DEFAULT_DUE_DAYS_BEFORE * 86400000)) : '';
}
export const dueLabel = (day: string) => fromManilaDay(day).toLocaleDateString('en-PH', { month: 'long', day: 'numeric', timeZone: 'Asia/Manila' });

export interface ClimbDetail extends ScheduleClimb {
  cancelled: boolean;
  description: string;
  stats: Stat[];
  thingsToBring: string[]; // empty → default packing list
  features: string;
  waterNote: string;
  trailMaps: TrailMap[];
  photos: string[]; // https only
  coords: Coords | null;
  itinerary: ItineraryDay[];
  fees: string[][]; // Fee, Amount, Who pays (table rows)
  feeItems: FeeItem[]; // raw, for registration
  payTo: { name: string; number: string; qrUrl: string } | null; // GCash / QR Ph details (ADR 0007)
  drive: Drive | null; // outreach donation drive
  notices: { message: string; pinned: boolean; date: string }[]; // per-climb announcements, pinned first
  requiredDocs: (DocType & { sampleUrl: string })[];
  officers: { role: string; name: string }[];
  paymentDue: string; // YYYY-MM-DD (Manila): the officers' date, else 5 days before the start; '' when undated
}

export interface ItineraryDay { day: string; entries: { time: string; activity: string }[] }

const peso = (amount: string) => (/^\d+(\.\d+)?$/.test(amount) ? `₱${Number(amount).toLocaleString('en-PH')}` : amount || 'TBA');

// Guest fee: guests only, never members (old app feeSummary). Optional: only if availed.
function feesOf(v: unknown): string[][] {
  return (Array.isArray(v) ? v.map(record) : []).filter((f) => str(f.label)).map((f) => {
    let who = str(f.note);
    if (f.isGuestFee === true) who = 'Guests only';
    else if (f.optional === true) who = ['Optional', str(f.note)].filter(Boolean).join(': ');
    return [str(f.label), peso(text(f.amount)), who || 'Everyone'];
  });
}

export interface TrailMap { label: string; googleMapsUrl: string; allTrailsUrl: string; komootUrl: string }

const strings = (v: unknown) => (Array.isArray(v) ? v.filter((t): t is string => typeof t === 'string' && t !== '') : []);
const record = (v: unknown) => (v && typeof v === 'object' ? (v as Doc) : {});

// trailMaps[] (current) or the legacy single googleMapsUrl / allTrailsUrl / komootUrl fields.
function trailMapsOf(d: Doc): TrailMap[] {
  const raw = Array.isArray(d.trailMaps) && d.trailMaps.length ? d.trailMaps.map(record) : [d];
  return raw
    .map((t) => ({ label: str(t.label), googleMapsUrl: str(t.googleMapsUrl), allTrailsUrl: str(t.allTrailsUrl), komootUrl: str(t.komootUrl) }))
    .filter((t) => t.googleMapsUrl || t.allTrailsUrl || t.komootUrl);
}

function itineraryOf(v: unknown): ItineraryDay[] {
  if (!Array.isArray(v)) return [];
  return v.map(record).map((day) => ({
    day: str(day.day),
    entries: (Array.isArray(day.entries) ? day.entries.map(record) : []).map((e) => ({ time: str(e.time), activity: str(e.activity) })).filter((e) => e.activity),
  })).filter((day) => day.entries.length);
}

function coordsOf(d: Doc): Coords | null {
  const lat = Number(d.mapLat);
  const lng = Number(d.mapLng);
  return d.mapLat && d.mapLng && Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null;
}

// Old app's packing list, used when a climb sets none.
export const defaultPacking = [
  'Day pack / overnight pack', 'Water, 2–3 litres per day', 'Snacks / trail food', 'Packed meals', 'Mess kit',
  'Sunscreen / umbrella', 'Jacket (preferably rainproof)', 'Rain gear', 'Emergency blanket', 'Individual first aid kit',
  'Personal toiletries', 'Head lamp', 'Camera / mobile phone', 'Plastic bag / trash bag',
];

const STAT_FIELDS: [string, string][] = [
  ['difficulty', 'Difficulty'], ['trailClass', 'Trail class'], ['jumpOff', 'Jump-off'], ['jumpOffElevation', 'Jump-off elevation (m)'], ['distanceToSummit', 'Jump-off to peak'],
  ['roundTripDistance', 'Round trip'], ['elevationGain', 'Elevation gain'], ['recommendedDays', 'Recommended'],
];
const text = (v: unknown) => (typeof v === 'number' ? String(v) : str(v));

// One climb page (/climbs/:id). Drafts stay hidden; a cancelled climb still opens so shared links explain it.
export function toClimbDetail(d: Doc, now: Date): ClimbDetail | null {
  if (str(d.status) === 'draft') return null;
  const climb = mapClimb(d, now);
  const stats = STAT_FIELDS.map(([key, label]) => ({ value: text(d[key]), label })).filter((s) => s.value);
  return {
    ...climb,
    cancelled: !isPublic(d),
    description: str(d.description),
    stats: climb.elevation ? [{ value: climb.elevation, label: 'Elevation' }, ...stats] : stats,
    thingsToBring: strings(d.thingsToBring),
    features: str(d.features),
    waterNote: str(d.waterSourceNote),
    trailMaps: trailMapsOf(d),
    photos: strings(d.trailImages).filter((u) => u.startsWith('https://')),
    coords: coordsOf(d),
    itinerary: itineraryOf(d.itinerary),
    fees: feesOf(d.fees),
    payTo: payToOf(d),
    drive: driveOf(d),
    notices: noticesOf(d.announcements),
    requiredDocs: REQUIRED_DOCS.filter((t) => d[t.requiresField] === true).map((t) => ({ ...t, sampleUrl: https(d[t.sampleUrlField]) })),
    feeItems: (Array.isArray(d.fees) ? d.fees.map(record) : []).filter((f) => str(f.label)).map((f) => ({
      label: str(f.label), amount: text(f.amount) || 'TBA', note: str(f.note), optional: f.optional === true, isGuestFee: f.isGuestFee === true,
    })),
    officers: (Array.isArray(d.officers) ? d.officers.map(record) : []).map((o) => ({ role: str(o.role), name: str(o.name) })).filter((o) => o.name),
    paymentDue: paymentDueOf(d, climb.start),
  };
}
