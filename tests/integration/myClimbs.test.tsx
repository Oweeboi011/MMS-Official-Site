import { fireEvent, screen } from '@testing-library/react';
import { renderAt } from '../helpers';
import { toMyClimb } from '../../src/frontend/data/myClimbs';

const svc = vi.hoisted(() => ({ cancelled: [] as string[][], rows: [] as unknown[], payments: [] as unknown[], docs: [] as unknown[][], details: [] as unknown[][], verified: true, resent: 0 }));
vi.mock('../../src/frontend/services/firebaseEnv', async (original) => ({ ...(await original<object>()), registrationEnabled: true }));
vi.mock('../../src/frontend/services/useAccount', () => ({ useAccount: () => ({ status: 'signedIn', account: { uid: 'u1', email: 'ana@x.com', role: 'member', emailVerified: svc.verified } }) }));
vi.mock('../../src/frontend/services/auth', async (original) => ({ ...(await original<object>()), resendVerification: async () => { svc.resent += 1; } }));
vi.mock('../../src/frontend/services/registrations', () => ({
  myRegistrations: async () => svc.rows,
  cancelRegistration: async (id: string, reason: string) => { svc.cancelled.push([id, reason]); },
  updateMyDetails: async (id: string, x: unknown) => { svc.details.push([id, x]); },
  setMyPledge: async (id: string, p: unknown) => { svc.details.push(['pledge', id, p]); },
}));
vi.mock('../../src/frontend/services/notifications', () => ({
  myNotifications: async () => [{ id: 'n1', title: 'Payment verified', message: '₱800 for Mt. Pulag', link: '/climbs/soon', read: false, createdAt: 0 },
    { id: 'n2', title: 'Registration received', message: '', link: '/account/climbs', read: true, createdAt: 0 }],
  markRead: async (ids: string[]) => { svc.details.push(['read', ids]); },
}));
vi.mock('../../src/frontend/services/uploads', () => ({
  submitPayment: async (p: unknown) => { svc.payments.push(p); },
  submitDocument: async (...args: unknown[]) => { svc.docs.push(args); },
}));
vi.mock('../../src/frontend/services/publicData', () => ({
  publicReadsEnabled: true,
  climbLoader: async (id: string) => ({ id, title: id, status: 'open', startDate: new Date(Date.now() + (id === 'past' ? -864e6 : 864e6)),
    gcashName: 'MMS Treasury', gcashNumber: '0917 000 0000', requiresMedicalCert: id === 'soon', donationDrive: { enabled: id === 'soon', beneficiary: 'Sitio School', suggestedItems: 'Notebooks' } }),
  climbsLoader: () => async () => null, announcementsLoader: () => async () => null, loadSettings: async () => null,
  loadSurveys: async () => null, loadOfficers: async () => null, loadCurrentOfficers: async () => null,
}));

const receipt = new File(['x'], 'receipt.jpg', { type: 'image/jpeg' });

