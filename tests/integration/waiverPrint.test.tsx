import { screen } from '@testing-library/react';
import { renderAt } from '../helpers';
import { toMyClimb } from '../../src/frontend/data/myClimbs';

vi.mock('../../src/frontend/services/useAccount', () => ({ useAccount: () => ({ status: 'signedIn', account: { uid: 'u1', email: 'ana@x.com', role: 'member' } }) }));
vi.mock('../../src/frontend/services/registrations', () => ({
  myRegistration: async (id: string) => (id === 'r1'
    ? toMyClimb('r1', { climbTitle: 'Mt. Pulag', climbDate: 'Nov 20–22', climbLocation: 'Benguet', waiverSigned: true, waiverSignedName: 'Ana Cruz', waiverSignedAt: { toMillis: () => Date.UTC(2026, 10, 9, 2) } })
    : null),
}));

describe('printable waiver', () => {
  it('shows the waiver for that climb with the typed signature', async () => {
    renderAt('/account/climbs/r1/waiver');
    expect(await screen.findByRole('heading', { level: 1, name: 'Waiver and Release of Liability' }, { timeout: 5000 })).toBeInTheDocument();
    expect(screen.getByText(/participation in Mt\. Pulag · Nov 20–22 · Benguet/)).toBeInTheDocument();
    expect(screen.getByText('Ana Cruz')).toBeInTheDocument();
    expect(screen.getByText(/November 9, 2026/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Print or save as PDF' })).toBeInTheDocument();
  });

  it('says when the registration is not found', async () => {
    renderAt('/account/climbs/nope/waiver');
    expect(await screen.findByText('Registration not found.')).toBeInTheDocument();
  });
});
