import { act, fireEvent, screen, within } from '@testing-library/react';
import axe from 'axe-core';
import { renderAt } from '../helpers';

const calls = vi.hoisted(() => ({ saved: [] as unknown[], removed: [] as string[], csv: [] as string[][], previous: [] as (string | undefined)[], limits: [] as number[] }));
vi.mock('../../src/frontend/lib/download', () => ({ downloadCsv: (name: string, text: string) => { calls.csv.push([name, text]); } }));
vi.mock('../../src/frontend/services/publicData', async (orig) => ({
  ...(await orig<typeof import('../../src/frontend/services/publicData')>()),
  loadClimbLog: async () => [{ id: 'c1', title: 'Mt. Pulag', startDate: '2026-12-05', status: 'open' }],
}));
const fail = vi.hoisted(() => ({ next: '' }));
const who = vi.hoisted(() => ({ account: { uid: 'u1', email: 'exec@x.com', role: 'member', emailVerified: true, groups: ['execom'] as string[] } }));
vi.mock('../../src/frontend/services/useAccount', () => ({ useAccount: () => ({ status: 'signedIn', account: who.account }) }));
vi.mock('../../src/frontend/services/tasks', () => ({
  loadTasks: async (max: number) => { calls.limits.push(max); return [
    { id: 't1', title: 'Book venue', committee: 'execom', status: 'doing', ownerUid: 'u1', ownerName: 'Ana', startDate: '2020-01-01', dueDate: '2020-02-01', notes: '', checklist: '', repeat: '', link: '', updatedByName: '', updatedAt: 2 },
    { id: 't2', title: 'Plan training', committee: 'tcom', status: 'todo', ownerUid: 'u2', ownerName: 'Ben', startDate: '', dueDate: '2039-01-01', notes: '', checklist: '', repeat: '', link: '', updatedByName: '', updatedAt: 1 },
    { id: 't3', title: 'Old chore', committee: 'tcom', status: 'done', ownerUid: '', ownerName: '', startDate: '', dueDate: '2020-03-01', notes: '', checklist: '', repeat: '', link: '', updatedByName: '', updatedAt: 0 },
    { id: 't4', title: 'Sort gear', committee: 'execom', status: 'todo', ownerUid: '', ownerName: '', startDate: '', dueDate: '', notes: '', checklist: '', repeat: '', link: '', updatedByName: '', updatedAt: -1 },
    { id: 't5', title: 'Print forms', committee: 'execom', status: 'doing', ownerUid: 'u9', ownerName: 'Gone Guy', startDate: '2030-01-01', dueDate: '2030-01-02', notes: 'Venue https://example.com/venue and javascript:alert(1)', checklist: '[x] Book hall\n[ ] Print', repeat: 'weekly', link: '/activities/open-climbs', updatedByName: 'Cara', updatedAt: -2 },
  ]; },
  loadHistory: async (id: string) => (id === 't2' ? [{ id: 'h1', byName: 'Cara', summary: 'Status To do → Doing', at: Date.parse('2026-11-23T04:00:00Z') }] : []),
  loadOwners: async () => [{ uid: 'u1', name: 'Ana' }, { uid: 'u2', name: 'Ben' }],
  saveTask: async (_a: unknown, input: unknown, id?: string, previous?: { status: string }) => {
    if (fail.next) { const message = fail.next; fail.next = ''; throw new Error(message); }
    calls.saved.push({ input, id });
    calls.previous.push(previous?.status);
  },
  TASK_LIMIT: 5,
  removeTask: async (t: { id: string }) => { calls.removed.push(t.id); },
}));

const rowFor = (title: string) => screen.getByRole('row', { name: new RegExp(title) });

