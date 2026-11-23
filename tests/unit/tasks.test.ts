import { canUseTasks, isOverdue, timelineOf, toTask, validateTask, viewTasks, type Task, type TaskInput } from '../../src/frontend/data/tasks';

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
  it('rejects years outside 2020-2039 so one stray date cannot squash the timeline', () => {
    expect(validateTask({ ...ok, startDate: '', dueDate: '2099-01-01' })).toMatch(/2020.*2039/);
    expect(validateTask({ ...ok, startDate: '2019-12-31', dueDate: '' })).toMatch(/2020.*2039/);
    expect(validateTask({ ...ok, startDate: '2020-01-01', dueDate: '2039-12-31' })).toBe('');
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

describe('timelineOf', () => {
  const a = mk('a', { startDate: '2026-12-01', dueDate: '2026-12-11' });
  const b = mk('b', { dueDate: '2026-12-21' });
  const c = mk('c');
  const d = mk('d', { committee: 'tcom', startDate: '2026-12-06', dueDate: '2026-12-06' });

  it('sizes each bar against the whole range, inclusive of both end days', () => {
    const t = timelineOf([a, b, c, d]);
    expect([t.from, t.to]).toEqual(['2026-12-01', '2026-12-21']);
    const bar = (id: string) => t.groups.flatMap((g) => g.bars).find((x) => x.task.id === id)!;
    expect(bar('a').left).toBeCloseTo(0);
    expect(bar('a').width).toBeCloseTo((11 / 21) * 100);
    expect(bar('d').left).toBeCloseTo((5 / 21) * 100);
    expect(bar('d').width).toBeCloseTo((1 / 21) * 100);
  });
  it('treats a task with one date as a single-day marker', () => {
    const t = timelineOf([a, b]);
    const marker = t.groups[0].bars.find((x) => x.task.id === 'b')!;
    expect(marker.left).toBeCloseTo((20 / 21) * 100);
    expect(marker.width).toBeCloseTo((1 / 21) * 100);
  });
  it('groups by committee in fixed order, bars by start, and lists undated tasks apart', () => {
    const t = timelineOf([d, c, b, a]);
    expect(t.groups.map((g) => [g.committee, g.bars.map((x) => x.task.id)])).toEqual([['execom', ['a', 'b']], ['tcom', ['d']]]);
    expect(t.undated.map((x) => x.id)).toEqual(['c']);
  });
  it('marks the start of each month in range, with the first at the left edge', () => {
    const t = timelineOf([mk('x', { startDate: '2026-11-20', dueDate: '2026-12-10' })]);
    expect(t.months.map((m) => m.label)).toEqual(['Nov 2026', 'Dec 2026']);
    expect(t.months[0].left).toBe(0);
    expect(t.months[1].left).toBeCloseTo((11 / 21) * 100);
  });
  it('drops month labels that would sit on top of the previous one or run off the right edge', () => {
    const near = timelineOf([mk('x', { startDate: '2026-11-28', dueDate: '2027-03-01' })]);
    expect(near.months.map((m) => m.label)).not.toContain('Dec 2026');
    expect(near.months[0].label).toBe('Nov 2026');
    const wide = timelineOf([mk('y', { startDate: '2026-01-01', dueDate: '2029-12-31' })]);
    expect(wide.months.length).toBeLessThanOrEqual(14);
    expect(wide.months.every((m) => m.left <= 90)).toBe(true);
    const gaps = wide.months.slice(1).map((m, i) => m.left - wide.months[i].left);
    expect(gaps.every((g) => g >= 8)).toBe(true);
  });
  it('is empty when nothing has a date', () => {
    expect(timelineOf([c])).toEqual({ from: '', to: '', months: [], groups: [], undated: [c] });
  });
});
