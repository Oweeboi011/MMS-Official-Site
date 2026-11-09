import { fireEvent, screen } from '@testing-library/react';
import { renderAt } from '../helpers';
import { toAdminReg } from '../../src/frontend/data/adminRegistrations';

const svc = vi.hoisted(() => ({ role: 'admin', reviews: [] as unknown[][], statuses: [] as string[][] }));
vi.mock('../../src/frontend/services/useAccount', () => ({ useAccount: () => ({ status: 'signedIn', account: { uid: 'a1', email: 'tl@x.com', role: svc.role } }) }));
vi.mock('../../src/frontend/services/adminRegistrations', () => ({
  climbRegistrations: async () => [toAdminReg('r1', { name: 'Ana Cruz', email: 'ana@x.com', status: 'pending', memberType: 'joiner',
    payments: [{ amount: 800, status: 'submitted', proofs: [{ url: 'https://x/r.jpg', fileName: 'r.jpg' }] }], amountPaid: 800,
    feeBreakdown: [{ label: 'Guide', amount: '1500', selected: true }] })],
  reviewRegistrationPayment: async (reg: { id: string }, index: number, status: string) => { svc.reviews.push([reg.id, index, status]); },
  setRegistrationStatus: async (id: string, status: string) => { svc.statuses.push([id, status]); },
}));
vi.mock('../../src/frontend/services/publicData', () => ({
  publicReadsEnabled: true,
  climbLoader: async (id: string) => ({ id, title: 'Mt. Pulag', status: 'open', startDate: new Date(Date.now() + 864e6) }),
  climbsLoader: () => async () => null, announcementsLoader: () => async () => null, loadSettings: async () => null,
  loadSurveys: async () => null, loadOfficers: async () => null, loadCurrentOfficers: async () => null,
}));

describe('admin: one climb’s registrations', () => {
  beforeEach(() => Object.assign(svc, { role: 'admin', reviews: [], statuses: [] }));

  it('lists registrants, verifies a payment, changes status, offers the CSV', async () => {
    renderAt('/admin/climbs/c1');
    expect(await screen.findByText('Ana Cruz', {}, { timeout: 5000 })).toBeInTheDocument();
    expect(screen.getByText(/1 payment\(s\) to review/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'receipt 1' })).toHaveAttribute('href', 'https://x/r.jpg');
    fireEvent.click(screen.getByRole('button', { name: 'Verify' }));
    await vi.waitFor(() => expect(svc.reviews).toEqual([['r1', 0, 'verified']]));
    fireEvent.change(screen.getByLabelText('Status for Ana Cruz'), { target: { value: 'confirmed' } });
    await vi.waitFor(() => expect(svc.statuses).toEqual([['r1', 'confirmed']]));
    expect(screen.getByRole('button', { name: /Download CSV/ })).toBeEnabled();
  });

  it('shows nothing to non-admins', async () => {
    svc.role = 'member';
    renderAt('/admin/climbs/c1');
    expect(await screen.findByText(/Admins only/, {}, { timeout: 5000 })).toBeInTheDocument();
    expect(screen.queryByText('Ana Cruz')).not.toBeInTheDocument();
  });
});
