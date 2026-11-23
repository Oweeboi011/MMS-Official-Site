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
    .filter((t) => (!v.committee || t.committee === v.committee) && (!v.status || t.status === v.status) && (!v.ownerUid || t.ownerUid === v.ownerUid))
    .sort(SORTS[v.sort]);

// Admins and any group member (BOT, ExeCom, TCom) use the tracker; nobody else.
export const canUseTasks = (p: Person) => p.role === 'admin' || p.groups.length > 0;

const ISO = /^\d{4}-\d{2}-\d{2}$/;
// Shape alone lets 2026-13-45 through; a real date survives a round trip.
function isRealDate(s: string): boolean {
  const d = new Date(`${s}T00:00:00Z`);
  return ISO.test(s) && !Number.isNaN(d.getTime()) && d.toISOString().startsWith(s);
}

// Returns the first problem in plain words, or '' when the task is fine.
export function validateTask(t: TaskInput): string {
  if (!t.title.trim() || t.title.length > 200) return 'Title is required (max 200 characters).';
  if (!COMMITTEES.some(([key]) => key === t.committee)) return 'Pick a committee.';
  if (!STATUSES.some(([key]) => key === t.status)) return 'Pick a status.';
  for (const date of [t.startDate, t.dueDate]) if (date && !isRealDate(date)) return 'Dates must look like 2026-12-31.';
  if (t.startDate && t.dueDate && t.startDate > t.dueDate) return 'Start must be before the due date.';
  if (t.notes.length > 2000) return 'Notes are too long (max 2000 characters).';
  return '';
}
