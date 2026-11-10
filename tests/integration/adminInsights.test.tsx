import { screen } from '@testing-library/react';
import { renderAt } from '../helpers';
import { toAdminReg } from '../../src/frontend/data/adminRegistrations';

vi.mock('../../src/frontend/services/useAccount', () => ({ useAccount: () => ({ status: 'signedIn', account: { uid: 'a1', email: 'tl@x.com', role: 'admin', emailVerified: true } }) }));
vi.mock('../../src/frontend/services/insightData', () => ({
  loadInsightData: async () => ({
    users: 7,
    regs: [toAdminReg('r1', { climbId: 'c1', climbTitle: 'Mt. Pulag', name: 'Ana Cruz', status: 'pending', paymentStatus: 'unpaid', createdAt: { toMillis: () => Date.now() - 12 * 86400000 } })],
    climbs: [{ id: 'c1', title: 'Mt. Pulag', status: 'open', createdAt: 0, requires: {} }],
    failures: [], noticeTypes: ['payment_reminder', 'payment_reminder', 'status_update'],
  }),
}));
vi.mock('../../src/frontend/services/auditLog', () => ({ recentAudit: async () => [{ id: 'a', actorName: 'tl@x.com', action: 'payment verified', targetType: 'registration', targetId: 'r1', targetLabel: 'Ana Cruz', createdAt: 0 }] }));
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
    expect(screen.getByText('/activities/open-climbs')).toBeInTheDocument();
    expect(screen.getByText(/Loading chunk failed/)).toBeInTheDocument();
  });

  it('shows the registration, payment and attention figures from the old Insights', async () => {
    renderAt('/admin/insights');
    expect(await screen.findByText('Accounts', {}, { timeout: 5000 })).toBeInTheDocument();
    expect(screen.getByText('Registrations, last 8 weeks')).toBeInTheDocument();
    expect(screen.getByText('Payment status')).toBeInTheDocument();
    expect(screen.getByText('Required document compliance')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ana Cruz' })).toHaveAttribute('href', '/admin/climbs/c1');
    expect(screen.getByText('payment_reminder')).toBeInTheDocument();
    expect(await screen.findByText('payment verified')).toBeInTheDocument();
  });
});
