// Public reads of site content (item 22): Firestore REST + API key, rules allow them signed out. Any failure → null → sample content.
import { decodeFields, decodeQuery, runQueryBody, type Doc, type Filter, type QueryOptions } from '../lib/firestoreRest';
import { asset } from '../lib/asset';
import { manilaYearStart } from '../lib/manila';

import { DATABASE_ID, FIRESTORE_EMULATOR, firebaseConfig, firebaseConfigured, useEmulators } from './firebaseEnv';

const { apiKey, projectId } = firebaseConfig;
const host = useEmulators ? `http://${FIRESTORE_EMULATOR.host}:${FIRESTORE_EMULATOR.port}` : 'https://firestore.googleapis.com';
const base = `${host}/v1/projects/${projectId}/databases/${DATABASE_ID}/documents`;
const TIMEOUT_MS = 5000;

export const publicReadsEnabled = firebaseConfigured;

// 404 (no doc yet) → null. Other HTTP errors, network errors and timeouts throw. text/plain body: no CORS preflight.
async function request(path: string, init?: RequestInit): Promise<unknown> {
  if (!publicReadsEnabled) return null;
  const abort = new AbortController();
  const timer = setTimeout(() => abort.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${base}${path}?key=${apiKey}`, { ...init, signal: abort.signal });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`Firestore ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

// One read per collection per page load (free-tier reads). A failed read resolves undefined (treated as still
// loading: nothing shown, never sample text over real data) and is retried by the next page.
const cache = new Map<string, Promise<unknown>>();
function once<T>(id: string, load: () => Promise<T | null>): Promise<T | null | undefined> {
  if (!cache.has(id)) {
    cache.set(id, load().catch(async () => {
      cache.delete(id);
      return (await fromSnapshot(id)) as T | null | undefined; // R5c: last good deploy-time copy, else undefined
    }));
  }
  return cache.get(id) as Promise<T | null | undefined>;
}

// Admin saved or deleted something: the next page shows it without a reload.
export const forgetPublicData = () => cache.clear();

async function query(collection: string, options: QueryOptions): Promise<Doc[] | null> {
  const rows = await request(':runQuery', { method: 'POST', body: JSON.stringify(runQueryBody(collection, options)) });
  return Array.isArray(rows) ? decodeQuery(rows) : null;
}

// Published page data (contentEntries, ADR 0010): one read per page. Rules allow a list only when it asks for published.
const entryLoaders = new Map<string, () => Promise<Doc[] | null | undefined>>();
export function entriesLoader(page: string) { // stable per page, for useLoaded
  if (!entryLoaders.has(page)) {
    entryLoaders.set(page, () => once(`entries:${page}`, () => query('contentEntries', { where: [{ field: 'page', op: 'EQUAL', value: page }, { field: 'status', op: 'EQUAL', value: 'published' }], limit: 200 })));
  }
  return entryLoaders.get(page)!;
}

// Each page reads only what it shows (Firestore bills per document returned; free quota 50k/day).
const announcementsLoaders = new Map<number, () => Promise<Doc[] | null | undefined>>();
export function announcementsLoader(limit: number) { // stable per limit, for useLoaded
  if (!announcementsLoaders.has(limit)) {
    announcementsLoaders.set(limit, () =>
      once(`announcements:${limit}`, () => query('announcements', { where: [{ field: 'published', op: 'EQUAL', value: true }], orderBy: { field: 'publishedAt', desc: true }, limit })));
  }
  return announcementsLoaders.get(limit)!;
}
// Approved reviews only (rules: published == true), newest first.
export const loadReviews = () => once('reviews', () => query('reviews', { where: [{ field: 'published', op: 'EQUAL', value: true }], orderBy: { field: 'publishedAt', desc: true }, limit: 12 }));
export const loadSurveys = () => once('surveys', () => query('surveys', { limit: 50 }));
export const loadCurrentOfficers = () => once('officers:current', () => query('officers', { where: [{ field: 'current', op: 'EQUAL', value: true }], limit: 50 }));
// Leadership lists every term; current officers sort first so the cap never drops them.
export const loadOfficers = () => once('officers', () => query('officers', { orderBy: { field: 'current', desc: true }, limit: 300 }));
// Every climb, newest first, for the Climb/Hike Log (the page keeps only the completed ones).
export const loadClimbLog = () => once('climbs:log', () => query('climbs', { where: [{ field: 'startDate', op: 'GREATER_THAN_OR_EQUAL', value: manilaYearStart(1990) }], orderBy: { field: 'startDate', desc: true }, limit: 300 }));
// Climbs by start date (needs `startDate` as a Timestamp). Current view: this Manila year onward. Archive: one year.
const climbsLoaders = new Map<string, () => Promise<Doc[] | null | undefined>>();
export function climbsLoader(fromYear: number, onlyThatYear: boolean) { // stable per key, for useLoaded
  const key = `climbs:${fromYear}:${onlyThatYear}`;
  if (!climbsLoaders.has(key)) {
    const where: Filter[] = [{ field: 'startDate', op: 'GREATER_THAN_OR_EQUAL', value: manilaYearStart(fromYear) }];
    if (onlyThatYear) where.push({ field: 'startDate', op: 'LESS_THAN', value: manilaYearStart(fromYear + 1) });
    climbsLoaders.set(key, () => once(key, () => query('climbs', { where, orderBy: { field: 'startDate' }, limit: 200 })));
  }
  return climbsLoaders.get(key)!;
}
export const climbLoader = (id: string) =>
  once(`climb:${id}`, async () => {
    const doc = (await request(`/climbs/${encodeURIComponent(id)}`)) as { fields?: Parameters<typeof decodeFields>[0] } | null;
    return doc?.fields ? { id, ...decodeFields(doc.fields) } : null;
  });
export const loadSettings = () =>
  once('settings', async () => {
    const doc = (await request('/siteSettings/site')) as { fields?: Parameters<typeof decodeFields>[0] } | null;
    return doc?.fields ? decodeFields(doc.fields) : null;
  });

// R5c static fallback: dist/snapshot.json is written at deploy (scripts/snapshot.mjs) with the same reads, raw REST JSON.
type Rows = Parameters<typeof decodeQuery>[0];
interface Snapshot { announcements?: Rows; surveys?: Rows; officers?: Rows; climbs?: Rows; settings?: { fields?: Parameters<typeof decodeFields>[0] } | null }
let snapshot: Promise<Snapshot | null> | null = null;
const loadSnapshot = () => (snapshot ??= fetch(asset('/snapshot.json')).then((r) => (r.ok ? (r.json() as Promise<Snapshot>) : null), () => null));

const startMs = (d: Doc) => (d.startDate instanceof Date ? d.startDate.getTime() : 0);

const rowsOf = (r?: Rows) => (Array.isArray(r) ? decodeQuery(r) : undefined);

function climbsIn(s: Snapshot, year: number, onlyThatYear: boolean) {
  const from = manilaYearStart(year).getTime();
  const to = onlyThatYear ? manilaYearStart(year + 1).getTime() : Infinity;
  return rowsOf(s.climbs)?.filter((c) => startMs(c) >= from && startMs(c) < to);
}

// Cache id (see the loaders above) → the same answer from the snapshot. A switch, not a lookup table: the id can
// contain a climb id from the URL, so nothing is dispatched by name (CodeQL js/unvalidated-dynamic-method-call).
const announcementsFrom = (s: Snapshot, n: string) => rowsOf(s.announcements)?.slice(0, Number(n) || 30);
const officersFrom = (s: Snapshot, which: string) => {
  const all = rowsOf(s.officers);
  return which === 'current' ? all?.filter((o) => o.current === true) : all;
};
const settingsFrom = (s: Snapshot) => (s.settings?.fields ? decodeFields(s.settings.fields) : null);
const climbFrom = (s: Snapshot, id: string) => rowsOf(s.climbs)?.find((c) => c.id === id) ?? null;

export function snapshotFor(id: string, s: Snapshot): Doc[] | Doc | null | undefined {
  const [kind, a = '', b = ''] = id.split(':');
  switch (kind) {
    case 'announcements': return announcementsFrom(s, a);
    case 'surveys': return rowsOf(s.surveys);
    case 'officers': return officersFrom(s, a);
    case 'settings': return settingsFrom(s);
    case 'climb': return climbFrom(s, a);
    case 'climbs': return climbsIn(s, Number(a), b === 'true');
    default: return undefined;
  }
}

async function fromSnapshot(id: string) {
  const s = await loadSnapshot();
  return s ? snapshotFor(id, s) : undefined;
}
