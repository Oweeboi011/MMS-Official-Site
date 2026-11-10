import { fireEvent, screen } from '@testing-library/react';
import { renderAt } from '../helpers';
import { toAdminReg } from '../../src/frontend/data/adminRegistrations';

const svc = vi.hoisted(() => ({ role: 'admin', reviews: [] as unknown[][], statuses: [] as string[][], notes: [] as string[][], walkIns: [] as unknown[][] }));
const ana = () => toAdminReg('r1', { name: 'Ana Cruz', email: 'ana@x.com', status: 'pending', memberType: 'joiner', climbId: 'c1', climbTitle: 'Mt. Pulag',
  payments: [{ amount: 800, status: 'submitted', proofs: [{ url: 'https://x/r.jpg', fileName: 'r.jpg' }] }], amountPaid: 800,
  feeBreakdown: [{ label: 'Guide', amount: '1500', selected: true }] });
const ben = () => toAdminReg('r2', { name: 'Ben Reyes', email: 'ben@x.com', status: 'confirmed', climbId: 'c2', climbTitle: 'Mt. Apo' });
vi.mock('../../src/frontend/services/useAccount', () => ({ useAccount: () => ({ status: 'signedIn', account: { uid: 'a1', email: 'tl@x.com', role: svc.role } }) }));
vi.mock('../../src/frontend/services/adminRegistrations', () => ({
  climbRegistrations: async () => [ana(), toAdminReg('r3', { name: 'Ben Reyes', status: 'pending', climbId: 'c1', climbTitle: 'Mt. Pulag' })],
  recentRegistrations: async () => [ana(), ben()],
  reviewRegistrationPayment: async (reg: { id: string }, index: number, status: string) => { svc.reviews.push([reg.id, index, status]); },
  setRegistrationStatus: async (id: string, status: string) => { svc.statuses.push([id, status]); },
  setAdminNotes: async (id: string, notes: string) => { svc.notes.push([id, notes]); },
  addWalkIn: async (...args: unknown[]) => { svc.walkIns.push(args); },
  recordRefund: async (reg: { id: string }, amount: number, note: string) => { svc.notes.push(['refund', reg.id, String(amount), note]); },
  setNoShow: async (reg: { id: string }, v: boolean) => { svc.notes.push(['noshow', reg.id, String(v)]); },
  loadExpenses: async () => [{ label: 'Permit', amount: 300 }],
  splitPayment: async (payer: { id: string }, _index: number, shares: { reg: { id: string }; amount: number }[]) => { svc.notes.push(['split', payer.id, shares[0].reg.id, String(shares[0].amount)]); },
  saveExpenses: async (id: string, items: unknown[]) => { svc.notes.push(['expenses', id, JSON.stringify(items)]); },
}));
vi.mock('../../src/frontend/services/publicData', () => ({
  publicReadsEnabled: true,
  climbLoader: async (id: string) => ({ id, title: 'Mt. Pulag', status: 'open', location: 'Benguet', startDate: new Date(Date.now() + 864e6) }),
  climbsLoader: () => async () => null, announcementsLoader: () => async () => null, loadSettings: async () => null,
  loadSurveys: async () => null, loadOfficers: async () => null, loadCurrentOfficers: async () => null,
}));

const wait = { timeout: 5000 };

