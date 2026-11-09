import { fireEvent, screen } from '@testing-library/react';
import { renderAt } from '../helpers';
import { toMyClimb } from '../../src/frontend/data/myClimbs';

const svc = vi.hoisted(() => ({ cancelled: [] as string[][], rows: [] as unknown[] }));
vi.mock('../../src/frontend/services/firebaseEnv', async (original) => ({ ...(await original<object>()), registrationEnabled: true }));
vi.mock('../../src/frontend/services/useAccount', () => ({ useAccount: () => ({ status: 'signedIn', account: { uid: 'u1', email: 'ana@x.com', role: 'member' } }) }));
vi.mock('../../src/frontend/services/registrations', () => ({
  myRegistrations: async () => svc.rows,
  cancelRegistration: async (id: string, reason: string) => { svc.cancelled.push([id, reason]); },
}));
vi.mock('../../src/frontend/services/publicData', () => ({
  publicReadsEnabled: true,
  climbLoader: async (id: string) => ({ id, title: id, status: 'open', startDate: new Date(Date.now() + (id === 'past' ? -864e6 : 864e6)) }),
  climbsLoader: () => async () => null, announcementsLoader: () => async () => null, loadSettings: async () => null,
  loadSurveys: async () => null, loadOfficers: async () => null, loadCurrentOfficers: async () => null,
}));

describe('My Climbs (switch on)', () => {
  beforeEach(() => {
    svc.cancelled = [];
    svc.rows = [
      toMyClimb('r1', { climbId: 'soon', climbTitle: 'Mt. Pulag', status: 'pending', paymentStatus: 'unpaid', feeBreakdown: [{ label: 'Guide', amount: '1500', selected: true }] }),
      toMyClimb('r2', { climbId: 'past', climbTitle: 'Mt. Apo', status: 'confirmed', paymentStatus: 'verified', amountPaid: 900, feeBreakdown: [{ label: 'Guide', amount: '900', selected: true }] }),
    ];
  });

  it('shows balances and cancels only climbs not yet over', async () => {
    renderAt('/account/climbs');
    expect(await screen.findByRole('link', { name: 'Mt. Pulag' })).toHaveAttribute('href', '/climbs/soon');
    expect(screen.getByText(/Balance ₱1,500/)).toBeInTheDocument();
    expect(screen.getByText(/Balance ₱0/)).toBeInTheDocument();
    const buttons = await screen.findAllByRole('button', { name: 'Cancel registration' });
    expect(buttons).toHaveLength(1); // Mt. Apo is over
    fireEvent.click(buttons[0]);
    expect(screen.getByText(/draft, pending officer approval/)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Reason (optional)'), { target: { value: 'Sick' } });
    fireEvent.click(screen.getByRole('button', { name: 'Yes, cancel' }));
    await vi.waitFor(() => expect(svc.cancelled).toEqual([['r1', 'Sick']]));
  });
});
