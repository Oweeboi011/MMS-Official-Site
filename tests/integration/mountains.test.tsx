import { fireEvent, screen } from '@testing-library/react';
import { renderAt } from '../helpers';

describe('Mountains page', () => {
  it('pages the top 100 peaks 20 at a time', () => {
    renderAt('/explore/mountains');
    expect(screen.getByText('1–20 of 100')).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'Mt. Ragang (Piapayungan)' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '5' }));
    expect(screen.getByText('81–100 of 100')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /next page/i })).toBeDisabled();
  });
});