describe('admin: registrations', () => {
  beforeEach(() => Object.assign(svc, { role: 'admin', reviews: [], statuses: [], notes: [], walkIns: [] }));

  it('lists a climb’s registrants, verifies a payment, changes status, saves notes', async () => {
    renderAt('/admin/climbs/c1');
    expect((await screen.findAllByText('Ana Cruz', {}, wait))[0]).toBeInTheDocument(); // also listed under balances due
    expect(screen.getByText('To review').closest('li')).toHaveTextContent('1');
    expect(screen.getByRole('link', { name: 'receipt 1' })).toHaveAttribute('href', 'https://x/r.jpg');
    fireEvent.click(screen.getByRole('button', { name: 'Verify' }));
    await vi.waitFor(() => expect(svc.reviews).toEqual([['r1', 0, 'verified']]));
    await vi.waitFor(() => expect(screen.getByLabelText('Status for Ana Cruz')).toBeEnabled());
    fireEvent.change(screen.getByLabelText('Status for Ana Cruz'), { target: { value: 'confirmed' } });
    await vi.waitFor(() => expect(svc.statuses).toEqual([['r1', 'confirmed']]));
    await vi.waitFor(() => expect(screen.getByLabelText('Status for Ana Cruz')).toBeEnabled()); // reload done
    fireEvent.change(screen.getByLabelText('Notes on Ana Cruz'), { target: { value: 'Paid cash balance' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save notes' }));
    await vi.waitFor(() => expect(svc.notes).toEqual([['r1', 'Paid cash balance']]));
    expect(screen.getByRole('button', { name: /Download CSV/ })).toBeEnabled();
  });

  it('adds a walk-in with cash received', async () => {
    renderAt('/admin/climbs/c1');
    fireEvent.click(await screen.findByRole('button', { name: 'Add walk-in' }, wait));
    fireEvent.click(screen.getByRole('button', { name: 'Add' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Enter the participant’s name.');
    fireEvent.change(screen.getByLabelText('Name *'), { target: { value: 'Carlo' } });
    fireEvent.change(screen.getByLabelText('Cash received (₱, optional)'), { target: { value: '1500' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add' }));
    await vi.waitFor(() => expect(svc.walkIns).toHaveLength(1));
    const [climb, walkIn, recorder] = svc.walkIns[0] as [{ id: string; title: string }, { name: string; cash: string }, string];
    expect(climb).toMatchObject({ id: 'c1', title: 'Mt. Pulag' });
    expect(walkIn).toMatchObject({ name: 'Carlo', cash: '1500' });
    expect(recorder).toBe('tl@x.com');
  });

  it('searches and filters all registrations', async () => {
    renderAt('/admin/registrations');
    expect(await screen.findByText('Ben Reyes', {}, wait)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Search name, email, mobile or climb'), { target: { value: 'pulag' } });
    expect(screen.queryByText('Ben Reyes')).not.toBeInTheDocument();
    expect(screen.getAllByText('Ana Cruz')[0]).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Search name, email, mobile or climb'), { target: { value: '' } });
    fireEvent.change(screen.getByLabelText('Status'), { target: { value: 'confirmed' } });
    expect(screen.queryAllByText('Ana Cruz')).toHaveLength(0);
    expect(screen.getByRole('button', { name: 'Download CSV (1)' })).toBeEnabled();
  });

  it('shows nothing to non-admins', async () => {
    svc.role = 'member';
    renderAt('/admin/climbs/c1');
    expect(await screen.findByText(/Admins only/, {}, wait)).toBeInTheDocument();
    expect(screen.queryAllByText('Ana Cruz')).toHaveLength(0);
  });

  it('records a refund, flags a no-show, and shows net funds after expenses', async () => {
    renderAt('/admin/climbs/c1');
    fireEvent.click((await screen.findAllByRole('button', { name: 'Record refund' }, wait))[0]);
    fireEvent.change(screen.getByLabelText('Refund amount for Ana Cruz'), { target: { value: '200' } });
    fireEvent.change(screen.getByLabelText('Refund note for Ana Cruz'), { target: { value: 'GCash 123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save refund' }));
    await vi.waitFor(() => expect(svc.notes).toContainEqual(['refund', 'r1', '200', 'GCash 123']));
    expect(await screen.findByText(/Expenses and net funds/)).toBeInTheDocument();
    expect(screen.getByText(/− expenses ₱300 =/)).toBeInTheDocument();
  });

  it('splits a payment onto another registrant', async () => {
    renderAt('/admin/climbs/c1');
    fireEvent.click((await screen.findAllByRole('button', { name: 'Split' }, wait))[0]);
    fireEvent.change(screen.getByLabelText('Split to'), { target: { value: 'r3' } });
    fireEvent.change(screen.getByLabelText('Split amount'), { target: { value: '400' } });
    fireEvent.click(screen.getByRole('button', { name: 'Move share' }));
    await vi.waitFor(() => expect(svc.notes).toContainEqual(['split', 'r1', 'r3', '400']));
  });
});
