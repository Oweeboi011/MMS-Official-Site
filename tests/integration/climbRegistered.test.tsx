import { screen } from '@testing-library/react';
import { renderAt } from '../helpers';
import { toMyClimb } from '../../src/frontend/data/myClimbs';
import { setSignedInHint } from '../../src/frontend/lib/signedInHint';

const mine = vi.hoisted(() => ({ rows: [] as unknown[] }));
vi.mock('../../src/frontend/services/firebaseEnv', async (original) => ({ ...(await original<object>()), registrationEnabled: true }));
vi.mock('../../src/frontend/services/useAccount', () => ({ useAccount: () => ({ status: 'signedIn', account: { uid: 'u1', email: 'ana@x.com', role: 'member', emailVerified: true } }) }));
vi.mock('../../src/frontend/services/registrations', () => ({ myRegistrations: async () => mine.rows }));
vi.mock('../../src/frontend/services/climbPrivate', () => ({ loadClimbPrivate: async () => null }));
vi.mock('../../src/frontend/services/publicData', () => ({
  publicReadsEnabled: true,
  climbLoader: async () => ({ id: 'c1', title: 'Mt. Pulag', status: 'open', location: 'Benguet', startDate: new Date(Date.now() + 864e6) }),
  climbsLoader: () => async () => null, announcementsLoader: () => async () => null, loadSettings: async () => null,
  loadSurveys: async () => null, loadOfficers: async () => null, loadCurrentOfficers: async () => null,
}));

describe('climb page for a registered member', () => {
  beforeEach(() => setSignedInHint(true));

  it('says you are registered and swaps Register for My Climbs', async () => {
    mine.rows = [toMyClimb('r1', { climbId: 'c1', climbTitle: 'Mt. Pulag', status: 'confirmed', paymentStatus: 'verified' })];
    renderAt('/climbs/c1');
    expect(await screen.findByText('You’re registered', {}, { timeout: 5000 })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'View in My Climbs' })).toHaveAttribute('href', '/account/climbs');
    expect(screen.queryByRole('link', { name: /^Register/ })).not.toBeInTheDocument();
  });

  it('keeps Register when you are not registered, or only cancelled', async () => {
    mine.rows = [toMyClimb('r2', { climbId: 'c1', climbTitle: 'Mt. Pulag', status: 'cancelled' })];
    renderAt('/climbs/c1');
    expect(await screen.findByRole('link', { name: /^Register/ }, { timeout: 5000 })).toBeInTheDocument();
    expect(screen.queryByText('You’re registered')).not.toBeInTheDocument();
  });
});
