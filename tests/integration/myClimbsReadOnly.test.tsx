import { screen } from '@testing-library/react';
import { renderAt } from '../helpers';
import { toMyClimb } from '../../src/frontend/data/myClimbs';

vi.mock('../../src/frontend/services/firebaseEnv', async (original) => ({ ...(await original<object>()), registrationEnabled: false }));
vi.mock('../../src/frontend/services/useAccount', () => ({ useAccount: () => ({ status: 'signedIn', account: { uid: 'u1', email: 'ana@x.com', role: 'member', emailVerified: true } }) }));
vi.mock('../../src/frontend/services/registrations', () => ({
  myRegistrations: async () => [toMyClimb('r1', { climbId: 'soon', climbTitle: 'Mt. Pulag', status: 'confirmed', paymentStatus: 'unpaid', amountPaid: 200, feeBreakdown: [{ label: 'Guide', amount: '1500', selected: true }] })],
}));
vi.mock('../../src/frontend/services/notifications', () => ({ myNotifications: async () => [], markRead: async () => undefined }));
vi.mock('../../src/frontend/services/publicData', () => ({
  publicReadsEnabled: true,
  climbLoader: async (id: string) => ({ id, title: id, status: 'open', startDate: new Date(Date.now() + 864e6), gcashName: 'MMS Treasury' }),
  climbsLoader: () => async () => null, announcementsLoader: () => async () => null, loadSettings: async () => null,
  loadSurveys: async () => null, loadOfficers: async () => null, loadCurrentOfficers: async () => null,
}));

describe('My Climbs before the switch', () => {
  it('shows the member’s copied registrations read-only, with no pay or cancel actions', async () => {
    renderAt('/account/climbs');
    expect(await screen.findByRole('link', { name: 'Mt. Pulag' }, { timeout: 5000 })).toBeInTheDocument();
    expect(screen.getByText(/read-only copy of your registrations/)).toBeInTheDocument();
    expect(screen.getByText(/Balance ₱1,300/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Cancel registration|Send payment|Submit payment/ })).not.toBeInTheDocument();
    expect(screen.queryByText('Pay your balance below.')).not.toBeInTheDocument();
  });
});
