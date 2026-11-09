import { screen } from '@testing-library/react';
import { renderAt } from '../helpers';

vi.mock('../../src/frontend/services/useAccount', () => ({ useAccount: () => ({ status: 'signedIn', account: { uid: 'a1', email: 'tl@x.com', role: 'admin', emailVerified: true } }) }));
vi.mock('../../src/frontend/services/insights', () => ({
  INSIGHTS: [['getFunctionHealth', 'Functions (24 h)'], ['getEmailStats', 'Email (Brevo)']],
  callInsight: async (name: string) => {
    if (name === 'getEmailStats') throw new Error('Brevo not set up');
    return { configured: true, executionCount: 120, errorCount: 2 };
  },
  topPaths: async () => [['/activities/open-climbs', 40], ['/climbs/c1', 12]],
  recentErrors: async () => [{ id: 'e', type: 'client', source: 'route', message: 'Loading chunk failed', path: '/admin', at: 0 }],
}));

describe('admin: insights', () => {
  it('shows insight results, page views and errors, and says what is not available', async () => {
    renderAt('/admin/insights');
    expect(await screen.findByText('executionCount', {}, { timeout: 5000 })).toBeInTheDocument();
    expect(await screen.findByText('Not available: Brevo not set up')).toBeInTheDocument();
    expect(screen.getByText('/activities/open-climbs · 40')).toBeInTheDocument();
    expect(screen.getByText(/Loading chunk failed/)).toBeInTheDocument();
  });
});
