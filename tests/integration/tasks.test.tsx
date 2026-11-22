import { fireEvent, screen, within } from '@testing-library/react';
import { renderAt } from '../helpers';

const calls = vi.hoisted(() => ({ saved: [] as unknown[], removed: [] as string[] }));
const fail = vi.hoisted(() => ({ next: '' }));
const who = vi.hoisted(() => ({ account: { uid: 'u1', email: 'exec@x.com', role: 'member', emailVerified: true, groups: ['execom'] as string[] } }));
vi.mock('../../src/frontend/services/useAccount', () => ({ useAccount: () => ({ status: 'signedIn', account: who.account }) }));
vi.mock('../../src/frontend/services/tasks', () => ({
  loadTasks: async () => [
    { id: 't1', title: 'Book venue', committee: 'execom', status: 'doing', ownerUid: 'u1', ownerName: 'Ana', startDate: '2020-01-01', dueDate: '2020-02-01', notes: '', updatedAt: 2 },
    { id: 't2', title: 'Plan training', committee: 'tcom', status: 'todo', ownerUid: 'u2', ownerName: 'Ben', startDate: '', dueDate: '2039-01-01', notes: '', updatedAt: 1 },
    { id: 't3', title: 'Old chore', committee: 'tcom', status: 'done', ownerUid: '', ownerName: '', startDate: '', dueDate: '2020-03-01', notes: '', updatedAt: 0 },
    { id: 't4', title: 'Sort gear', committee: 'execom', status: 'todo', ownerUid: '', ownerName: '', startDate: '', dueDate: '', notes: '', updatedAt: -1 },
  ],
  loadOwners: async () => [{ uid: 'u1', name: 'Ana' }, { uid: 'u2', name: 'Ben' }],
  saveTask: async (_a: unknown, input: unknown, id?: string) => {
    if (fail.next) { const message = fail.next; fail.next = ''; throw new Error(message); }
    calls.saved.push({ input, id });
  },
  TASK_LIMIT: 500,
  removeTask: async (t: { id: string }) => { calls.removed.push(t.id); },
}));

const rowFor = (title: string) => screen.getByRole('row', { name: new RegExp(title) });

describe('task tracker table', () => {
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
      input: { title: 'Order patches', committee: 'tcom', status: 'todo', ownerUid: 'u2', ownerName: 'Ben', startDate: '', dueDate: '', notes: '' },
    }]));
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
      input: { title: 'Plan training', committee: 'tcom', status: 'blocked', ownerUid: 'u2', ownerName: 'Ben', startDate: '', dueDate: '2039-01-01', notes: '' },
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

  describe('timeline view', () => {
    const openTimeline = async () => {
      renderAt('/account/tasks');
      await screen.findByText('Book venue', {}, { timeout: 5000 });
      fireEvent.click(screen.getByRole('button', { name: 'Timeline' }));
      return screen.getByRole('region', { name: 'Timeline' });
    };

    it('replaces the table with bars grouped by committee, undated tasks listed apart', async () => {
      const timeline = await openTimeline();
      expect(screen.queryByRole('table')).not.toBeInTheDocument();
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
      expect(screen.getByRole('table')).toBeInTheDocument();
    });

    it('opens the edit form from a bar', async () => {
      const timeline = await openTimeline();
      fireEvent.click(within(timeline).getByRole('button', { name: 'Edit Plan training' }));
      expect(screen.getByRole('button', { name: 'Save task' })).toBeInTheDocument();
    });
  });
});
