import { screen } from '@testing-library/react';
import { renderAt } from '../helpers';
import type { AccountState } from '../../src/frontend/services/useAccount';

// No real Firebase in tests: the account state is injected.
let state: AccountState = { status: 'signedOut' };
vi.mock('../../src/frontend/services/useAccount', () => ({ useAccount: () => state }));
vi.mock('../../src/frontend/services/dashboard', () => ({
  upcomingDashboard: async () => [{ climb: { id: 'c1', title: 'Mt. Pulag', dates: 'Nov 20–22', type: 'Major', slotsLeft: 3, over: false, status: 'Open', day: '', month: '', location: '', difficulty: 'Easy' },
    status: 'open', confirmed: 12, pending: 4, waitlisted: 1, toReview: 2 }],
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
    expect(await screen.findByRole('button', { name: /BMC open/ })).toBeInTheDocument(); // climbs tab: date · title · status
    expect(await screen.findByRole('link', { name: 'Mt. Pulag' })).toHaveAttribute('href', '/admin/climbs/c1');
    expect(screen.getByRole('table', { name: 'Upcoming climbs' })).toHaveTextContent('3 left');
  });
});
