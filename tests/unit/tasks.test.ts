import { canUseTasks, isOverdue, toTask, validateTask, viewTasks, type Task, type TaskInput } from '../../src/frontend/data/tasks';

const mk = (id: string, extra: Partial<Task> = {}): Task => ({ id, title: id, committee: 'execom', status: 'todo', ownerUid: '', ownerName: '', startDate: '', dueDate: '', notes: '', updatedAt: 0, ...extra });
const none = { committee: '', status: '', ownerUid: '', sort: 'due' } as const;

describe('isOverdue', () => {
  it('is true only for an unfinished task past its due date', () => {
    expect(isOverdue(mk('a', { dueDate: '2026-11-01' }), '2026-11-22')).toBe(true);
    expect(isOverdue(mk('a', { dueDate: '2026-11-22' }), '2026-11-22')).toBe(false);
    expect(isOverdue(mk('a', { dueDate: '2026-11-01', status: 'done' }), '2026-11-22')).toBe(false);
    expect(isOverdue(mk('a'), '2026-11-22')).toBe(false);
  });
});

describe('viewTasks', () => {
  const rows = [
    mk('late', { dueDate: '2026-12-20', committee: 'tcom', ownerUid: 'u1', status: 'doing' }),
    mk('soon', { dueDate: '2026-12-01', ownerUid: 'u2' }),
    mk('open'),
    mk('zed', { dueDate: '2026-12-10', status: 'blocked' }),
  ];
  const ids = (list: Task[]) => list.map((t) => t.id);
  it('sorts by due date with undated tasks last', () => expect(ids(viewTasks(rows, none))).toEqual(['soon', 'zed', 'late', 'open']));
  it('sorts by title, status order or committee', () => {
    expect(ids(viewTasks(rows, { ...none, sort: 'title' }))).toEqual(['late', 'open', 'soon', 'zed']);
    expect(ids(viewTasks(rows, { ...none, sort: 'status' }))).toEqual(['soon', 'open', 'late', 'zed']);
    expect(ids(viewTasks(rows, { ...none, sort: 'committee' })).at(-1)).toBe('late');
  });
  it('filters by committee, status and owner together', () => {
    expect(ids(viewTasks(rows, { ...none, committee: 'tcom' }))).toEqual(['late']);
    expect(ids(viewTasks(rows, { ...none, status: 'blocked' }))).toEqual(['zed']);
    expect(ids(viewTasks(rows, { ...none, ownerUid: 'u2' }))).toEqual(['soon']);
    expect(viewTasks(rows, { ...none, committee: 'tcom', status: 'todo' })).toEqual([]);
  });
  it('does not change the list it is given', () => {
    const before = ids(rows);
    viewTasks(rows, { ...none, sort: 'title' });
    expect(ids(rows)).toEqual(before);
  });
});

describe('toTask', () => {
  it('reads a stored task with its id and update time', () => {
    const stamp = { toMillis: () => 5000 };
    expect(toTask('t1', { title: 'Book venue', committee: 'tcom', status: 'doing', ownerUid: 'u1', ownerName: 'Ana', startDate: '2026-12-01', dueDate: '2026-12-10', notes: 'n', updatedAt: stamp }))
      .toEqual({ id: 't1', title: 'Book venue', committee: 'tcom', status: 'doing', ownerUid: 'u1', ownerName: 'Ana', startDate: '2026-12-01', dueDate: '2026-12-10', notes: 'n', updatedAt: 5000 });
  });
  it('survives missing or wrong-typed fields', () => {
    expect(toTask('t2', { title: 7, status: 'later' })).toEqual({ id: 't2', title: '', committee: 'execom', status: 'todo', ownerUid: '', ownerName: '', startDate: '', dueDate: '', notes: '', updatedAt: 0 });
  });
});

const ok: TaskInput = { title: 'Book venue', committee: 'execom', status: 'todo', ownerUid: 'u1', ownerName: 'Ana', startDate: '2026-12-01', dueDate: '2026-12-10', notes: '' };

describe('validateTask', () => {
  it('accepts a complete task and one with no owner or dates', () => {
    expect(validateTask(ok)).toBe('');
    expect(validateTask({ ...ok, ownerUid: '', ownerName: '', startDate: '', dueDate: '' })).toBe('');
  });
  it('rejects a title whose raw length is over 200 even if trimming would shorten it, and impossible dates', () => {
    expect(validateTask({ ...ok, title: `${'x'.repeat(150)}${' '.repeat(100)}` })).toMatch(/title/i);
    expect(validateTask({ ...ok, dueDate: '2026-13-45' })).toMatch(/date/i);
    expect(validateTask({ ...ok, dueDate: '2026-02-30' })).toMatch(/date/i);
    expect(validateTask({ ...ok, startDate: '', dueDate: '2028-02-29' })).toBe('');
  });
  it('rejects a blank or long title, bad committee or status, bad or reversed dates', () => {
    expect(validateTask({ ...ok, title: '  ' })).toMatch(/title/i);
    expect(validateTask({ ...ok, title: 'x'.repeat(201) })).toMatch(/title/i);
    expect(validateTask({ ...ok, committee: 'bot' as 'tcom' })).toMatch(/committee/i);
    expect(validateTask({ ...ok, status: 'later' as 'todo' })).toMatch(/status/i);
    expect(validateTask({ ...ok, dueDate: '10/12/2026' })).toMatch(/date/i);
    expect(validateTask({ ...ok, startDate: '2026-12-11' })).toMatch(/before/i);
    expect(validateTask({ ...ok, notes: 'x'.repeat(2001) })).toMatch(/notes/i);
  });
});

describe('task access (ADR 0012)', () => {
  it('lets admins and any group member in, nobody else', () => {
    expect(canUseTasks({ role: 'admin', groups: [] })).toBe(true);
    for (const g of ['bot', 'execom', 'tcom']) expect(canUseTasks({ role: 'member', groups: [g] })).toBe(true);
    expect(canUseTasks({ role: 'member', groups: [] })).toBe(false);
  });
});
