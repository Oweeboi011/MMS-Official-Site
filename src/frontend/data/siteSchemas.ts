// Admin editor fields per site collection. Mirrors src/backend/firebase/firestore.rules (rules are the real check).
import { rowsFromForm, rowsProblem, rowsToForm, type Column, type RecordsCodec } from './records';

type FieldKind = 'text' | 'longText' | 'lines' | 'records' | 'int' | 'bool' | 'select' | 'date' | 'link';

export interface Field {
  key: string; // dotted keys (socials.facebook) are nested maps in Firestore
  label: string;
  kind: FieldKind;
  required?: boolean;
  max?: number;
  options?: readonly string[];
  allow?: 'hash' | 'image'; // links: also accept '#' (no form yet) or a site image path
  keepEmpty?: boolean; // rules need the key even when blank
  range?: readonly [number, number]; // int bounds
  defaultOn?: boolean; // bool shown ticked on new docs
  linesAreLinks?: boolean; // lines: each must be https://
  columns?: Column[]; // records
  codec?: RecordsCodec; // records: stored shape <-> rows
  hint?: string;
}

export interface CollectionSpec {
  id: string;
  label: string;
  fields: Field[];
  titleField: string; // shown in the list
  singleton?: string; // fixed doc id (siteSettings/site)
  readOnly?: boolean; // admins read and delete only (inquiries)
  check?: (values: FormValues) => string | null; // cross-field rules
  todo?: (values: FormValues) => string[]; // advisory checklist shown above the form (not blocking)
  orderBy?: { field: string; desc?: boolean }; // list order (default: unordered)
  rowLabel?: (doc: Doc) => string; // list label (default: titleField)
  rowLink?: (id: string) => { to: string; label: string }; // page for the selected row
}

const order: Field = { key: 'order', label: 'Order', kind: 'int', required: true };
const published: Field[] = [
  { key: 'published', label: 'Published', kind: 'bool' },
  { key: 'publishedAt', label: 'Publish date', kind: 'date', required: true },
];

