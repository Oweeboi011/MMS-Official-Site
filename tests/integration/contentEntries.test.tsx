import { fireEvent, screen } from '@testing-library/react';
import { renderAt } from '../helpers';

const calls = vi.hoisted(() => ({ saved: [] as unknown[], reviewed: [] as string[] }));
const who = vi.hoisted(() => ({ account: { uid: 'u1', email: 'tcom@x.com', role: 'member', emailVerified: true, groups: ['tcom'] as string[] } }));
vi.mock('../../src/frontend/services/useAccount', () => ({ useAccount: () => ({ status: 'signedIn', account: who.account }) }));
vi.mock('../../src/frontend/services/contentEntries', () => ({
  loadEntries: async () => [
    { id: 'e1', page: 'calendar', title: 'Pulag climb', data: { date: '2026-12-05' }, status: 'pending', submittedBy: 'u1', submittedByName: 'Ana', reviewedBy: '', note: '', updatedAt: 2 },
    { id: 'e2', page: 'trails', title: 'Batulao', data: {}, status: 'published', submittedBy: 'u9', submittedByName: 'Ben', reviewedBy: '', note: '', updatedAt: 1 },
  ],
  saveEntry: async (_a: unknown, input: unknown) => { calls.saved.push(input); },
  reviewEntry: async (_a: unknown, e: { id: string }, status: string) => { calls.reviewed.push(`${e.id}:${status}`); },
  removeEntry: async () => undefined,
}));

describe('page content', () => {
  it('lets a TCom officer submit an entry for a page they own', async () => {
    who.account = { ...who.account, groups: ['tcom'] };
    renderAt('/account/content');
    fireEvent.click(await screen.findByRole('button', { name: 'New entry' }, { timeout: 5000 }));
    expect(screen.queryByRole('option', { name: 'Membership' })).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Title *'), { target: { value: 'Pulag climb' } });
    fireEvent.click(screen.getByRole('button', { name: 'Send for review' }));
    expect(await screen.findByText('Date is required.')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Date *'), { target: { value: '2026-12-05' } });
    fireEvent.click(screen.getByRole('button', { name: 'Send for review' }));
    await vi.waitFor(() => expect(calls.saved).toEqual([{ id: undefined, page: 'calendar', title: 'Pulag climb', data: { date: '2026-12-05' }, status: 'pending' }]));
  });

  it('shows the review queue to ExeCom and lets them publish', async () => {
    calls.reviewed = [];
    who.account = { ...who.account, uid: 'x1', groups: ['execom'] };
    renderAt('/account/content');
    expect(await screen.findByText('1 waiting for review.', {}, { timeout: 5000 })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Publish' }));
    await vi.waitFor(() => expect(calls.reviewed).toEqual(['e1:published']));
  });

  it('tells a member without rights to ask an admin', async () => {
    who.account = { ...who.account, groups: [] };
    renderAt('/account/content');
    expect(await screen.findByText(/doesn’t have content rights/, {}, { timeout: 5000 })).toBeInTheDocument();
  });
});
