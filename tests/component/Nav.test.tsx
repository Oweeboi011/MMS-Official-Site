import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Nav from '../../src/frontend/components/Nav';
import { previewNotice } from '../../src/frontend/data/content';
import { sitemap } from '../../src/frontend/data/sitemap';

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
});
