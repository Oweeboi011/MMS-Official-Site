import { screen } from '@testing-library/react';
import { renderAt } from '../helpers';

describe('beginner guide', () => {
  it('explains the ratings and links to the schedule', async () => {
    renderAt('/activities/open-climbs/guide');
    expect(await screen.findByRole('heading', { level: 1, name: 'Your first open climb' }, { timeout: 5000 })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Difficulty levels' })).toBeInTheDocument();
    expect(screen.getByText(/1–2 Easy, 3–4 Moderate, 5–9 Advanced/)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Leave No Trace' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Find a climb' })).toHaveAttribute('href', '/activities/open-climbs');
  });

  it('is linked from the open climbs page', () => {
    renderAt('/activities/open-climbs');
    expect(screen.getByRole('link', { name: 'Read the beginner guide' })).toHaveAttribute('href', '/activities/open-climbs/guide');
  });
});
