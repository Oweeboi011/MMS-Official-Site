import { render } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import ParamRedirect from '../../src/frontend/components/ParamRedirect';

const Here = () => <p>at {useLocation().pathname}</p>;

describe('ParamRedirect', () => {
  it('sends old email links to the new route, keeping the id', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/waiver/reg 1']}>
        <Routes>
          <Route path="/waiver/:regId" element={<ParamRedirect to="/account/climbs/:regId/waiver" />} />
          <Route path="*" element={<Here />} />
        </Routes>
      </MemoryRouter>,
    );
    expect(container).toHaveTextContent('at /account/climbs/reg%201/waiver');
  });
});
