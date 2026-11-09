import { screen } from '@testing-library/react';
import { renderAt } from '../helpers';

describe('privacy page', () => {
  it('shows the notice registrants agree to, linked from the footer', async () => {
    renderAt('/privacy');
    expect(await screen.findByRole('heading', { level: 1, name: 'Privacy Notice' }, { timeout: 5000 })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Your rights' })).toBeInTheDocument();
    expect(screen.getByText(/Version 2026-10-18/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'privacy notice' })).toHaveAttribute('href', '/privacy');
  });
});
