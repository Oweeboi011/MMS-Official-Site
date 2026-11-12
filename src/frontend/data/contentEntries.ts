// Page data that officers submit and publish (ADR 0010; collection contentEntries). Plain data: no Firebase here.
import type { ContentPage } from './contentRights';

export type EntryStatus = 'draft' | 'pending' | 'published' | 'rejected';
export const STATUS_LABEL: Record<EntryStatus, string> = { draft: 'Draft', pending: 'Waiting for review', published: 'Published', rejected: 'Rejected' };

export interface FieldDef { key: string; label: string; type: 'text' | 'textarea' | 'date' | 'url' | 'select'; max: number; required?: boolean; options?: readonly (readonly [string, string])[] }

const DETAILS: FieldDef = { key: 'details', label: 'Details', type: 'textarea', max: 2000 };
const LINK: FieldDef = { key: 'url', label: 'Link', type: 'url', max: 500 };

// The fields each page needs beyond the title. Nothing here is MMS fact: it is only the shape of what officers enter.
export const FIELDS: Record<ContentPage, FieldDef[]> = {
  calendar: [
    { key: 'date', label: 'Date', type: 'date', max: 10, required: true },
    { key: 'endDate', label: 'End date (if more than one day)', type: 'date', max: 10 },
    { key: 'place', label: 'Place', type: 'text', max: 200 },
    { key: 'kind', label: 'Type', type: 'select', max: 20, options: [['climb', 'Climb or hike'], ['training', 'Training'], ['event', 'Club event'], ['outreach', 'Outreach']] },
    DETAILS,
  ],
  media: [
    { key: 'kind', label: 'Type', type: 'select', max: 20, required: true, options: [['album', 'Photo album'], ['video', 'Video'], ['publication', 'Publication']] },
    { ...LINK, required: true },
    DETAILS,
  ],
  membership: [
    { key: 'section', label: 'Section', type: 'select', max: 20, required: true, options: [['requirements', 'Requirements'], ['fees', 'Fees'], ['steps', 'How to join'], ['benefits', 'Benefits']] },
    { key: 'body', label: 'Text', type: 'textarea', max: 2000, required: true },
  ],
  trails: [
    { key: 'mountain', label: 'Mountain or trail', type: 'text', max: 200, required: true },
    { key: 'region', label: 'Region', type: 'text', max: 200 },
    DETAILS,
    LINK,
  ],
  destinations: [
    { key: 'region', label: 'Region or country', type: 'text', max: 200, required: true },
    DETAILS,
    LINK,
  ],
};

export interface Entry {
  id: string; page: ContentPage; title: string; data: Record<string, string>; status: EntryStatus;
  submittedBy: string; submittedByName: string; reviewedBy: string; note: string; updatedAt: number;
}

const str = (v: unknown) => (typeof v === 'string' ? v : '');
const millis = (v: unknown) => (v && typeof v === 'object' && 'toMillis' in v ? (v as { toMillis: () => number }).toMillis() : 0);
const STATUSES: EntryStatus[] = ['draft', 'pending', 'published', 'rejected'];

export function toEntry(id: string, d: Record<string, unknown>): Entry {
  const raw = (d.data && typeof d.data === 'object' ? d.data : {}) as Record<string, unknown>;
  const status = STATUSES.find((s) => s === d.status) ?? 'draft';
  return {
    id, page: d.page as ContentPage, title: str(d.title), status, data: Object.fromEntries(Object.entries(raw).map(([k, v]) => [k, str(v)])),
    submittedBy: str(d.submittedBy), submittedByName: str(d.submittedByName), reviewedBy: str(d.reviewedBy), note: str(d.note), updatedAt: millis(d.updatedAt),
  };
}

// Only the page's known fields, trimmed, blanks dropped.
export function cleanData(page: ContentPage, data: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const f of FIELDS[page]) {
    const value = (data[f.key] ?? '').trim();
    if (value) out[f.key] = value;
  }
  return out;
}

export function validateEntry(page: ContentPage, title: string, data: Record<string, string>): string {
  if (!title.trim()) return 'Add a title.';
  if (title.trim().length > 200) return 'The title is too long (max 200 characters).';
  const clean = cleanData(page, data);
  for (const f of FIELDS[page]) {
    if (f.required && !clean[f.key]) return `${f.label} is required.`;
    if ((clean[f.key] ?? '').length > f.max) return `${f.label} is too long (max ${f.max} characters).`;
    if (f.type === 'url' && clean[f.key] && !/^https:\/\//i.test(clean[f.key])) return `${f.label} must start with https://`;
  }
  return '';
}

export interface EntryActions { edit: boolean; publish: boolean; reject: boolean; unpublish: boolean; remove: boolean }

// What one person may do with one entry: reviewers act on anything; a submitter on their own, if their group may publish.
export function entryActions(status: EntryStatus, who: { mine: boolean; canReview: boolean; canPublish: boolean }): EntryActions {
  const live = status === 'published';
  const mayAct = who.canReview || (who.mine && who.canPublish);
  return {
    edit: (who.mine || who.canReview) && !live,
    publish: mayAct && !live,
    reject: who.canReview && status === 'pending',
    unpublish: mayAct && live,
    remove: who.canReview || (who.mine && (status === 'draft' || status === 'pending')),
  };
}

export const entrySummary = (e: Entry) => Object.values(e.data).filter(Boolean).slice(0, 2).join(' · ');
