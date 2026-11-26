// Pure builders for the weekday task digest: who owes what, with dates in Manila time like the tracker.
const DAY_MS = 86400000;
const SOON_DAYS = 7;

export const manilaToday = (now) => new Date(now + 8 * 3600000).toISOString().slice(0, 10);
const shift = (iso, days) => new Date(Date.parse(iso) + days * DAY_MS).toISOString().slice(0, 10);

// Unfinished tasks with an owner and a due date: overdue, or due within the next 7 days. Keyed by owner uid.
export function taskDigests(tasks, today) {
  const soonEnd = shift(today, SOON_DAYS);
  const byOwner = new Map();
  for (const t of tasks) {
    if (!t.ownerUid || !t.dueDate || t.status === "done") continue;
    if (t.dueDate > soonEnd) continue;
    const bucket = t.dueDate < today ? "overdue" : "soon";
    const digest = byOwner.get(t.ownerUid) ?? { overdue: [], soon: [] };
    digest[bucket].push({ title: t.title, dueDate: t.dueDate });
    byOwner.set(t.ownerUid, digest);
  }
  for (const d of byOwner.values()) {
    d.overdue.sort((a, b) => a.dueDate.localeCompare(b.dueDate));
    d.soon.sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  }
  return byOwner;
}

const plural = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;

export function digestSubject({ overdue, soon }) {
  const parts = [];
  if (overdue.length) parts.push(`${overdue.length} overdue`);
  if (soon.length) parts.push(`${soon.length} due this week`);
  return `Your committee ${plural(overdue.length + soon.length, "task")}: ${parts.join(", ")}`;
}
