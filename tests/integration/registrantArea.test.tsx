import { fireEvent, screen } from '@testing-library/react';
import { renderAt } from '../helpers';
import { toClimbPrivate } from '../../src/frontend/data/climbPrivate';

const svc = vi.hoisted(() => ({ registered: true, role: 'member', saved: [] as unknown[][] }));
vi.mock('../../src/frontend/services/firebaseEnv', async (original) => ({ ...(await original<object>()), registrationEnabled: true }));
vi.mock('../../src/frontend/services/useAccount', () => ({ useAccount: () => ({ status: 'signedIn', account: { uid: 'u1', email: 'a@x.com', role: svc.role, emailVerified: true } }) }));
vi.mock('../../src/frontend/services/weather', () => ({ useForecast: () => ({ status: 'note', days: [], message: '', coords: null }) }));
vi.mock('../../src/frontend/services/climbPrivate', () => ({
  loadClimbPrivate: async () => (svc.registered ? toClimbPrivate({
    preClimbMeetings: [{ date: '2026-11-18', time: '7 PM', location: 'Zoom', link: 'https://meet.example/x' }],
    resources: [{ label: 'Gear list', url: 'https://x/gear.pdf' }],
    participants: [{ name: 'Ana C.', memberType: 'joiner' }, { name: 'Ben R.', memberType: 'member' }],
  }) : null),
  loadClimbPrivateRaw: async () => ({ preClimbMeetings: [{ date: '2026-11-18', time: '7 PM' }], resources: [], participants: [{ name: 'X' }] }),
  saveClimbPrivate: async (...args: unknown[]) => { svc.saved.push(args); },
}));
vi.mock('../../src/frontend/services/adminRegistrations', () => ({ climbRegistrations: async () => [], loadExpenses: async () => [], saveExpenses: async () => undefined }));
vi.mock('../../src/frontend/services/publicData', () => ({
  publicReadsEnabled: true,
  climbLoader: async (id: string) => ({ id, title: 'Mt. Pulag', status: 'open', startDate: new Date(Date.now() + 864e6), officers: [{ role: 'Team Leader', name: 'Tess L.' }] }),
  climbsLoader: () => async () => null, announcementsLoader: () => async () => null, loadSettings: async () => null,
  loadSurveys: async () => null, loadOfficers: async () => null, loadCurrentOfficers: async () => null,
}));

const wait = { timeout: 5000 };

describe('registrants-only section', () => {
  beforeEach(() => Object.assign(svc, { registered: true, role: 'member', saved: [] }));

  it('shows meetings, resources and who is joining to registrants', async () => {
    renderAt('/climbs/c1');
    expect(await screen.findByRole('heading', { name: 'Pre-climb meeting' }, wait)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Join online' })).toHaveAttribute('href', 'https://meet.example/x');
    expect(screen.getByRole('link', { name: 'Gear list' })).toBeInTheDocument();
    expect(screen.getByText('Ben R.')).toBeInTheDocument();
    expect(screen.getByText('Ana C.')).toBeInTheDocument();
    expect(screen.getByText('Tess L. (Team Leader)')).toBeInTheDocument();
  });

  it('tells signed-in non-registrants what they will see', async () => {
    svc.registered = false;
    renderAt('/climbs/c1');
    expect(await screen.findByText(/show here once you’re registered/, {}, wait)).toBeInTheDocument();
    expect(screen.queryByText('Ben R.')).not.toBeInTheDocument();
  });

  it('lets admins edit meetings and resources without touching participants', async () => {
    svc.role = 'admin';
    renderAt('/admin/climbs/c1');
    fireEvent.click(await screen.findByText(/Pre-climb meetings and resources/, {}, wait));
    fireEvent.click(screen.getByRole('button', { name: 'Save meetings and resources' }));
    await vi.waitFor(() => expect(svc.saved).toHaveLength(1));
    expect(svc.saved[0]).toEqual(['c1', { preClimbMeetings: [{ date: '2026-11-18', time: '7 PM', location: '', link: '', notes: '' }], resources: [] }]);
  });
});