describe('My Climbs (switch on)', () => {
  beforeEach(() => {
    Object.assign(svc, { cancelled: [], payments: [], docs: [], details: [], verified: true, resent: 0 });
    svc.rows = [
      toMyClimb('r1', { climbId: 'soon', climbTitle: 'Mt. Pulag', status: 'pending', mobile: '0917', emergencyContact: { name: 'Ben', mobile: '0918', relationship: 'Brother' }, paymentStatus: 'unpaid', amountPaid: 200, feeBreakdown: [{ label: 'Guide', amount: '1500', selected: true }] }),
      toMyClimb('r2', { climbId: 'past', climbTitle: 'Mt. Apo', status: 'confirmed', paymentStatus: 'verified', amountPaid: 900, feeBreakdown: [{ label: 'Guide', amount: '900', selected: true }] }),
    ];
  });

  it('shows balances and cancels only climbs not yet over', async () => {
    renderAt('/account/climbs');
    expect(await screen.findByRole('link', { name: 'Mt. Pulag' }, { timeout: 5000 })).toHaveAttribute('href', '/climbs/soon');
    expect(screen.getByText(/Balance ₱1,300/)).toBeInTheDocument();
    expect(screen.getByText(/Balance ₱0/)).toBeInTheDocument();
    const buttons = await screen.findAllByRole('button', { name: 'Cancel registration' });
    expect(buttons).toHaveLength(1); // Mt. Apo is over
    fireEvent.click(buttons[0]);
    expect(screen.getByText(/draft, pending officer approval/)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Reason (optional)'), { target: { value: 'Sick' } });
    fireEvent.click(screen.getByRole('button', { name: 'Yes, cancel' }));
    await vi.waitFor(() => expect(svc.cancelled).toEqual([['r1', 'Sick']]));
  });

  it('sends a payment with its receipt, only where a balance is due', async () => {
    renderAt('/account/climbs');
    expect(await screen.findByText('MMS Treasury', {}, { timeout: 5000 })).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Send payment' })).toHaveLength(1); // Mt. Apo is paid
    fireEvent.click(screen.getByRole('button', { name: 'Send payment' }));
    expect(await screen.findByText('Enter the amount you paid, in pesos.')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Amount paid (₱)'), { target: { value: '1,300' } });
    fireEvent.change(screen.getByLabelText(/^Receipt/), { target: { files: [receipt] } });
    fireEvent.click(screen.getByRole('button', { name: 'Send payment' }));
    await vi.waitFor(() => expect(svc.payments).toHaveLength(1));
    expect(svc.payments[0]).toMatchObject({ registrationId: 'r1', climbId: 'soon', uid: 'u1', amount: 1300, previousPaid: 200, files: [receipt] });
  });

  it('uploads a required document', async () => {
    renderAt('/account/climbs');
    fireEvent.change(await screen.findByLabelText('Upload Medical certificate', {}, { timeout: 5000 }), { target: { files: [receipt] } });
    await vi.waitFor(() => expect(svc.docs).toEqual([['r1', 'soon', 'u1', 'medical-cert-uploads', 'medicalCertUpload', receipt]]));
  });

  it('edits details after registering', async () => {
    renderAt('/account/climbs');
    fireEvent.click((await screen.findAllByRole('button', { name: 'Edit my details' }, { timeout: 5000 }))[0]); // Mt. Pulag
    expect(screen.getByLabelText('Emergency contact name')).toHaveValue('Ben');
    fireEvent.change(screen.getByLabelText('Emergency contact mobile'), { target: { value: '0999' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save details' }));
    await vi.waitFor(() => expect(svc.details).toEqual([['r1', { mobile: '0917', ecName: 'Ben', ecMobile: '0999', ecRelationship: 'Brother', medicalConditions: '' }]]));
  });

  it('asks unverified email accounts to verify, and resends the link', async () => {
    svc.verified = false;
    renderAt('/account/climbs');
    expect(await screen.findByText(/Please verify ana@x.com/, {}, { timeout: 5000 })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Resend the link' }));
    expect(await screen.findByText(/Sent\. Check your inbox/)).toBeInTheDocument();
    expect(svc.resent).toBe(1);
  });

  it('lists notifications and marks them read', async () => {
    renderAt('/account/climbs');
    expect(await screen.findByText('Notifications (1 new)', {}, { timeout: 5000 })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Payment verified' })).toHaveAttribute('href', '/climbs/soon');
    fireEvent.click(screen.getByRole('button', { name: 'Mark all read' }));
    await vi.waitFor(() => expect(svc.details).toContainEqual(['read', ['n1']]));
  });

  it('pledges a donation to the climb’s drive', async () => {
    renderAt('/account/climbs');
    fireEvent.click(await screen.findByRole('button', { name: 'Pledge a donation' }, { timeout: 5000 }));
    expect(screen.getByText('Needed: Notebooks')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Cash (₱, optional)'), { target: { value: '300' } });
    fireEvent.change(screen.getByLabelText('Items I’ll bring (optional)'), { target: { value: '5 notebooks' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save pledge' }));
    await vi.waitFor(() => expect(svc.details).toEqual([['pledge', 'r1', { cashPledge: 300, inKind: '5 notebooks', payWithFees: true }]]));
  });
});
