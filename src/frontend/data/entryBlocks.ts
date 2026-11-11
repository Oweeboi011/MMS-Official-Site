// Published contentEntries (ADR 0010) → the blocks public pages already render. Real entries replace a page's sample blocks.
import type { Doc } from '../lib/firestoreRest';
import { FIELDS } from './contentEntries';
import type { ContentPage } from './contentRights';
import type { ContentBlock } from './subpages';

interface Item { title: string; data: Record<string, string> }
interface Source { page: ContentPage; keep?: (item: Item) => boolean; build: (items: Item[]) => ContentBlock[] }

const str = (v: unknown) => (typeof v === 'string' ? v : '');

const toItem = (d: Doc): Item => {
  const raw = (d.data && typeof d.data === 'object' ? d.data : {}) as Doc;
  return { title: str(d.title), data: Object.fromEntries(Object.entries(raw).map(([k, v]) => [k, str(v)])) };
};

function optionLabel(page: ContentPage, key: string, value: string): string {
  return FIELDS[page].find((f) => f.key === key)?.options?.find(([k]) => k === value)?.[1] ?? value;
}

const day = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
const dayOnly = new Intl.DateTimeFormat('en-US', { day: 'numeric', timeZone: 'UTC' });
const asDate = (iso: string) => new Date(`${iso}T00:00:00Z`);

export function dateLabel(start: string, end = ''): string {
  if (!start) return '';
  const from = asDate(start);
  if (!end || end <= start) return day.format(from);
  const to = asDate(end);
  const sameMonth = from.getUTCMonth() === to.getUTCMonth() && from.getUTCFullYear() === to.getUTCFullYear();
  return sameMonth ? `${day.format(from)}–${dayOnly.format(to)}` : `${day.format(from)} – ${day.format(to)}`;
}

const calendarBlocks = (items: Item[]): ContentBlock[] => [{
  type: 'table', eyebrow: 'Calendar', title: 'Calendar of activities.', columns: ['Date', 'Activity', 'Type', 'Place'],
  rows: [...items].sort((a, b) => (a.data.date ?? '').localeCompare(b.data.date ?? ''))
    .map((i) => [dateLabel(i.data.date ?? '', i.data.endDate), i.title, optionLabel('calendar', 'kind', i.data.kind ?? ''), i.data.place ?? '']),
}];

const mediaCards = (eyebrow: string, title: string) => (items: Item[]): ContentBlock[] => [{
  type: 'cards', eyebrow, title,
  items: items.map((i) => ({ title: i.title, description: i.data.details ?? '', href: i.data.url, linkLabel: 'Open' })),
}];

const membershipBlocks = (items: Item[]): ContentBlock[] => items.map((i) => ({
  type: 'text', eyebrow: optionLabel('membership', 'section', i.data.section ?? ''), title: i.title,
  paragraphs: (i.data.body ?? '').split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean),
}));

const placeCards = (eyebrow: string, title: string, place: 'mountain' | 'region') => (items: Item[]): ContentBlock[] => [{
  type: 'cards', eyebrow, title,
  items: items.map((i) => ({ tag: place === 'mountain' ? i.data.region : undefined, title: i.data.mountain || i.title, description: i.data.details ?? '', href: i.data.url, linkLabel: i.data.url ? 'More' : undefined })),
}];

const kindIs = (kind: string) => (i: Item) => i.data.kind === kind;
const sectionIn = (...sections: string[]) => (i: Item) => sections.includes(i.data.section ?? '');

const SOURCES: Record<string, Source> = {
  '/activities/calendar': { page: 'calendar', build: calendarBlocks },
  '/media/photos': { page: 'media', keep: kindIs('album'), build: mediaCards('Albums', 'Photo albums.') },
  '/media/videos': { page: 'media', keep: kindIs('video'), build: mediaCards('Videos', 'Videos.') },
  '/media/publications': { page: 'media', keep: kindIs('publication'), build: mediaCards('Publications', 'Publications.') },
  '/membership/benefits': { page: 'membership', keep: sectionIn('benefits', 'fees'), build: membershipBlocks },
  '/membership/join': { page: 'membership', keep: sectionIn('requirements', 'steps'), build: membershipBlocks },
  '/explore/trails': { page: 'trails', build: placeCards('Trails', 'Trail itineraries.', 'mountain') },
  '/explore/destinations': { page: 'destinations', build: placeCards('Destinations', 'Where we climb.', 'region') },
};

export const entryPageOf = (path: string): ContentPage | null => SOURCES[path]?.page ?? null;

// Blocks for one page from its published entries; empty when none apply (the page keeps its sample blocks).
export function entryBlocks(path: string, docs: Doc[]): ContentBlock[] {
  const source = SOURCES[path];
  if (!source) return [];
  const items = docs.map(toItem).filter((i) => i.title && (source.keep?.(i) ?? true));
  return items.length ? source.build(items) : [];
}
