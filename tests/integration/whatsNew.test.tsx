import { screen } from '@testing-library/react';
import { renderAt } from '../helpers';

vi.mock('../../src/frontend/services/useAccount', () => ({ useAccount: () => ({ status: 'signedIn', account: { uid: 'u1', email: 'a@x.com', role: 'member', emailVerified: true } }) }));
vi.mock('../../src/frontend/services/releaseNotes', () => ({
  publishedNotes: async () => [{ id: 'n1', title: 'Register on the new site', body: 'Big news.\n\n- Pay by **GCash**\n- My Climbs', publishedAt: 5 }],
}));

describe('what’s new', () => {
  it('lists published release notes with lists and bold', async () => {
    renderAt('/account/whats-new');
    expect(await screen.findByRole('heading', { name: 'Register on the new site' }, { timeout: 5000 })).toBeInTheDocument();
    expect(screen.getByText('GCash').tagName).toBe('STRONG');
    expect(screen.getByText('My Climbs', { selector: 'li' })).toBeInTheDocument();
  });
});
