import { screen } from '@testing-library/react';
import { renderAt } from '../helpers';

vi.mock('../../src/frontend/services/useAccount', () => ({ useAccount: () => ({ status: 'signedIn', account: { uid: 'a1', email: 'tl@x.com', role: 'admin', emailVerified: true } }) }));
vi.mock('../../src/frontend/services/auditLog', () => ({
  recentAudit: async () => [
    { id: 'e1', actorName: 'tl@x.com', action: 'payment verified', details: '₱800', targetType: 'registration', targetId: 'r1', targetLabel: 'Ana · Mt. Pulag', createdAt: Date.UTC(2026, 10, 9, 2) },
    { id: 'e2', actorName: 'tl@x.com', action: 'meetings / resources saved', details: '', targetType: 'climb', targetId: 'c1', targetLabel: '', createdAt: 0 },
  ],
}));

describe('admin: audit log', () => {
  it('lists admin actions newest first', async () => {
    renderAt('/admin/audit');
    expect(await screen.findByText('payment verified · ₱800', {}, { timeout: 5000 })).toBeInTheDocument();
    expect(screen.getByText('Ana · Mt. Pulag')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'climb' })).toHaveAttribute('href', '/admin/climbs/c1');
  });
});