describe('task tracker table', () => {
  beforeEach(() => { window.localStorage.clear(); });

  it('tells someone without a group they have no access', async () => {
    who.account = { ...who.account, groups: [] };
    renderAt('/account/tasks');
    expect(await screen.findByText(/doesn’t have access to the task tracker/, {}, { timeout: 5000 })).toBeInTheDocument();
    who.account = { ...who.account, groups: ['execom'] };
  });

  it('lists tasks and marks only the unfinished past-due one as overdue', async () => {
    renderAt('/account/tasks');
    expect(await screen.findByText('Book venue', {}, { timeout: 5000 })).toBeInTheDocument();
    expect(within(rowFor('Book venue')).getByText('Overdue')).toBeInTheDocument();
    expect(within(rowFor('Plan training')).queryByText('Overdue')).not.toBeInTheDocument();
    expect(within(rowFor('Old chore')).queryByText('Overdue')).not.toBeInTheDocument();
  });

  it('filters by status and by committee', async () => {
    renderAt('/account/tasks');
    await screen.findByText('Book venue', {}, { timeout: 5000 });
    fireEvent.change(screen.getByLabelText('Status'), { target: { value: 'todo' } });
    expect(screen.queryByText('Book venue')).not.toBeInTheDocument();
    expect(screen.getByText('Plan training')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Status'), { target: { value: '' } });
    fireEvent.change(screen.getByLabelText('Committee'), { target: { value: 'execom' } });
    expect(screen.queryByText('Plan training')).not.toBeInTheDocument();
    expect(screen.getByText('Book venue')).toBeInTheDocument();
  });

  it('offers My tasks and Unassigned in the owner filter', async () => {
    renderAt('/account/tasks');
    await screen.findByText('Book venue', {}, { timeout: 5000 });
    fireEvent.change(screen.getByLabelText('Owner'), { target: { value: 'u1' } });
    expect(screen.getByRole('option', { name: 'My tasks' })).toBeInTheDocument();
    expect(screen.getByText('Book venue')).toBeInTheDocument();
    expect(screen.queryByText('Plan training')).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Owner'), { target: { value: '__unassigned' } });
    expect(screen.getByText('Old chore')).toBeInTheDocument();
    expect(screen.getByText('Sort gear')).toBeInTheDocument();
    expect(screen.queryByText('Book venue')).not.toBeInTheDocument();
  });

  it('explains an empty result and clears the filters', async () => {
    renderAt('/account/tasks');
    await screen.findByText('Book venue', {}, { timeout: 5000 });
    fireEvent.change(screen.getByLabelText('Status'), { target: { value: 'blocked' } });
    expect(screen.getByText(/No tasks match these filters/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Clear filters' }));
    expect(screen.getByText('Book venue')).toBeInTheDocument();
  });

  it('says how soon an unfinished task is due', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2038-12-30T04:00:00Z'));
    try {
      renderAt('/account/tasks');
      await screen.findByText('Plan training', {}, { timeout: 5000 });
      expect(within(rowFor('Plan training')).getByText('Due in 2 days')).toBeInTheDocument();
    } finally { vi.useRealTimers(); }
  });

  it('downloads the tasks the filters show as CSV', async () => {
    calls.csv = [];
    renderAt('/account/tasks');
    await screen.findByText('Book venue', {}, { timeout: 5000 });
    fireEvent.change(screen.getByLabelText('Committee'), { target: { value: 'tcom' } });
    fireEvent.click(screen.getByRole('button', { name: 'Download CSV (2)' }));
    expect(calls.csv).toHaveLength(1);
    expect(calls.csv[0][0]).toBe('committee-tasks');
    expect(calls.csv[0][1]).toContain('Plan training');
    expect(calls.csv[0][1]).not.toContain('Book venue');
  });

  it('adds a task, asking for a title first', async () => {
    calls.saved = [];
    renderAt('/account/tasks');
    fireEvent.click(await screen.findByRole('button', { name: 'New task' }, { timeout: 5000 }));
    fireEvent.click(screen.getByRole('button', { name: 'Save task' }));
    expect(await screen.findByText(/Title is required/)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Title *'), { target: { value: 'Order patches' } });
    fireEvent.change(screen.getByLabelText('Committee *'), { target: { value: 'tcom' } });
    fireEvent.change(screen.getByLabelText('Owner'), { target: { value: 'u2' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save task' }));
    await vi.waitFor(() => expect(calls.saved).toEqual([{
      id: undefined,
      input: { title: 'Order patches', committee: 'tcom', status: 'todo', ownerUid: 'u2', ownerName: 'Ben', startDate: '', dueDate: '', notes: '', checklist: '', repeat: '', link: '' },
    }]));
  });

  it('saves a checklist, a repeat and a related link, and refuses a bad link', async () => {
    calls.saved = [];
    renderAt('/account/tasks');
    fireEvent.click(await screen.findByRole('button', { name: 'New task' }, { timeout: 5000 }));
    fireEvent.change(screen.getByLabelText('Title *'), { target: { value: 'Prep meeting' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add item' }));
    fireEvent.change(screen.getByLabelText('Item 1'), { target: { value: 'Call ' } });
    expect(screen.getByLabelText('Item 1')).toHaveValue('Call ');
    fireEvent.change(screen.getByLabelText('Item 1'), { target: { value: 'Call venue' } });
    fireEvent.change(screen.getByLabelText('Repeat'), { target: { value: 'weekly' } });
    fireEvent.change(screen.getByLabelText('Related link'), { target: { value: 'javascript:alert(1)' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save task' }));
    expect(await screen.findByText(/Link must start with https/)).toBeInTheDocument();
    expect(calls.saved).toEqual([]);
    fireEvent.change(screen.getByLabelText('Related link'), { target: { value: '/activities/open-climbs' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save task' }));
    await vi.waitFor(() => expect(calls.saved).toHaveLength(1));
    expect(calls.saved[0]).toMatchObject({ input: { title: 'Prep meeting', checklist: '[ ] Call venue', repeat: 'weekly', link: '/activities/open-climbs' } });
  });

  it('links a task to a climb chosen from the list', async () => {
    calls.saved = [];
    renderAt('/account/tasks');
    fireEvent.click(await screen.findByRole('button', { name: 'New task' }, { timeout: 5000 }));
    fireEvent.change(screen.getByLabelText('Title *'), { target: { value: 'Pack list' } });
    fireEvent.change(await screen.findByLabelText('Related climb'), { target: { value: '/climbs/c1' } });
    expect(screen.getByLabelText('Related link')).toHaveValue('/climbs/c1');
    fireEvent.click(screen.getByRole('button', { name: 'Save task' }));
    await vi.waitFor(() => expect(calls.saved).toHaveLength(1));
    expect(calls.saved[0]).toMatchObject({ input: { title: 'Pack list', link: '/climbs/c1' } });
  });

  it('shows who changed a task and what, when editing it, and nothing for a new task', async () => {
    renderAt('/account/tasks');
    await screen.findByText('Plan training', {}, { timeout: 5000 });
    fireEvent.click(within(rowFor('Plan training')).getByRole('button', { name: 'Edit' }));
    const history = await screen.findByRole('region', { name: 'History' });
    expect(within(history).getByText(/Cara: Status To do → Doing/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    fireEvent.click(screen.getByRole('button', { name: 'New task' }));
    expect(screen.queryByRole('region', { name: 'History' })).not.toBeInTheDocument();
  });

  it('edits a task through the same form', async () => {
    calls.saved = [];
    renderAt('/account/tasks');
    await screen.findByText('Plan training', {}, { timeout: 5000 });
    fireEvent.click(within(rowFor('Plan training')).getByRole('button', { name: 'Edit' }));
    fireEvent.change(screen.getByLabelText('Status'), { target: { value: 'blocked' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save task' }));
    await vi.waitFor(() => expect(calls.saved).toHaveLength(1));
    // Exactly the stored fields: id and updatedAt in the payload would be rejected by the rules.
    expect(calls.saved[0]).toEqual({
      id: 't2',
      input: { title: 'Plan training', committee: 'tcom', status: 'blocked', ownerUid: 'u2', ownerName: 'Ben', startDate: '', dueDate: '2039-01-01', notes: '', checklist: '', repeat: '', link: '' },
    });
  });

  it('shows why a save failed instead of silently staying open', async () => {
    fail.next = 'Missing or insufficient permissions.';
    renderAt('/account/tasks');
    fireEvent.click(await screen.findByRole('button', { name: 'New task' }, { timeout: 5000 }));
    fireEvent.change(screen.getByLabelText('Title *'), { target: { value: 'Order patches' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save task' }));
    expect(await screen.findByText(/Not saved: Missing or insufficient permissions/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save task' })).toBeInTheDocument();
  });

  describe('summary, details and shortcuts', () => {
    it('reminds the signed-in person of their own late tasks and shows only those on request', async () => {
      renderAt('/account/tasks');
      expect(await screen.findByText(/You have 1 overdue task./, {}, { timeout: 5000 })).toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: 'Show my tasks' }));
      expect(screen.getByLabelText('Owner')).toHaveValue('u1');
      expect(screen.getByText('Book venue')).toBeInTheDocument();
      expect(screen.queryByText('Plan training')).not.toBeInTheDocument();
    });

    it('counts tasks per committee, including overdue', async () => {
      renderAt('/account/tasks');
      await screen.findByText('Book venue', {}, { timeout: 5000 });
      const row = within(screen.getByRole('table', { name: 'Summary by committee' })).getByRole('row', { name: /ExeCom/ });
      expect(within(row).getAllByRole('cell').map((c) => c.textContent)).toEqual(['1', '2', '0', '0', '1', '0']);
    });

    it('folds notes, checklist progress, link and who changed it under the title, linking only http(s)', async () => {
      renderAt('/account/tasks');
      await screen.findByText('Print forms', {}, { timeout: 5000 });
      const row = rowFor('Print forms');
      expect(within(row).getByText('Details (1/2 done)')).toBeInTheDocument();
      expect(within(row).getByRole('link', { name: 'https://example.com/venue' })).toHaveAttribute('href', 'https://example.com/venue');
      expect(within(row).queryByRole('link', { name: /javascript/ })).not.toBeInTheDocument();
      expect(within(row).getByRole('link', { name: '/activities/open-climbs' })).toHaveAttribute('href', '/activities/open-climbs');
      expect(within(row).getByText('Last changed by Cara.')).toBeInTheDocument();
      expect(within(row).getByText('(no longer in a group)')).toBeInTheDocument();
      expect(within(rowFor('Plan training')).queryByText('(no longer in a group)')).not.toBeInTheDocument();
    });

    it('changes status from the row and hands the service the task as it was', async () => {
      calls.saved = []; calls.previous = [];
      renderAt('/account/tasks');
      await screen.findByText('Plan training', {}, { timeout: 5000 });
      fireEvent.change(screen.getByLabelText('Status of Plan training'), { target: { value: 'done' } });
      await vi.waitFor(() => expect(calls.saved).toHaveLength(1));
      expect(calls.saved[0]).toMatchObject({ id: 't2', input: { status: 'done', title: 'Plan training' } });
      fireEvent.change(screen.getByLabelText('Status of Old chore'), { target: { value: 'todo' } });
      await vi.waitFor(() => expect(calls.previous).toEqual(['todo', 'done']));
    });

    it('switches views and starts a task from the keyboard', async () => {
      renderAt('/account/tasks');
      await screen.findByText('Book venue', {}, { timeout: 5000 });
      fireEvent.keyDown(document.body, { key: 'l' });
      expect(screen.getByRole('button', { name: 'Timeline' })).toHaveAttribute('aria-pressed', 'true');
      fireEvent.keyDown(document.body, { key: 't' });
      expect(screen.getByRole('button', { name: 'Table' })).toHaveAttribute('aria-pressed', 'true');
      fireEvent.keyDown(screen.getByLabelText('Status'), { key: 'n' });
      expect(screen.queryByRole('button', { name: 'Save task' })).not.toBeInTheDocument();
      fireEvent.keyDown(document.body, { key: 'n' });
      expect(screen.getByRole('button', { name: 'Save task' })).toBeInTheDocument();
    });

    it('remembers the view and filters next time', async () => {
      const first = renderAt('/account/tasks');
      await screen.findByText('Book venue', {}, { timeout: 5000 });
      fireEvent.click(screen.getByRole('button', { name: 'Timeline' }));
      fireEvent.change(screen.getByLabelText('Status'), { target: { value: 'todo' } });
      first.unmount();
      renderAt('/account/tasks');
      await screen.findByText('Plan training', {}, { timeout: 5000 });
      expect(screen.getByRole('button', { name: 'Timeline' })).toHaveAttribute('aria-pressed', 'true');
      expect(screen.getByLabelText('Status')).toHaveValue('todo');
    });

    it('still opens when the browser blocks storage', async () => {
      const read = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('blocked'); });
      const write = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('blocked'); });
      try {
        renderAt('/account/tasks');
        expect(await screen.findByText('Book venue', {}, { timeout: 5000 })).toBeInTheDocument();
      } finally { read.mockRestore(); write.mockRestore(); }
    });

    it('offers more tasks when the limit is reached', async () => {
      calls.limits = [];
      renderAt('/account/tasks');
      fireEvent.click(await screen.findByRole('button', { name: 'Show more tasks' }, { timeout: 5000 }));
      await vi.waitFor(() => expect(calls.limits).toEqual([5, 10]));
    });
  });

  describe('delete with undo', () => {
    it('brings the task back on Undo and deletes nothing', async () => {
      calls.removed = [];
      renderAt('/account/tasks');
      await screen.findByText('Old chore', {}, { timeout: 5000 });
      fireEvent.click(within(rowFor('Old chore')).getByRole('button', { name: 'Delete' }));
      expect(screen.queryByRole('row', { name: /Old chore/ })).not.toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: 'Undo' }));
      expect(rowFor('Old chore')).toBeInTheDocument();
      expect(calls.removed).toEqual([]);
    });

    it('deletes after a few seconds if not undone', async () => {
      calls.removed = [];
      renderAt('/account/tasks');
      await screen.findByText('Old chore', {}, { timeout: 5000 });
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
      try {
        fireEvent.click(within(rowFor('Old chore')).getByRole('button', { name: 'Delete' }));
        expect(calls.removed).toEqual([]);
        await act(async () => { vi.advanceTimersByTime(6100); });
      } finally { vi.useRealTimers(); }
      expect(calls.removed).toEqual(['t3']);
    });
  });

  describe('timeline view', () => {
    const openTimeline = async () => {
      renderAt('/account/tasks');
      await screen.findByText('Book venue', {}, { timeout: 5000 });
      fireEvent.click(screen.getByRole('button', { name: 'Timeline' }));
      return screen.getByRole('region', { name: 'Timeline' });
    };

    it('replaces the table with bars grouped by committee, undated tasks listed apart', async () => {
      const timeline = await openTimeline();
      expect(screen.queryByRole('table', { name: 'Tasks' })).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Timeline' })).toHaveAttribute('aria-pressed', 'true');
      expect(within(timeline).getByRole('heading', { name: 'ExeCom' })).toBeInTheDocument();
      expect(within(timeline).getByRole('heading', { name: 'TCom' })).toBeInTheDocument();
      expect(within(timeline).getByText('Book venue')).toBeInTheDocument();
      expect(within(timeline).getByRole('heading', { name: 'No dates yet' })).toBeInTheDocument();
      expect(within(timeline).getByText('Sort gear')).toBeInTheDocument();
      expect(within(timeline).getByText('Overdue')).toBeInTheDocument();
    });

    it('words single-date tasks plainly and hides the sort that does not apply', async () => {
      const timeline = await openTimeline();
      expect(within(timeline).getByText(/Due 2039-01-01/)).toBeInTheDocument();
      expect(within(timeline).getByText(/2020-01-01 to 2020-02-01/)).toBeInTheDocument();
      expect(screen.queryByLabelText('Sort by')).not.toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: 'Table' }));
      expect(screen.getByLabelText('Sort by')).toBeInTheDocument();
    });

    it('follows the filters and goes back to the table', async () => {
      renderAt('/account/tasks');
      await screen.findByText('Book venue', {}, { timeout: 5000 });
      fireEvent.change(screen.getByLabelText('Status'), { target: { value: 'todo' } });
      fireEvent.click(screen.getByRole('button', { name: 'Timeline' }));
      const timeline = screen.getByRole('region', { name: 'Timeline' });
      expect(within(timeline).queryByText('Book venue')).not.toBeInTheDocument();
      expect(within(timeline).getByText('Plan training')).toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: 'Table' }));
      expect(screen.getByRole('table', { name: 'Tasks' })).toBeInTheDocument();
    });

    it('shows today, a legend and zoom', async () => {
      const timeline = await openTimeline();
      expect(within(timeline).getByRole('img', { name: /^Today, \d{4}-\d{2}-\d{2}$/ })).toBeInTheDocument();
      expect(within(within(timeline).getByRole('list', { name: 'Legend' })).getByText('Blocked')).toBeInTheDocument();
      expect(within(timeline).getByRole('button', { name: 'Zoom out' })).toBeDisabled();
      fireEvent.click(within(timeline).getByRole('button', { name: 'Zoom in' }));
      expect(within(timeline).getByRole('button', { name: 'Zoom out' })).toBeEnabled();
    });

    it('moves a task’s dates a day, or a week with Shift, from the keyboard', async () => {
      calls.saved = [];
      const timeline = await openTimeline();
      const bar = within(timeline).getByRole('button', { name: /^Move Book venue/ });
      fireEvent.keyDown(bar, { key: 'ArrowRight' });
      await vi.waitFor(() => expect(calls.saved).toHaveLength(1));
      expect(calls.saved[0]).toMatchObject({ id: 't1', input: { startDate: '2020-01-02', dueDate: '2020-02-02' } });
      fireEvent.keyDown(bar, { key: 'ArrowLeft', shiftKey: true });
      await vi.waitFor(() => expect(calls.saved).toHaveLength(2));
      expect(calls.saved[1]).toMatchObject({ input: { startDate: '2019-12-25', dueDate: '2020-01-25' } });
    });

    it('moves a task by dragging its bar, even when released away from it', async () => {
      calls.saved = [];
      const width = 1000;
      const rect = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({ width, height: 12, top: 0, left: 0, right: width, bottom: 12, x: 0, y: 0, toJSON: () => ({}) });
      try {
        const timeline = await openTimeline();
        const bar = within(timeline).getByRole('button', { name: /^Move Book venue/ });
        const captured: number[] = [];
        bar.setPointerCapture = (id: number) => { captured.push(id); };
        const total = (Date.parse('2039-01-01') - Date.parse('2020-01-01')) / 86_400_000 + 1;
        fireEvent.pointerDown(bar, { pointerId: 7, clientX: 0 });
        expect(captured).toEqual([7]);
        fireEvent.pointerUp(bar, { pointerId: 7, clientX: (width / total) * 3 });
        await vi.waitFor(() => expect(calls.saved).toHaveLength(1));
        expect(calls.saved[0]).toMatchObject({ id: 't1', input: { startDate: '2020-01-04', dueDate: '2020-02-04' } });
      } finally { rect.mockRestore(); }
    });

    it('opens the edit form from a bar', async () => {
      const timeline = await openTimeline();
      fireEvent.click(within(timeline).getByRole('button', { name: 'Edit Plan training' }));
      expect(screen.getByRole('button', { name: 'Save task' })).toBeInTheDocument();
    });
  });

  // Signed-in structure (labels, roles, names); colour contrast needs a real browser, so jsdom skips it.
  describe('accessibility', () => {
    const violations = async () => (await axe.run(document.body, { rules: { 'color-contrast': { enabled: false } } })).violations.map((v) => v.id + ': ' + v.help);

    it('has no axe violations in the table, timeline or form', async () => {
      renderAt('/account/tasks');
      await screen.findByText('Book venue', {}, { timeout: 5000 });
      expect(await violations()).toEqual([]);
      fireEvent.click(screen.getByRole('button', { name: 'Timeline' }));
      expect(await violations()).toEqual([]);
      fireEvent.click(screen.getByRole('button', { name: 'Edit Plan training' }));
      expect(await violations()).toEqual([]);
    });
  });
});
