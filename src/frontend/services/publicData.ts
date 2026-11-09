// Public reads of site content (item 22): Firestore REST + API key, rules allow them signed out. Any failure → null → sample content.
import { decodeFields, decodeQuery, runQueryBody, type Doc, type Filter, type QueryOptions } from '../lib/firestoreRest';
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
    cache.set(id, load().catch(() => {
      cache.delete(id);
      return undefined;
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

// Each page reads only what it shows (Firestore bills per document returned; free quota 50k/day).
const announcementsLoaders = new Map<number, () => Promise<Doc[] | null | undefined>>();
export function announcementsLoader(limit: number) { // stable per limit, for useLoaded
  if (!announcementsLoaders.has(limit)) {
    announcementsLoaders.set(limit, () =>
      once(`announcements:${limit}`, () => query('announcements', { where: [{ field: 'published', op: 'EQUAL', value: true }], orderBy: { field: 'publishedAt', desc: true }, limit })));
  }
  return announcementsLoaders.get(limit)!;
}
export const loadSurveys = () => once('surveys', () => query('surveys', { limit: 50 }));
export const loadCurrentOfficers = () => once('officers:current', () => query('officers', { where: [{ field: 'current', op: 'EQUAL', value: true }], limit: 50 }));
// Leadership lists every term; current officers sort first so the cap never drops them.
export const loadOfficers = () => once('officers', () => query('officers', { orderBy: { field: 'current', desc: true }, limit: 300 }));
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
