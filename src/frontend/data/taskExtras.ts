// Pure helpers around committee tasks: checklist text, links in notes, summary counts, date moves, repeats.
import { COMMITTEES, STATUSES, isOverdue, type Task, type TaskInput, type TaskView } from './tasks';

export interface CheckItem { text: string; done: boolean }

// One line per item: "[x] done thing" or "[ ] open thing"; a plain line counts as open.
export const parseChecklist = (s: string): CheckItem[] =>
  s.split('\n').filter((l) => l.trim()).map((line) => {
    const l = line.trimStart();
    const m = /^\[([ xX])\] ?(.*)$/.exec(l);
    // Item text keeps its trailing space so a person can type a multi-word item in the editor.
    return m ? { text: m[2], done: m[1] !== ' ' } : { text: l.trimEnd(), done: false };
  });

export const formatChecklist = (items: CheckItem[]): string => items.map((i) => `[${i.done ? 'x' : ' '}] ${i.text}`).join('\n');

export function checklistProgress(s: string): string {
  const items = parseChecklist(s);
  return items.length ? `${items.filter((i) => i.done).length}/${items.length}` : '';
}

export type Segment = { text: string; href?: string };

// Sentence punctuation after an address is not part of it; a closing ")" is, when the address opened one.
function trimUrlEnd(url: string): string {
  let end = url.length;
  while (end > 0) {
    const c = url[end - 1];
    const unbalanced = c === ')' && url.slice(0, end).split(')').length > url.slice(0, end).split('(').length;
    if (!('.,;:!?'.includes(c) || unbalanced)) break;
    end -= 1;
  }
  return url.slice(0, end);
}

// Only http(s) addresses become links; other schemes (javascript:, ftp:) stay plain text.
export function linkify(text: string): Segment[] {
  const out: Segment[] = [];
  let last = 0;
  for (const m of text.matchAll(/https?:\/\/[^\s<>"']+/g)) {
    const url = trimUrlEnd(m[0]);
    if (m.index > last) out.push({ text: text.slice(last, m.index) });
    out.push({ text: url, href: url });
    last = m.index + url.length;
  }
  if (last < text.length || out.length === 0) out.push({ text: text.slice(last) });
  return out;
}

const DAY = 86_400_000;
const iso = (ms: number) => new Date(ms).toISOString().slice(0, 10);
const shift = (date: string, days: number) => (date ? iso(Date.parse(date) + days * DAY) : '');

export const shiftDates = (t: { startDate: string; dueDate: string }, days: number) => ({ startDate: shift(t.startDate, days), dueDate: shift(t.dueDate, days) });

function addMonth(date: string): string {
  if (!date) return '';
  const [y, m, d] = date.split('-').map(Number);
  const last = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
  return iso(Date.UTC(y, m, Math.min(d, last)));
}

// A finished repeating task leaves a fresh copy for the next round: same people and checklist, nothing ticked.
export function nextOccurrence(t: TaskInput): TaskInput | null {
  if (t.status !== 'done' || !t.repeat) return null;
  const move = t.repeat === 'weekly' ? (d: string) => shift(d, 7) : addMonth;
  return { ...t, status: 'todo', startDate: move(t.startDate), dueDate: move(t.dueDate), checklist: formatChecklist(parseChecklist(t.checklist).map((i) => ({ ...i, done: false }))) };
}

export interface CommitteeSummary {
  committee: string; label: string; total: number; overdue: number; dueSoon: number; counts: Record<string, number>;
}

// Counts per committee; due soon = unfinished and due within the next 7 days.
export function summaryOf(tasks: Task[], today: string): CommitteeSummary[] {
  const soon = shift(today, 7);
  return COMMITTEES.map(([committee, label]) => {
    const mine = tasks.filter((t) => t.committee === committee);
    return {
      committee, label, total: mine.length,
      overdue: mine.filter((t) => isOverdue(t, today)).length,
      dueSoon: mine.filter((t) => t.dueDate >= today && t.dueDate <= soon && t.status !== 'done').length,
      counts: Object.fromEntries(STATUSES.map(([s]) => [s, mine.filter((t) => t.status === s).length])),
    };
  });
}

const spanDays = (from: string, to: string) => (Date.parse(to) - Date.parse(from)) / DAY + 1;

// Where today falls on the timeline, as a percentage; nothing when it is outside the range.
export function todayMarker(from: string, to: string, today: string): number | null {
  if (!from || today < from || today > to) return null;
  return ((Date.parse(today) - Date.parse(from)) / DAY / spanDays(from, to)) * 100;
}

// A drag of dx pixels across a track of the given width, in whole days.
export const dragDays = (dx: number, width: number, from: string, to: string): number =>
  width > 0 ? Math.round((dx / width) * spanDays(from, to)) : 0;

export interface StoredView { mode: 'table' | 'timeline'; view: TaskView }
const SORT_KEYS: TaskView['sort'][] = ['due', 'title', 'status', 'committee'];
const text = (v: unknown) => (typeof v === 'string' ? v : '');

// What the tracker remembers per person; anything unexpected falls back to the default view.
export function parseStoredView(raw: string | null): StoredView {
  const fallback: StoredView = { mode: 'table', view: { committee: '', status: '', ownerUid: '', sort: 'due' } };
  try {
    const d = JSON.parse(raw ?? '') as { mode?: unknown; view?: Record<string, unknown> };
    const sort = SORT_KEYS.find((k) => k === d.view?.sort);
    if ((d.mode !== 'table' && d.mode !== 'timeline') || !sort) return fallback;
    return { mode: d.mode, view: { committee: text(d.view?.committee), status: text(d.view?.status), ownerUid: text(d.view?.ownerUid), sort } };
  } catch {
    return fallback;
  }
}
