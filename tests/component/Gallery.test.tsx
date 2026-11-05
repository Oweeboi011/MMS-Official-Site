import { render, screen } from '@testing-library/react';
import Gallery from '../../src/frontend/components/Gallery';

vi.mock('../../src/frontend/data/content', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../src/frontend/data/content')>()),
  photoAlbumsUrl: 'https://drive.google.com/drive/folders/abc',
}));

describe('Gallery', () => {
  it('shows the all-albums link when photoAlbumsUrl is set', () => {
    render(<Gallery />);
    const link = screen.getByRole('link', { name: /view all albums/i });
    expect(link).toHaveAttribute('href', 'https://drive.google.com/drive/folders/abc');
    expect(link).toHaveAttribute('target', '_blank');
  });
});
