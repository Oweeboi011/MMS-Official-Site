import { screen } from '@testing-library/react';
import { renderAt } from '../helpers';

const who = vi.hoisted(() => ({ state: { status: 'signedOut' } as Record<string, unknown> }));
vi.mock('../../src/frontend/services/useAccount', () => ({ useAccount: () => who.state }));
vi.mock('../../src/frontend/services/sportfest', () => ({
  loadGames: async () => [
    { id: 'g1', name: 'Tug of war', category: 'Sports', date: 'May 9', status: 'completed', gameClass: 'B', maxPoints: 20, year: 2026 },
    { id: 'g2', name: 'Fire making', category: 'Skills', date: '', status: 'upcoming', gameClass: 'A', maxPoints: 10, year: 2026 },
  ],
  loadScores: async () => [
    { id: 's1', gameId: 'g1', tribe: 'Badjao', placement: 1, points: 20 },
    { id: 's2', gameId: 'g1', tribe: 'Aeta', placement: 2, points: 15 },
  ],
}));

describe('Sportfest scoreboard', () => {
  it('asks signed-out visitors to sign in and shows no scores', async () => {
    who.state = { status: 'signedOut' };
    renderAt('/activities/sportfest');
    expect(await screen.findByText(/for signed-in members/, {}, { timeout: 5000 })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Overall standings' })).not.toBeInTheDocument();
  });

  it('shows standings, results of played games and the scoring system to a signed-in member', async () => {
    who.state = { status: 'signedIn', account: { uid: 'u1', email: 'a@x.com', role: 'member', emailVerified: true } };
    renderAt('/activities/sportfest');
    expect(await screen.findByRole('heading', { name: 'Overall standings' }, { timeout: 5000 })).toBeInTheDocument();
    expect(screen.getByRole('row', { name: /Tug of war/ })).toBeInTheDocument();
    expect(screen.queryByRole('row', { name: /Fire making/ })).not.toBeInTheDocument(); // upcoming: no results yet
    expect(screen.getByText('Scoring system')).toBeInTheDocument();
    expect(screen.getAllByText(/20 pts/).length).toBeGreaterThan(0);
  });
});
