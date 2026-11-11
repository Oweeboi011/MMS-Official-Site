// Who may submit and publish page data (ADR 0010). Mirrors firestore.rules: change both together.
export const GROUPS = [['bot', 'BOT'], ['execom', 'ExeCom'], ['tcom', 'TCom']] as const;
export type Group = (typeof GROUPS)[number][0];

export const CONTENT_PAGES = [
  ['calendar', 'Calendar of Activities'], ['media', 'Media'], ['membership', 'Membership'],
  ['trails', 'Trails'], ['destinations', 'Destinations'],
] as const;
export type ContentPage = (typeof CONTENT_PAGES)[number][0];

// TCom owns the technical and activity pages; Membership facts stay with BOT and ExeCom.
const TCOM_PAGES: readonly ContentPage[] = ['calendar', 'media', 'trails', 'destinations'];
const REVIEWER_GROUPS: readonly Group[] = ['bot', 'execom'];

export interface Rights { submit: boolean; publish: boolean }
interface Person { role: string; groups: readonly string[] }

export const isContentReviewer = (p: Person) => p.role === 'admin' || p.groups.some((g) => REVIEWER_GROUPS.includes(g as Group));

export function rightsFor(person: Person, page: ContentPage): Rights {
  const allowed = isContentReviewer(person) || (person.groups.includes('tcom') && TCOM_PAGES.includes(page));
  return { submit: allowed, publish: allowed };
}

const pagesWithRights = (person: Person) => CONTENT_PAGES.filter(([page]) => rightsFor(person, page).submit);

export const hasContentRights = (person: Person) => pagesWithRights(person).length > 0;

export function rightsLabel(person: Person): string {
  const pages = pagesWithRights(person);
  if (pages.length === 0) return 'No content rights';
  if (pages.length === CONTENT_PAGES.length) return 'All pages';
  return pages.map(([, label]) => label).join(', ');
}

export const groupLabel = (group: string) => GROUPS.find(([key]) => key === group)?.[1] ?? group;

// Only known groups, in the fixed order, no repeats.
export const cleanGroups = (value: unknown): Group[] =>
  GROUPS.map(([key]) => key).filter((key) => Array.isArray(value) && value.includes(key));
