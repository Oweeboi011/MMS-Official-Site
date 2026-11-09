import { fireEvent, screen } from '@testing-library/react';
import { renderAt } from '../helpers';

const reg = vi.hoisted(() => ({ calls: [] as unknown[][], already: false }));
vi.mock('../../src/frontend/services/firebaseEnv', async (original) => ({ ...(await original<object>()), registrationEnabled: true }));
vi.mock('../../src/frontend/services/useAccount', () => ({ useAccount: () => ({ status: 'signedIn', account: { uid: 'u1', email: 'ana@x.com', role: 'member' } }) }));
vi.mock('../../src/frontend/services/registrations', () => ({
  hasRegistered: async () => reg.already,
  register: async (...args: unknown[]) => { reg.calls.push(args); return 'r1'; },
}));
vi.mock('../../src/frontend/services/publicData', () => ({
  publicReadsEnabled: true,
  climbLoader: async () => ({ id: 'c1', title: 'Mt. Pulag', status: 'open', location: 'Benguet', startDate: new Date(Date.now() + 864e6),
    fees: [{ label: 'Guide Fee', amount: '1500' }, { label: 'Guest Fee', amount: '450', optional: true, isGuestFee: true }] }),
  climbsLoader: () => async () => null, announcementsLoader: () => async () => null, loadSettings: async () => null,
  loadSurveys: async () => null, loadOfficers: async () => null, loadCurrentOfficers: async () => null,
}));

const type = (id: string, value: string) => fireEvent.change(document.getElementById(id)!, { target: { value } });

describe('climb registration (switch on)', () => {
  beforeEach(() => { reg.calls = []; reg.already = false; });

  it('blocks an incomplete form, then registers a guest with the guest fee', async () => {
    renderAt('/climbs/c1/register');
    fireEvent.click(await screen.findByRole('button', { name: 'Register' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/Please fix 8 item/);
    expect(screen.getByText('Total: ₱1,950')).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText('MMS member'));
    expect(screen.getByText('Total: ₱1,500')).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText(/Guest \(not an MMS member\)/));
    type('reg-fullName', 'Ana Cruz');
    type('reg-mobile', '0917');
    type('reg-ecName', 'Ben');
    type('reg-ecMobile', '0918');
    type('reg-ecRelationship', 'Brother');
    type('reg-sig', 'Ana Cruz');
    fireEvent.click(screen.getByLabelText(/voluntarily agree/));
    fireEvent.click(screen.getByLabelText(/agree to the Privacy Notice/));
    fireEvent.click(screen.getByRole('button', { name: 'Register' }));
    expect(await screen.findByRole('heading', { name: 'You’re registered.' })).toBeInTheDocument();
    expect(reg.calls).toHaveLength(1);
    const [climb, account, form] = reg.calls[0] as [{ id: string }, { email: string }, { memberType: string; fullName: string }];
    expect(climb.id).toBe('c1');
    expect(account.email).toBe('ana@x.com');
    expect(form).toMatchObject({ memberType: 'joiner', fullName: 'Ana Cruz' });
  });

  it('says so when already registered', async () => {
    reg.already = true;
    renderAt('/climbs/c1/register');
    expect(await screen.findByText('You’re already registered for this climb.')).toBeInTheDocument();
  });
});
