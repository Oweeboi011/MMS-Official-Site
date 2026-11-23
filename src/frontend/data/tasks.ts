// ExeCom and TCom tasks (ADR 0012; collection tasks). Plain data: no Firebase here. Mirrors firestore.rules.
interface Person { role: string; groups: readonly string[] }

export const COMMITTEES = [['execom', 'ExeCom'], ['tcom', 'TCom']] as const;
type Committee = (typeof COMMITTEES)[number][0];

export const STATUSES = [['todo', 'To do'], ['doing', 'Doing'], ['blocked', 'Blocked'], ['done', 'Done']] as const;
type TaskStatus = (typeof STATUSES)[number][0];

export interface TaskInput {
  title: string; committee: Committee; status: TaskStatus; ownerUid: string; ownerName: string;
  startDate: string; dueDate: string; notes: string;
}

export interface Task extends TaskInput { id: string; updatedAt: number }

// Only the stored fields: the rules reject any other key, such as id or updatedAt.
export const taskInput = (t: Task): TaskInput => ({
  title: t.title, committee: t.committee, status: t.status, ownerUid: t.ownerUid, ownerName: t.ownerName,
  startDate: t.startDate, dueDate: t.dueDate, notes: t.notes,
});

const str = (v: unknown) => (typeof v === 'string' ? v : '');
const millis = (v: unknown) => (v && typeof v === 'object' && 'toMillis' in v ? (v as { toMillis: () => number }).toMillis() : 0);
const pick = <T extends string>(options: readonly (readonly [T, string])[], v: unknown, fallback: T): T => options.find(([key]) => key === v)?.[0] ?? fallback;

export const toTask = (id: string, d: Record<string, unknown>): Task => ({
  id, title: str(d.title), committee: pick(COMMITTEES, d.committee, 'execom'), status: pick(STATUSES, d.status, 'todo'),
  ownerUid: str(d.ownerUid), ownerName: str(d.ownerName), startDate: str(d.startDate), dueDate: str(d.dueDate),
  notes: str(d.notes), updatedAt: millis(d.updatedAt),
});

export const isOverdue = (t: Task, today: string) => Boolean(t.dueDate) && t.dueDate < today && t.status !== 'done';

// Officers are in the Philippines; the same task is overdue for everyone on the same day.
export const manilaToday = (now = new Date()) => now.toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' });

const DAY = 86_400_000;
const daysBetween = (from: string, to: string) => Math.round((Date.parse(to) - Date.parse(from)) / DAY);

// "Due in 5 days" for an unfinished task due within two weeks; overdue tasks carry their own chip.
export function dueNote(t: Task, today: string): string {
  if (!t.dueDate || t.status === 'done') return '';
  const days = daysBetween(today, t.dueDate);
  if (days < 0 || days > 14) return '';
  if (days === 0) return 'Due today';
  return days === 1 ? 'Due tomorrow' : `Due in ${days} days`;
}

export const UNASSIGNED = '__unassigned';

export interface TaskView { committee: string; status: string; ownerUid: string; sort: 'due' | 'title' | 'status' | 'committee' }

const rank = (options: readonly (readonly [string, string])[], key: string) => options.findIndex(([k]) => k === key);
const SORTS: Record<TaskView['sort'], (a: Task, b: Task) => number> = {
  due: (a, b) => (a.dueDate || '9999').localeCompare(b.dueDate || '9999'),
  title: (a, b) => a.title.localeCompare(b.title),
  status: (a, b) => rank(STATUSES, a.status) - rank(STATUSES, b.status),
  committee: (a, b) => rank(COMMITTEES, a.committee) - rank(COMMITTEES, b.committee),
};

// Filters then sorts a copy; blank filters match everything.
export const viewTasks = (tasks: Task[], v: TaskView): Task[] =>
  tasks
    .filter((t) => (!v.committee || t.committee === v.committee) && (!v.status || t.status === v.status) && (!v.ownerUid || (v.ownerUid === UNASSIGNED ? !t.ownerUid : t.ownerUid === v.ownerUid)))
    .sort(SORTS[v.sort]);

