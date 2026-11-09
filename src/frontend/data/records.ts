// List-of-rows fields in the admin editor (fees, routes, officers, itinerary). The form keeps rows as JSON text.
export interface Column {
  key: string;
  label: string;
  kind?: 'text' | 'bool' | 'link' | 'select';
  required?: boolean;
  max?: number;
  options?: readonly string[];
}
export type RecordRow = Record<string, string | boolean>;
export interface RecordsCodec {
  decode: (stored: unknown) => RecordRow[];
  encode: (rows: RecordRow[]) => unknown;
}

const obj = (v: unknown) => (v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : {});
function cell(c: Column, v: unknown): string | boolean {
  if (c.kind === 'bool') return v === true;
  return typeof v === 'string' || typeof v === 'number' ? String(v) : '';
}
const pick = (columns: Column[], v: unknown): RecordRow => Object.fromEntries(columns.map((c) => [c.key, cell(c, obj(v)[c.key])]));
const blank = (columns: Column[], row: RecordRow) => columns.every((c) => (c.kind === 'bool' ? true : !String(row[c.key] ?? '').trim()));
const clean = (columns: Column[], row: RecordRow) =>
  Object.fromEntries(columns.map((c) => [c.key, c.kind === 'bool' ? row[c.key] === true : String(row[c.key] ?? '').trim()]));

export const emptyRow = (columns: Column[]): RecordRow => pick(columns, {});

// Keys the form doesn't show (e.g. an officer's userId) ride along in KEEP so saving never drops them.
const KEEP = '__keep';
const kept = (row: RecordRow) => {
  try {
    return obj(JSON.parse(String(row[KEEP] ?? '{}')));
  } catch {
    return {};
  }
};

// Stored as an array of maps with these keys.
export const flatCodec = (columns: Column[]): RecordsCodec => ({
  decode: (v) => (Array.isArray(v) ? v.map((r) => ({ ...pick(columns, r), [KEEP]: JSON.stringify(obj(r)) })) : []),
  encode: (rows) => rows.filter((r) => !blank(columns, r)).map((r) => ({ ...kept(r), ...clean(columns, r) })),
});

// Stored as [{ [groupKey], [listKey]: [{…entry columns}] }] (the itinerary's days → entries); edited as flat rows.
export const groupedCodec = (groupKey: string, listKey: string, columns: Column[]): RecordsCodec => {
  const entryCols = columns.filter((c) => c.key !== groupKey);
  return {
    decode: (v) => (Array.isArray(v) ? v : []).flatMap((g) => {
      const list = obj(g)[listKey];
      return (Array.isArray(list) ? list : []).map((e) => ({ ...pick(entryCols, e), [groupKey]: cell({ key: groupKey, label: '' }, obj(g)[groupKey]) }));
    }),
    encode: (rows) => rows.filter((r) => !blank(columns, r)).reduce<Record<string, unknown>[]>((groups, r) => {
      const name = String(r[groupKey] ?? '').trim();
      const last = groups.at(-1);
      const entry = clean(entryCols, r);
      if (last && last[groupKey] === name) (last[listKey] as unknown[]).push(entry);
      else groups.push({ [groupKey]: name, [listKey]: [entry] });
      return groups;
    }, []),
  };
};

export const rowsToForm = (rows: RecordRow[]) => JSON.stringify(rows);
export function rowsFromForm(value: unknown): RecordRow[] {
  try {
    const rows: unknown = JSON.parse(typeof value === 'string' && value ? value : '[]');
    return Array.isArray(rows) ? (rows as RecordRow[]) : [];
  } catch {
    return [];
  }
}

function cellProblem(c: Column, text: string): string | null {
  if (!text) return c.required ? 'is required.' : null;
  if (c.max && text.length > c.max) return `: at most ${c.max} characters.`;
  if (c.kind === 'link' && !/^https:\/\/\S+$/.test(text)) return 'must start with https://.';
  return c.kind === 'select' && !c.options?.includes(text) ? ': pick one of the options.' : null;
}

export function rowsProblem(label: string, columns: Column[], rows: RecordRow[]): string | null {
  for (const [i, row] of rows.entries()) {
    if (blank(columns, row)) continue;
    for (const c of columns.filter((col) => col.kind !== 'bool')) {
      const problem = cellProblem(c, String(row[c.key] ?? '').trim());
      if (problem) return `${label}, row ${i + 1}, ${c.label}${problem.startsWith(':') ? '' : ' '}${problem}`;
    }
  }
  return null;
}
