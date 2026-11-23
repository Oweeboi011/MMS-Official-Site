import type { Account } from '../../src/frontend/services/auth';
import { saveTask } from '../../src/frontend/services/tasks';

const calls = vi.hoisted(() => ({ added: [] as Record<string, unknown>[], updated: [] as Record<string, unknown>[] }));
vi.mock('firebase/firestore/lite', () => ({
  addDoc: async (_c: unknown, body: Record<string, unknown>) => { calls.added.push(body); return { id: `new${calls.added.length}` }; },
  updateDoc: async (_d: unknown, body: Record<string, unknown>) => { calls.updated.push(body); },
  collection: () => ({}), doc: () => ({}), deleteDoc: async () => undefined, getDocs: async () => ({ docs: [] }),
  limit: () => ({}), orderBy: () => ({}), query: () => ({}), serverTimestamp: () => 'now',
}));
vi.mock('../../src/frontend/services/firebase', () => ({ firebase: () => ({ db: {} }) }));
vi.mock('../../src/frontend/services/firebaseEnv', () => ({ writesEnabled: true, readOnlyMessage: 'read only' }));
vi.mock('../../src/frontend/services/auditLog', () => ({ logAudit: async () => undefined }));

const account: Account = { uid: 'u1', email: 'a@x.com', role: 'member', emailVerified: true, name: 'Ana', groups: ['execom'] };
const task = { title: ' Prep ', committee: 'execom', status: 'done', ownerUid: '', ownerName: '', startDate: '2026-12-01', dueDate: '2026-12-03', notes: '', checklist: '[x] a', repeat: 'weekly', link: '' } as const;

beforeEach(() => { calls.added = []; calls.updated = []; });

describe('saveTask', () => {
  it('stamps who changed the task', async () => {
    await saveTask(account, { ...task, repeat: '' }, 't1');
    expect(calls.updated[0]).toMatchObject({ title: 'Prep', updatedByName: 'Ana' });
  });
  it('adds next week’s copy when a repeating task is finished', async () => {
    await saveTask(account, task, 't1');
    expect(calls.added).toHaveLength(1);
    expect(calls.added[0]).toMatchObject({ status: 'todo', startDate: '2026-12-08', dueDate: '2026-12-10', checklist: '[ ] a', createdBy: 'u1' });
  });
  it('does not add another copy when the task was already done', async () => {
    await saveTask(account, task, 't1', true);
    expect(calls.added).toHaveLength(0);
  });
});
