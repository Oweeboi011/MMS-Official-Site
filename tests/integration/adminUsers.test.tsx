import { fireEvent, screen } from '@testing-library/react';
import { renderAt } from '../helpers';

const svc = vi.hoisted(() => ({ roles: [] as string[][] }));
vi.mock('../../src/frontend/services/useAccount', () => ({ useAccount: () => ({ status: 'signedIn', account: { uid: 'a1', email: 'me@x.com', role: 'admin', emailVerified: true } }) }));
vi.mock('../../src/frontend/services/users', () => ({
  listUsers: async () => [{ uid: 'a1', email: 'me@x.com', name: 'Me', role: 'admin' }, { uid: 'u2', email: 'ben@x.com', name: 'Ben', role: 'member' }],
  setRole: async (uid: string, role: string) => { svc.roles.push([uid, role]); },
  createAccount: async (email: string) => { svc.roles.push(['create', email]); return { uid: 'n1', emailSent: false }; },
  deleteAccount: async (uid: string) => { svc.roles.push(['delete', uid]); },
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
});
