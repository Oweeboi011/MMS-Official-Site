// #147 release notes ("What's new"): old app shape { title, body, status, publishedAt }. Signed-in members read published ones.
import { column, dayColumn, type CollectionSpec, type FormValues } from './siteSchemas';

type Doc = Record<string, unknown>;
const str = (v: unknown) => (typeof v === 'string' ? v : '');

export const releaseNotesSpec: CollectionSpec = {
  id: 'releaseNotes', label: 'Release notes', titleField: 'title',
  orderBy: { field: 'publishedAt', desc: true },
  columns: [column('Title', 'title'), column('Status', 'status'), dayColumn('Published', 'publishedAt')],
  fields: [
    { key: 'title', label: 'Title', kind: 'text', required: true, max: 200 },
    { key: 'body', label: 'What changed (blank line between paragraphs; lines starting “- ” are a list; **bold** allowed)', kind: 'longText', required: true, max: 5000 },
    { key: 'status', label: 'Status', kind: 'select', required: true, options: ['draft', 'published'] },
    { key: 'publishedAt', label: 'Publish date', kind: 'date', required: true },
  ],
  check: (v: FormValues) => (v.status === 'published' && !v.publishedAt ? 'Published notes need a date.' : null),
};

export interface ReleaseNote { id: string; title: string; body: string; publishedAt: number }

const millis = (v: unknown) => (v && typeof v === 'object' && 'toMillis' in v ? (v as { toMillis: () => number }).toMillis() : 0);

export const toReleaseNote = (id: string, d: Doc): ReleaseNote => ({ id, title: str(d.title), body: str(d.body), publishedAt: millis(d.publishedAt) });

// Body → blocks: paragraphs, and runs of "- " lines as lists.
export type NoteBlock = { list: false; text: string } | { list: true; items: string[] };
export function noteBlocks(body: string): NoteBlock[] {
  return body.split(/\n\s*\n/).map((chunk) => chunk.trim()).filter(Boolean).map((chunk) => {
    const lines = chunk.split('\n').map((l) => l.trim());
    return lines.every((l) => l.startsWith('- ')) ? { list: true, items: lines.map((l) => l.slice(2)) } : { list: false, text: lines.join(' ') };
  });
}

// One-time "what's new" banner: newer than the last note this browser saw.
const SEEN_KEY = 'mms.seenReleaseNote';
export function unseen(latest: ReleaseNote | undefined): boolean {
  if (!latest) return false;
  try {
    return Number(localStorage.getItem(SEEN_KEY) ?? 0) < latest.publishedAt;
  } catch {
    return false;
  }
}
export function markSeen(latest: ReleaseNote) {
  try {
    localStorage.setItem(SEEN_KEY, String(latest.publishedAt));
  } catch {
    // storage blocked: the banner just shows again
  }
}
