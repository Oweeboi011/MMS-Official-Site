import { screen } from '@testing-library/react';
import { renderAt } from '../helpers';

describe('help page', () => {
  it('covers browsing, accounts and FAQs, and hides registration topics while registration is off', async () => {
    renderAt('/help');
    expect(await screen.findByRole('heading', { level: 1, name: 'How the site works' }, { timeout: 5000 })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Finding a climb' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Frequently asked questions' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Paying with GCash' })).not.toBeInTheDocument();
    expect(screen.getByText(/Registering and paying on this site open soon/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'help' })).toHaveAttribute('href', '/help');
  });

  it('has an officer guide', async () => {
    renderAt('/admin/help');
    expect(await screen.findByRole('heading', { level: 1, name: 'Officer guide' }, { timeout: 5000 })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Running registrations' })).toBeInTheDocument();
  });
});
