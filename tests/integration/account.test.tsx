import { screen } from '@testing-library/react';
import { renderAt } from '../helpers';
import type { AccountState } from '../../src/frontend/services/useAccount';

// No real Firebase in tests: the account state is injected.
let state: AccountState = { status: 'signedOut' };
vi.mock('../../src/frontend/services/useAccount', () => ({ useAccount: () => state }));
vi.mock('../../src/frontend/services/dashboard', () => ({
  loadDashboard: async () => ({
    rows: [
      { climb: { id: 'c1', title: 'Mt. Pulag', dates: 'Nov 20–22', type: 'Major', slotsLeft: 3, over: false, status: 'Open', day: '', month: '', location: 'Benguet', difficulty: 'Easy' }, status: 'open', confirmed: 12, pending: 4, waitlisted: 1, unpaid: 2, toReview: 2, fee: '₱3,590' },
      { climb: { id: 'c0', title: 'Mt. Marami', dates: 'Oct 10–11', type: 'Minor', over: true, status: 'Open', day: '', month: '', location: 'Cavite', difficulty: 'Easy' }, status: 'completed', confirmed: 4, pending: 0, waitlisted: 0, unpaid: 0, toReview: 0, fee: 'TBA' },
    ],
    totals: { climbs: 2, registrations: 40, toReview: 2, unpaid: 5, pending: 4 },
    recent: [{ id: 'r9', name: 'Ana Cruz', memberType: 'joiner', climbId: 'c1', title: 'Mt. Pulag', status: 'pending', statusLabel: 'Pending confirmation', paymentLabel: 'Not paid yet', createdAt: Date.UTC(2026, 10, 9) }],
  }),
}));
vi.mock('../../src/frontend/services/siteData', () => ({
  MAX_ROWS: 200,
  listRows: vi.fn(async () => [{ id: 'a1', data: { title: 'BMC open' } }]),
  saveRow: vi.fn(),
  removeRow: vi.fn(),
}));

describe('sign-in and admin pages', () => {
  it('signed out: sign-in page shows Google and email options', async () => {
    state = { status: 'signedOut' };
    renderAt('/account/sign-in');
    expect(await screen.findByRole('button', { name: 'Continue with Google' })).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  it('admin page asks a signed-out visitor to sign in', async () => {
    state = { status: 'signedOut' };
    renderAt('/admin');
    expect(await screen.findByRole('link', { name: 'Sign in' })).toHaveAttribute('href', '/account/sign-in');
  });

  it('a member is not let into the editors', async () => {
    state = { status: 'signedIn', account: { uid: 'm1', email: 'm@x.com', role: 'member', emailVerified: true } };
    renderAt('/admin');
    expect(await screen.findByText(/not an admin/)).toBeInTheDocument();
    expect(screen.queryByRole('navigation', { name: 'Collections' })).not.toBeInTheDocument();
  });

  it('an admin sees every collection and its rows', async () => {
    state = { status: 'signedIn', account: { uid: 'a1', email: 'a@x.com', role: 'admin', emailVerified: true } };
    renderAt('/admin');
    expect(await screen.findByRole('button', { name: 'Climbs' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Leadership' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Committees' })).toBeInTheDocument();
    expect((await screen.findAllByRole('button', { name: /BMC open/ })).length).toBeGreaterThan(0); // climbs tab: date · title · status (site content tab shows rows too)
    expect((await screen.findAllByRole('link', { name: 'Mt. Pulag' }))[0]).toHaveAttribute('href', '/admin/climbs/c1'); // the climb row, and the recent registration
    expect(screen.getByText('3 left')).toBeInTheDocument();
    expect(screen.getByText('12 · 4 · 2', { exact: false })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Awaiting payment review/ })).toHaveAttribute('href', '/admin/registrations?payment=submitted');
    expect(screen.getByRole('link', { name: /Unpaid registrations/ })).toHaveAttribute('href', '/admin/registrations?payment=unpaid');
    expect(screen.getByText('Recent registrations')).toBeInTheDocument();
    expect(screen.getByText('Completed', { exact: false })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Site content' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Payments and treasurer/ })).toHaveAttribute('href', '/admin/treasurer');
    expect(screen.getByRole('link', { name: /Accounts and roles/ })).toHaveAttribute('href', '/admin/users');
  });
});