// Admins and any group member (BOT, ExeCom, TCom) use the tracker; nobody else.
export const canUseTasks = (p: Person) => p.role === 'admin' || p.groups.length > 0;

const ISO = /^\d{4}-\d{2}-\d{2}$/;
// Shape alone lets 2026-13-45 through; a real date survives a round trip.
function isRealDate(s: string): boolean {
  const d = new Date(`${s}T00:00:00Z`);
  return ISO.test(s) && !Number.isNaN(d.getTime()) && d.toISOString().startsWith(s);
}

// Same 2020-2039 window as the rules: a stray 2099 would squash every bar on the timeline.
function dateError(date: string): string {
  if (!date) return '';
  if (!isRealDate(date)) return 'Dates must look like 2026-12-31.';
  return date < '2020' || date >= '2040' ? 'Dates must fall between 2020 and 2039.' : '';
}

// Returns the first problem in plain words, or '' when the task is fine.
export function validateTask(t: TaskInput): string {
  if (!t.title.trim() || t.title.length > 200) return 'Title is required (max 200 characters).';
  if (!COMMITTEES.some(([key]) => key === t.committee)) return 'Pick a committee.';
  if (!STATUSES.some(([key]) => key === t.status)) return 'Pick a status.';
  const dateProblem = [t.startDate, t.dueDate].map(dateError).find(Boolean);
  if (dateProblem) return dateProblem;
  if (t.startDate && t.dueDate && t.startDate > t.dueDate) return 'Start must be before the due date.';
  if (t.notes.length > 2000) return 'Notes are too long (max 2000 characters).';
  return '';
}

interface Bar { task: Task; left: number; width: number }
export interface Timeline {
  from: string; to: string; months: { label: string; left: number }[];
  groups: { committee: Committee; label: string; bars: Bar[] }[]; undated: Task[];
}

const DAY_MS = 86_400_000;
const dayOf = (iso: string) => Date.parse(`${iso}T00:00:00Z`) / DAY_MS;
const monthLabel = (y: number, m: number) => new Date(Date.UTC(y, m, 1)).toLocaleDateString('en', { month: 'short', year: 'numeric', timeZone: 'UTC' });

// Bars as percentages of the whole range (both end days count). A task with one date is a one-day marker.
export function timelineOf(tasks: Task[]): Timeline {
  const span = (t: Task) => [t.startDate || t.dueDate, t.dueDate || t.startDate].sort() as [string, string];
  const dated = tasks.filter((t) => t.startDate || t.dueDate);
  const undated = tasks.filter((t) => !t.startDate && !t.dueDate);
  if (dated.length === 0) return { from: '', to: '', months: [], groups: [], undated };
  const from = dated.map((t) => span(t)[0]).sort()[0];
  const to = dated.map((t) => span(t)[1]).sort().at(-1) as string;
  const total = dayOf(to) - dayOf(from) + 1;
  const pct = (days: number) => (days / total) * 100;
  const groups = COMMITTEES.map(([committee, label]) => ({
    committee, label,
    bars: dated.filter((t) => t.committee === committee).map((task): Bar => {
      const [s, e] = span(task);
      return { task, left: pct(dayOf(s) - dayOf(from)), width: pct(dayOf(e) - dayOf(s) + 1) };
    }).sort((x, y) => span(x.task)[0].localeCompare(span(y.task)[0]) || x.task.title.localeCompare(y.task.title)),
  })).filter((g) => g.bars.length > 0);
  const [fy, fm] = from.split('-').map(Number);
  const [ty, tm] = to.split('-').map(Number);
  const months = [{ label: monthLabel(fy, fm - 1), left: 0 }];
  for (let y = fy, m = fm; y * 12 + m < ty * 12 + tm; ) {
    [y, m] = m === 12 ? [y + 1, 1] : [y, m + 1];
    const left = pct(dayOf(`${y}-${String(m).padStart(2, '0')}-01`) - dayOf(from));
    // Skip labels that would touch the previous one or run off the right edge.
    if (left <= 90 && left - months[months.length - 1].left >= 8) months.push({ label: monthLabel(y, m - 1), left });
  }
  return { from, to, months, groups, undated };
}
