import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AccountTabs from '../../src/frontend/components/AccountTabs';

describe('AccountTabs', () => {
  it('links Profile, Activities and Open Climbs and marks the current one', () => {
    render(<MemoryRouter initialEntries={['/account/activities']}><AccountTabs /></MemoryRouter>);
    expect(screen.getByRole('link', { name: 'Profile' })).toHaveAttribute('href', '/account/details');
    expect(screen.getByRole('link', { name: 'Open Climbs' })).toHaveAttribute('href', '/account/climbs');
    expect(screen.getByRole('link', { name: 'Activities' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Profile' })).not.toHaveAttribute('aria-current');
  });
});
