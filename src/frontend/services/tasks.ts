// tasks: ExeCom and TCom tracker; groupMembers: who can own a task (rules: firestore.rules, ADR 0012).
import { addDoc, collection, deleteDoc, doc, getDocs, limit, orderBy, query, serverTimestamp, updateDoc } from 'firebase/firestore/lite';
import { NO_CHANGE, changeSummary, nextOccurrence } from '../data/taskExtras';
import { taskInput, toTask, validateTask, type Task, type TaskInput } from '../data/tasks';
import { logAudit } from './auditLog';
import type { Account } from './auth';
import { firebase } from './firebase';
import { readOnlyMessage, writesEnabled } from './firebaseEnv';

const tasks = () => collection(firebase().db, 'tasks');
export const TASK_LIMIT = 500;

// Newest changes first, so the limit drops the oldest tasks, never the latest.
export async function loadTasks(max = TASK_LIMIT): Promise<Task[]> {
  return (await getDocs(query(tasks(), orderBy('updatedAt', 'desc'), limit(max)))).docs.map((d) => toTask(d.id, d.data()));
}

export interface TaskOwner { uid: string; name: string }

export async function loadOwners(): Promise<TaskOwner[]> {
  const snap = await getDocs(query(collection(firebase().db, 'groupMembers'), limit(200)));
  return snap.docs.map((d) => ({ uid: d.id, name: String(d.data().name ?? '') })).sort((a, b) => a.name.localeCompare(b.name));
}

const stored = (account: Account, input: TaskInput) =>
  ({ ...input, title: input.title.trim(), notes: input.notes.trim(), updatedByName: account.name || 'An officer', updatedAt: serverTimestamp() });

export interface TaskEvent { id: string; byName: string; summary: string; at: number }

// tasks/{id}/history: what changed and who did it. Best effort: a failed note never fails the task save.
async function logHistory(account: Account, taskId: string, summary: string): Promise<void> {
  try {
    if (summary === NO_CHANGE) return;
    // The rules cap the summary at 500 characters; cut here so a long title cannot lose the note.
    await addDoc(collection(firebase().db, 'tasks', taskId, 'history'), { at: serverTimestamp(), byUid: account.uid, byName: account.name || 'An officer', summary: summary.slice(0, 500) });
  } catch { /* history is a convenience; the audit log keeps the record */ }
}

export async function loadHistory(taskId: string): Promise<TaskEvent[]> {
  const snap = await getDocs(query(collection(firebase().db, 'tasks', taskId, 'history'), orderBy('at', 'desc'), limit(20)));
  return snap.docs.map((d) => {
    const at = d.data().at as { toMillis?: () => number } | undefined;
    return { id: d.id, byName: String(d.data().byName ?? ''), summary: String(d.data().summary ?? ''), at: at?.toMillis?.() ?? 0 };
  });
}

// previous: the task as it was, for the history line, and so a repeating task already Done does not spawn another copy.
export async function saveTask(account: Account, input: TaskInput, id?: string, previous?: Task): Promise<void> {
  if (!writesEnabled) throw new Error(readOnlyMessage);
  const problem = validateTask(input);
  if (problem) throw new Error(problem);
  const body = stored(account, input);
  let taskId = id ?? '';
  if (id) await updateDoc(doc(firebase().db, 'tasks', id), body);
  else taskId = (await addDoc(tasks(), { ...body, createdBy: account.uid, createdAt: serverTimestamp() })).id;
  await logAudit({ action: id ? 'task edited' : 'task added', targetType: 'task', targetId: taskId, targetLabel: input.title, details: `${input.committee} · ${input.status}` });
  const saved = { ...input, title: input.title.trim(), notes: input.notes.trim() }; // compare what was stored, not what was typed
  await logHistory(account, taskId, changeSummary(previous ? taskInput(previous) : null, saved));
  const next = previous?.status === 'done' ? null : nextOccurrence(input);
  if (!next) return;
  const copy = await addDoc(tasks(), { ...stored(account, next), createdBy: account.uid, createdAt: serverTimestamp() });
  await logAudit({ action: 'task added', targetType: 'task', targetId: copy.id, targetLabel: next.title, details: `${next.committee} · repeat of ${taskId}` });
  await logHistory(account, copy.id, `Created as the next copy of “${input.title.trim()}”`);
}

export async function removeTask(task: Task): Promise<void> {
  if (!writesEnabled) throw new Error(readOnlyMessage);
  await deleteDoc(doc(firebase().db, 'tasks', task.id));
  await clearHistory(task.id);
  await logAudit({ action: 'task deleted', targetType: 'task', targetId: task.id, targetLabel: task.title, details: task.committee });
}

// The rules let history go only after its task is gone, so this runs after the task delete.
async function clearHistory(taskId: string): Promise<void> {
  try {
    for (let round = 0; round < 20; round += 1) { // 100 at a time, until none are left
      const snap = await getDocs(query(collection(firebase().db, 'tasks', taskId, 'history'), limit(100)));
      if (snap.empty) return;
      await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));
    }
  } catch { /* leftover notes are harmless */ }
}
