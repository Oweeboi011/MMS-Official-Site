import type { Task } from '../../src/frontend/data/tasks';
import type { Account } from '../../src/frontend/services/auth';
import { removeTask, saveTask } from '../../src/frontend/services/tasks';

const calls = vi.hoisted(() => ({
  added: [] as { path: string; body: Record<string, unknown> }[],
  updated: [] as Record<string, unknown>[],
  deleted: [] as string[],
  failHistory: false,
  rounds: 0,
}));
vi.mock('firebase/firestore/lite', () => ({
  addDoc: async (c: { path: string }, body: Record<string, unknown>) => {
    if (c.path.endsWith('/history') && calls.failHistory) throw new Error('permission-denied');
    calls.added.push({ path: c.path, body });
    return { id: `new${calls.added.length}` };
  },
  updateDoc: async (_d: unknown, body: Record<string, unknown>) => { calls.updated.push(body); },
  collection: (_db: unknown, ...path: string[]) => ({ path: path.join('/') }),
  doc: (_db: unknown, ...path: string[]) => ({ path: path.join('/') }),
  deleteDoc: async (d: { path: string }) => { calls.deleted.push(d.path); },
  getDocs: async () => { calls.rounds += 1; return calls.rounds === 1 ? { empty: false, docs: [{ ref: { path: 'tasks/t1/history/h1' } }] } : { empty: true, docs: [] }; },
  limit: () => ({}), orderBy: () => ({}), query: (c: unknown) => c, serverTimestamp: () => 'now',
}));
vi.mock('../../src/frontend/services/firebase', () => ({ firebase: () => ({ db: {} }) }));
vi.mock('../../src/frontend/services/firebaseEnv', () => ({ writesEnabled: true, readOnlyMessage: 'read only' }));
vi.mock('../../src/frontend/services/auditLog', () => ({ logAudit: async () => undefined }));

const account: Account = { uid: 'u1', email: 'a@x.com', role: 'member', emailVerified: true, name: 'Ana', groups: ['execom'] };
const task = { title: ' Prep ', committee: 'execom', status: 'done', ownerUid: '', ownerName: '', startDate: '2026-12-01', dueDate: '2026-12-03', notes: '', checklist: '[x] a', repeat: 'weekly', link: '' } as const;
const before = (status: Task['status']): Task => ({ ...task, title: 'Prep', status, id: 't1', updatedAt: 0, updatedByName: '' }); // stored titles are trimmed
const historyOf = (taskId: string) => calls.added.filter((a) => a.path === `tasks/${taskId}/history`);

beforeEach(() => { calls.added = []; calls.updated = []; calls.deleted = []; calls.failHistory = false; calls.rounds = 0; });

describe('saveTask', () => {
  it('stamps who changed the task', async () => {
    await saveTask(account, { ...task, repeat: '' }, 't1');
    expect(calls.updated[0]).toMatchObject({ title: 'Prep', updatedByName: 'Ana' });
  });
  it('adds next week’s copy when a repeating task is finished', async () => {
    await saveTask(account, task, 't1', before('doing'));
    const copy = calls.added.find((a) => a.path === 'tasks');
    expect(copy?.body).toMatchObject({ status: 'todo', startDate: '2026-12-08', dueDate: '2026-12-10', checklist: '[ ] a', createdBy: 'u1' });
  });
  it('does not add another copy when the task was already done', async () => {
    await saveTask(account, task, 't1', before('done'));
    expect(calls.added.filter((a) => a.path === 'tasks')).toHaveLength(0);
  });
  it('writes what changed, and who, to the task’s history', async () => {
    await saveTask(account, task, 't1', before('doing'));
    expect(historyOf('t1')[0].body).toMatchObject({ byUid: 'u1', byName: 'Ana', summary: 'Status Doing → Done' });
  });
  it('notes the copy’s history as well', async () => {
    await saveTask(account, task, 't1', before('doing'));
    expect(historyOf('new2')[0]?.body.summary).toBe('Created as the next copy of “Prep”');
  });
  it('still saves when the history note cannot be written', async () => {
    calls.failHistory = true;
    await expect(saveTask(account, { ...task, repeat: '' }, 't1', before('doing'))).resolves.toBeUndefined();
    expect(calls.updated).toHaveLength(1);
  });
});

describe('history notes', () => {
  it('skips a save that changed nothing, even if a trailing space was typed', async () => {
    await saveTask(account, { ...task, status: 'doing' }, 't1', before('doing'));
    expect(historyOf('t1')).toHaveLength(0);
  });
  it('cuts a very long summary to the 500 characters the rules allow', async () => {
    const old: Task = { ...before('todo'), ownerUid: 'u1', ownerName: 'a'.repeat(200), notes: 'n', checklist: '[ ] c', link: '/a', repeat: '' };
    await saveTask(account, { ...task, status: 'doing', ownerUid: 'u2', ownerName: 'b'.repeat(200), notes: 'm', checklist: '[ ] d', link: '/b', repeat: 'weekly' }, 't1', old);
    expect(String(historyOf('t1')[0].body.summary)).toHaveLength(500);
  });
});

describe('removeTask', () => {
  it('deletes the task, then its history', async () => {
    await removeTask(before('todo'));
    expect(calls.deleted).toEqual(['tasks/t1', 'tasks/t1/history/h1']);
  });
});
