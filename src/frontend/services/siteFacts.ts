// What the admin site map needs to judge each page: collection sizes, site settings and published climbs (counts are aggregate reads).
import { collection, doc, getCount, getDoc, query, where } from 'firebase/firestore/lite';
import type { PageFacts } from '../data/siteMapStatus';
import { firebase } from './firebase';
import { registrationEnabled } from './firebaseEnv';

const COLLECTIONS = ['announcements', 'officers', 'committees', 'surveys', 'faqs', 'glossary', 'media', 'reviews'];

const text = (v: unknown) => (typeof v === 'string' ? v.trim() : '');

// One level of nesting is enough for siteSettings (socials.facebook).
function flatten(data: Record<string, unknown>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(data)) {
    if (v && typeof v === 'object') for (const [k2, v2] of Object.entries(v as Record<string, unknown>)) out[`${k}.${k2}`] = text(v2);
    else out[k] = text(v);
  }
  return out;
}

export async function loadSiteFacts(): Promise<PageFacts> {
  const { db } = firebase();
  const count = async (name: string, ...w: ReturnType<typeof where>[]) => (await getCount(query(collection(db, name), ...w))).data().count;
  const [counts, openClimbs, settings] = await Promise.all([
    Promise.all(COLLECTIONS.map(async (c) => [c, await count(c)] as const)),
    count('climbs', where('status', '==', 'open')),
    getDoc(doc(db, 'siteSettings', 'site')),
  ]);
  return { counts: Object.fromEntries(counts), settings: settings.exists() ? flatten(settings.data()) : {}, openClimbs, registrationOpen: registrationEnabled };
}