export const siteCollections: CollectionSpec[] = [
  {
    id: 'announcements', label: 'Announcements', titleField: 'title',
    fields: [
      { key: 'title', label: 'Title', kind: 'text', required: true, max: 200 },
      { key: 'summary', label: 'Summary', kind: 'longText', required: true, max: 2000 },
      { key: 'category', label: 'Category', kind: 'select', required: true, options: ['Climbs', 'Training', 'Outreach', 'Club', 'SART'] },
      ...published,
    ],
  },
  {
    id: 'officers', label: 'Leadership', titleField: 'name',
    fields: [
      { key: 'body', label: 'Body', kind: 'select', required: true, options: ['execom', 'tcomm', 'bot'] },
      { key: 'role', label: 'Role', kind: 'text', required: true, max: 120 },
      { key: 'name', label: 'Name', kind: 'text', required: true, max: 120 },
      { key: 'current', label: 'Current (untick for past officers)', kind: 'bool', defaultOn: true },
      { key: 'term', label: 'Term (required for past officers)', kind: 'text', max: 40 },
      order,
    ],
    check: (v) => (v.current !== true && !String(v.term ?? '').trim() ? 'Past officers need a term.' : null),
  },
  {
    id: 'committees', label: 'Committees', titleField: 'title',
    fields: [
      { key: 'tag', label: 'Tag', kind: 'text', required: true, max: 40 },
      { key: 'title', label: 'Title', kind: 'text', required: true, max: 120 },
      { key: 'headTitle', label: 'Head title (Head, Commander…)', kind: 'text', required: true, max: 40 },
      { key: 'headName', label: 'Head name', kind: 'text', max: 120, keepEmpty: true },
      { key: 'description', label: 'Description', kind: 'longText', max: 1000, keepEmpty: true },
      order,
    ],
  },
  {
    id: 'surveys', label: 'Surveys', titleField: 'title',
    fields: [
      { key: 'title', label: 'Title', kind: 'text', required: true, max: 200 },
      { key: 'description', label: 'Description', kind: 'longText', max: 2000, keepEmpty: true },
      { key: 'audience', label: 'Audience', kind: 'select', required: true, options: ['Members', 'Guests', 'Everyone'] },
      { key: 'status', label: 'Status', kind: 'select', required: true, options: ['Open', 'Closed'] },
      { key: 'formUrl', label: 'Form link (https://… or #)', kind: 'link', required: true, allow: 'hash' },
      { key: 'closes', label: 'Closes (e.g. Nov 7, 2026)', kind: 'text', max: 40 },
    ],
  },
  {
    id: 'faqs', label: 'FAQs', titleField: 'q',
    fields: [
      { key: 'q', label: 'Question', kind: 'text', required: true, max: 300 },
      { key: 'a', label: 'Answer', kind: 'longText', required: true, max: 2000 },
      order,
    ],
  },
  {
    id: 'glossary', label: 'Glossary', titleField: 'term',
    fields: [
      { key: 'term', label: 'Term', kind: 'text', required: true, max: 20 },
      { key: 'name', label: 'Full name', kind: 'text', required: true, max: 120 },
      { key: 'about', label: 'Meaning', kind: 'longText', required: true, max: 1000 },
    ],
  },
  {
    id: 'media', label: 'Media', titleField: 'title',
    fields: [
      { key: 'kind', label: 'Kind', kind: 'select', required: true, options: ['video', 'photo', 'album'] },
      { key: 'title', label: 'Title', kind: 'text', required: true, max: 200 },
      { key: 'url', label: 'Link (https://… or /images/name.webp)', kind: 'link', required: true, allow: 'image' },
      { key: 'poster', label: 'Poster image', kind: 'link', allow: 'image' },
      { key: 'place', label: 'Place', kind: 'text', max: 200 },
      { key: 'credit', label: 'Credit', kind: 'text', max: 300 },
      order,
    ],
  },
  {
    id: 'reviews', label: 'Reviews', titleField: 'name',
    fields: [
      { key: 'climbTitle', label: 'Climb', kind: 'text', required: true, max: 200 },
      { key: 'name', label: 'Name (with consent)', kind: 'text', required: true, max: 120 },
      { key: 'rating', label: 'Rating (1–5)', kind: 'int', required: true, range: [1, 5] },
      { key: 'quote', label: 'Quote', kind: 'longText', required: true, max: 1000 },
      ...published,
    ],
  },
  {
    id: 'siteSettings', label: 'Site settings', titleField: 'motto', singleton: 'site',
    fields: [
      { key: 'previewNotice', label: 'Preview banner (blank = hidden)', kind: 'text', max: 300 },
      { key: 'motto', label: 'Motto', kind: 'text', max: 200 },
      { key: 'membershipEmail', label: 'Membership email', kind: 'text', max: 200 },
      { key: 'contactName', label: 'Contact name', kind: 'text', max: 120 },
      { key: 'contactPhone', label: 'Contact phone', kind: 'text', max: 40 },
      { key: 'photoAlbumsUrl', label: 'Photo albums link', kind: 'link' },
      { key: 'socials.facebook', label: 'Facebook', kind: 'link' },
      { key: 'socials.instagram', label: 'Instagram', kind: 'link' },
      { key: 'socials.youtube', label: 'YouTube', kind: 'link' },
      { key: 'socials.tiktok', label: 'TikTok', kind: 'link' },
    ],
  },
  {
    id: 'inquiries', label: 'Inquiries', titleField: 'name', readOnly: true,
    fields: [
      { key: 'name', label: 'Name', kind: 'text' },
      { key: 'email', label: 'Email', kind: 'text' },
      { key: 'phone', label: 'Phone', kind: 'text' },
      { key: 'interest', label: 'Interest', kind: 'text' },
      { key: 'message', label: 'Message', kind: 'longText' },
    ],
  },
];

export type FormValues = Record<string, string | boolean>;
type RawValue = FormValues[string] | undefined;
export type Doc = Record<string, unknown>;

const getPath = (doc: Doc, key: string): unknown =>
  key.split('.').reduce<unknown>((v, k) => (v && typeof v === 'object' ? (v as Doc)[k] : undefined), doc);

// Dates are calendar days in Manila (saved as Manila midnight).
const manilaDay = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Manila', year: 'numeric', month: '2-digit', day: '2-digit' });
const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;
const asDateInput = (v: unknown): string => {
  const d = v && typeof v === 'object' && 'toDate' in v ? (v as { toDate: () => Date }).toDate() : null;
  if (d) return manilaDay.format(d);
  return typeof v === 'string' && ISO_DAY.test(v) ? v : ''; // legacy text date: saving stores a Timestamp
};

// Fields whose stored value isn't what the form edits (a map, list or timestamp in a text field).
export function lockedKeys(spec: CollectionSpec, doc: Doc = {}): string[] {
  return spec.fields
    .filter((f) => {
      const v = getPath(doc, f.key);
      if (v === undefined || v === null) return false;
      if (f.kind === 'date') return !(typeof v === 'object' && 'toDate' in v) && !(typeof v === 'string' && ISO_DAY.test(v));
      const list = listKinds[f.kind];
      if (list) return list.locked(v);
      return f.kind === 'bool' ? typeof v !== 'boolean' : typeof v === 'object';
    })
    .map((f) => f.key);
}

// Firestore doc → form strings/booleans.
export function toForm(spec: CollectionSpec, doc: Doc = {}): FormValues {
  return Object.fromEntries(spec.fields.map((f) => {
    const v = getPath(doc, f.key);
    if (f.kind === 'bool') return [f.key, v === true || (v === undefined && f.defaultOn === true)];
    if (f.kind === 'date') return [f.key, asDateInput(v)];
    const list = listKinds[f.kind];
    if (list) return [f.key, list.toForm(f, v)];
    return [f.key, v === undefined || v === null || typeof v === 'object' ? '' : String(v)];
  }));
}

