import { act, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Nav from '../../src/frontend/components/Nav';
import { previewNotice } from '../../src/frontend/data/content';
import { sitemap } from '../../src/frontend/data/sitemap';
import { setSignedInHint } from '../../src/frontend/lib/signedInHint';

const renderNav = (path: string) => render(<MemoryRouter initialEntries={[path]}><Nav /></MemoryRouter>);

describe('Nav', () => {
  it('shows the preview banner while sample content is live', () => {
    renderNav('/');
    expect(screen.getByRole('note')).toHaveTextContent(previewNotice);
  });

  it('marks the current section on a subpage', () => {
    const [section] = sitemap;
    renderNav(`/${section.slug}/${section.pages[0].slug}`);
    expect(screen.getByRole('link', { name: section.label })).toHaveAttribute('aria-current', 'true');
    expect(screen.getByRole('link', { name: 'Home' })).not.toHaveAttribute('aria-current');
  });

  it('offers Sign in, then My account once the session hint says signed in', () => {
    setSignedInHint(false);
    renderNav('/');
    expect(screen.getByRole('link', { name: 'Sign in' })).toHaveAttribute('href', '/account/sign-in');
    act(() => setSignedInHint(true));
    expect(screen.getByRole('link', { name: 'My account' })).toHaveAttribute('href', '/account/climbs');
    act(() => setSignedInHint(false));
    expect(screen.getByRole('link', { name: 'Sign in' })).toBeInTheDocument();
  });

  it('shows an Admin link only when the session hint says admin', () => {
    setSignedInHint(true, 'member');
    renderNav('/');
    expect(screen.queryByRole('link', { name: 'Admin' })).not.toBeInTheDocument();
    act(() => setSignedInHint(true, 'admin'));
    expect(screen.getByRole('link', { name: 'Admin' })).toHaveAttribute('href', '/admin');
    act(() => setSignedInHint(false));
    expect(screen.queryByRole('link', { name: 'Admin' })).not.toBeInTheDocument();
  });
});
