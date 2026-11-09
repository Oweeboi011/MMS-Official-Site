// #133: Firestore content in site search, merged at runtime (the static index covers pages and sample text).
import type { SearchDoc } from '../lib/search';
import type { ScheduleClimb } from './climbs';
import type { Announcement } from './content';

export function liveSearchDocs(announcements: Announcement[], climbs: ScheduleClimb[], indexed: SearchDoc[]): SearchDoc[] {
  const seen = new Set(indexed.map((d) => `${d.path}|${d.title}`));
  const docs: SearchDoc[] = [
    ...announcements.map((a) => ({ path: '/media/news', title: a.title, section: 'News', text: [a.category, a.date, a.summary].join(' ') })),
    ...climbs.filter((c) => c.id).map((c) => ({ path: `/climbs/${c.id}`, title: c.title, section: 'Open climbs', text: [c.dates, c.location, c.type, c.difficulty, c.rating, c.elevation].filter(Boolean).join(' ') })),
  ];
  return docs.filter((d) => d.title && !seen.has(`${d.path}|${d.title}`));
}
