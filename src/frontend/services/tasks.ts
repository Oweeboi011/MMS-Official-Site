// tasks: ExeCom and TCom tracker; groupMembers: who can own a task (rules: firestore.rules, ADR 0012).
import { addDoc, collection, deleteDoc, doc, getDocs, limit, orderBy, query, serverTimestamp, updateDoc } from 'firebase/firestore/lite';
import { toTask, validateTask, type Task, type TaskInput } from '../data/tasks';
import { logAudit } from './auditLog';
import type { Account } from './auth';
import { firebase } from './firebase';
import { readOnlyMessage, writesEnabled } from './firebaseEnv';

const tasks = () => collection(firebase().db, 'tasks');
export const TASK_LIMIT = 500;

// Newest changes first, so the limit drops the oldest tasks, never the latest.
export async function loadTasks(): Promise<Task[]> {
  return (await getDocs(query(tasks(), orderBy('updatedAt', 'desc'), limit(TASK_LIMIT)))).docs.map((d) => toTask(d.id, d.data()));
}

export interface TaskOwner { uid: string; name: string }

export async function loadOwners(): Promise<TaskOwner[]> {
  const snap = await getDocs(query(collection(firebase().db, 'groupMembers'), limit(200)));
  return snap.docs.map((d) => ({ uid: d.id, name: String(d.data().name ?? '') })).sort((a, b) => a.name.localeCompare(b.name));
}

export async function saveTask(account: Account, input: TaskInput, id?: string): Promise<void> {
  if (!writesEnabled) throw new Error(readOnlyMessage);
  const problem = validateTask(input);
  if (problem) throw new Error(problem);
  const body = { ...input, title: input.title.trim(), notes: input.notes.trim(), updatedAt: serverTimestamp() };
  let taskId = id ?? '';
  if (id) await updateDoc(doc(firebase().db, 'tasks', id), body);
  else taskId = (await addDoc(tasks(), { ...body, createdBy: account.uid, createdAt: serverTimestamp() })).id;
  await logAudit({ action: id ? 'task edited' : 'task added', targetType: 'task', targetId: taskId, targetLabel: input.title, details: `${input.committee} · ${input.status}` });
}

export async function removeTask(task: Task): Promise<void> {
  if (!writesEnabled) throw new Error(readOnlyMessage);
  await deleteDoc(doc(firebase().db, 'tasks', task.id));
  await logAudit({ action: 'task deleted', targetType: 'task', targetId: task.id, targetLabel: task.title, details: task.committee });
}
