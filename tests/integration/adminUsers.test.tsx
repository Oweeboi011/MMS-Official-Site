import { fireEvent, screen, within } from '@testing-library/react';
import { renderAt } from '../helpers';

const svc = vi.hoisted(() => ({ roles: [] as string[][] }));
vi.mock('../../src/frontend/services/useAccount', () => ({ useAccount: () => ({ status: 'signedIn', account: { uid: 'a1', email: 'me@x.com', role: 'admin', emailVerified: true } }) }));
vi.mock('../../src/frontend/services/users', () => ({
  listUsers: async () => [
    { uid: 'a1', email: 'me@x.com', name: 'Me', role: 'admin', createdAt: Date.UTC(2026, 0, 5), addedBy: 'self', canEmailMembers: true, groups: ['bot'] },
    { uid: 'u2', email: 'ben@x.com', name: 'Ben', role: 'member', createdAt: 0, addedBy: 'a1', canEmailMembers: false, groups: [] },
  ],
  updateProfile: async (uid: string, c: { name: string; email: string }) => { svc.roles.push(['profile', uid, c.name, c.email]); },
  userClimbs: async () => [{ id: 'r1', climbId: 'c1', title: 'Mt. Pulag', date: 'Nov 20-22', statusLabel: 'Confirmed' }],
  setRole: async (uid: string, role: string) => { svc.roles.push([uid, role]); },
  createAccount: async (email: string) => { svc.roles.push(['create', email]); return { uid: 'n1', emailSent: false }; },
  deleteAccount: async (uid: string) => { svc.roles.push(['delete', uid]); },
  setGroups: async (uid: string, groups: string[]) => { svc.roles.push(['groups', uid, groups.join('+')]); },
}));

describe('admin: accounts and roles', () => {
  it('lists accounts, changes a role, and locks your own', async () => {
    renderAt('/admin/users');
    expect(await screen.findByText('ben@x.com', {}, { timeout: 5000 })).toBeInTheDocument();
    expect(screen.getByLabelText('Role for me@x.com')).toBeDisabled();
    fireEvent.change(screen.getByLabelText('Role for ben@x.com'), { target: { value: 'admin' } });
    await vi.waitFor(() => expect(svc.roles).toEqual([['u2', 'admin']]));
    fireEvent.change(screen.getByLabelText('Search email or name'), { target: { value: 'zzz' } });
    expect(screen.queryByText('ben@x.com')).not.toBeInTheDocument();
  });

  it('shows each person’s groups and content rights, and changes groups', async () => {
    svc.roles = [];
    renderAt('/admin/users');
    expect(await screen.findByText('ben@x.com', {}, { timeout: 5000 })).toBeInTheDocument();
    expect(screen.getByText('All pages')).toBeInTheDocument();
    expect(screen.getByText('No content rights')).toBeInTheDocument();
    fireEvent.click(within(screen.getByRole('group', { name: 'Groups for ben@x.com' })).getByLabelText('TCom'));
    await vi.waitFor(() => expect(svc.roles).toEqual([['groups', 'u2', 'tcom']]));
  });

  it('creates and deletes accounts (never your own)', async () => {
    svc.roles = [];
    renderAt('/admin/users');
    fireEvent.change(await screen.findByLabelText('New account email', {}, { timeout: 5000 }), { target: { value: 'carlo@x.com' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add account' }));
    expect(await screen.findByText(/Forgot password/)).toBeInTheDocument();
    expect(svc.roles).toContainEqual(['create', 'carlo@x.com']);
    expect(screen.getAllByRole('button', { name: 'Delete' })).toHaveLength(1); // only Ben, not me
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
    fireEvent.click(screen.getByRole('button', { name: 'Confirm delete ben@x.com' }));
    await vi.waitFor(() => expect(svc.roles).toContainEqual(['delete', 'u2']));
  });

  it('shows who added each account and when they joined, and opens a detail panel to correct a profile', async () => {
    svc.roles = [];
    renderAt('/admin/users');
    expect(await screen.findByText('Signed up themselves', {}, { timeout: 5000 })).toBeInTheDocument();
    expect(screen.getByText('Jan 5, 2026')).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole('button', { name: 'Details' })[1]);
    const dialog = await screen.findByRole('dialog', { name: 'Ben' });
    expect(dialog).toHaveTextContent('Added by');
    expect(await screen.findByRole('link', { name: 'Mt. Pulag' })).toHaveAttribute('href', '/admin/climbs/c1');
    fireEvent.change(within(dialog).getByLabelText('Name'), { target: { value: 'Benedict' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Save profile' }));
    await vi.waitFor(() => expect(svc.roles).toContainEqual(['profile', 'u2', 'Benedict', 'ben@x.com']));
  });
});
