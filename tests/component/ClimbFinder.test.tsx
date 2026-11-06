import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ClimbFinder from '../../src/frontend/components/ClimbFinder';
import { climbFinder, openClimbs } from '../../src/frontend/data/content';
import { recommendClimbs } from '../../src/frontend/lib/recommend';

describe('ClimbFinder', () => {
  it('shows no picks until the joiner answers', () => {
    render(<MemoryRouter><ClimbFinder /></MemoryRouter>);
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('lists the recommended open climbs for first-timers and links to the survey', () => {
    render(<MemoryRouter><ClimbFinder /></MemoryRouter>);
    fireEvent.click(screen.getByLabelText('Never, first time'));
    const expected = recommendClimbs(openClimbs, climbFinder.options[0].difficulties).map((c) => c.title);
    const items = screen.queryAllByRole('listitem').map((li) => li.querySelector('strong')?.textContent);
    expect(items).toEqual(expected);
    expect(screen.getByRole('link', { name: /ask to join a climb/i })).toHaveAttribute('href', '/#join');
    expect(screen.getByRole('link', { name: 'tell us how it went' })).toHaveAttribute('href', '/surveys');
  });
});