// Form → Firestore fields. Blank optional fields are left out, or set to `cleared` (deleteField) when editing.
export function fromForm(spec: CollectionSpec, values: FormValues, toTimestamp: (d: Date) => unknown, cleared?: unknown): Doc {
  const doc: Doc = {};
  for (const f of spec.fields) {
    const raw = values[f.key];
    const value = convert(f, raw, toTimestamp) ?? cleared;
    if (value === undefined) continue;
    const [head, tail] = f.key.split('.');
    if (tail) doc[head] = { ...(doc[head] as Doc | undefined), [tail]: value };
    else doc[head] = value;
  }
  return doc;
}

function convert(f: Field, raw: RawValue, toTimestamp: (d: Date) => unknown): unknown {
  if (f.kind === 'bool') return raw === true;
  const list = listKinds[f.kind];
  if (list) return list.store(f, raw);
  const text = typeof raw === 'string' ? raw.trim() : '';
  if (!text) return f.required || f.keepEmpty ? text : undefined;
  if (f.kind === 'int') return Number.parseInt(text, 10);
  if (f.kind === 'date') return toTimestamp(new Date(`${text}T00:00:00+08:00`));
  return text;
}

const lines = (raw: RawValue) => (typeof raw === 'string' ? raw.split('\n').map((l) => l.trim()).filter(Boolean) : []);

const SITE_IMAGE = /^\/images\/[\w-]+\.(webp|jpg|jpeg|png|svg)$/;
const linkOk = (f: Field, text: string) =>
  /^https:\/\/\S+$/.test(text) || (f.allow === 'hash' && text === '#') || (f.allow === 'image' && SITE_IMAGE.test(text));

// First problem the rules would reject, so admins see why before saving.
function formatProblem(f: Field, text: string): string | null {
  if (f.kind === 'select' && !f.options?.includes(text)) return `${f.label}: pick one of the options.`;
  if (f.kind === 'int') {
    if (!/^-?\d+$/.test(text) || !Number.isSafeInteger(Number(text))) return `${f.label} must be a whole number.`;
    if (f.range && (Number(text) < f.range[0] || Number(text) > f.range[1])) return `${f.label}: ${f.range[0]} to ${f.range[1]}.`;
  }
  if (f.kind === 'link' && !linkOk(f, text)) return `${f.label} must start with https://.`;
  return null;
}

function linesProblem(f: Field, raw: RawValue): string | null {
  const items = lines(raw);
  if (!items.length) return f.required ? `${f.label} is required.` : null;
  if (f.max && items.some((l) => l.length > f.max!)) return `${f.label}: each line at most ${f.max} characters.`;
  return f.linesAreLinks && items.some((l) => !/^https:\/\/\S+$/.test(l)) ? `${f.label}: every line must start with https://.` : null;
}

// Kinds stored as arrays: how each is locked, shown, stored and checked.
interface ListKind {
  locked: (stored: unknown) => boolean;
  toForm: (f: Field, stored: unknown) => string;
  store: (f: Field, raw: RawValue) => unknown;
  problem: (f: Field, raw: RawValue) => string | null;
}
const nonEmpty = (v: unknown) => (Array.isArray(v) && v.length ? v : undefined);
const listKinds: Partial<Record<FieldKind, ListKind>> = {
  lines: {
    locked: (v) => !(Array.isArray(v) && v.every((x) => typeof x === 'string')),
    toForm: (_f, v) => (Array.isArray(v) ? v.join('\n') : ''),
    store: (_f, raw) => nonEmpty(lines(raw)),
    problem: linesProblem,
  },
  records: {
    locked: (v) => !Array.isArray(v),
    toForm: (f, v) => rowsToForm(f.codec?.decode(v) ?? []),
    store: (f, raw) => nonEmpty(f.codec?.encode(rowsFromForm(raw))),
    problem: (f, raw) => rowsProblem(f.label, f.columns ?? [], rowsFromForm(raw)),
  },
};

function fieldProblem(f: Field, raw: RawValue): string | null {
  const list = listKinds[f.kind];
  if (list) return list.problem(f, raw);
  const text = typeof raw === 'string' ? raw.trim() : '';
  if (!text) return f.required && f.kind !== 'bool' ? `${f.label} is required.` : null;
  const max = f.max ?? (f.kind === 'link' ? 500 : undefined); // rules cap links at 500
  if (max && text.length > max) return `${f.label}: at most ${max} characters.`;
  return formatProblem(f, text);
}

export function validate(spec: CollectionSpec, values: FormValues, locked: string[] = []): string | null {
  for (const f of spec.fields) {
    if (locked.includes(f.key)) continue; // kept as stored, not sent
    const problem = fieldProblem(f, values[f.key]);
    if (problem) return problem;
  }
  return spec.check?.(values) ?? null;
}
