import { screen } from '@testing-library/react';
import { renderAt } from '../helpers';

describe('open climbs with no real climbs yet', () => {
  it('says the rows are samples instead of showing dead links', async () => {
    renderAt('/activities/open-climbs');
    expect(await screen.findByText(/These are sample entries/, {}, { timeout: 5000 })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Mt. Pulag' })).not.toBeInTheDocument();
  });
});
