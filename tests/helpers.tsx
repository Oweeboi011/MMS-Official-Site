import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../src/App';

export const renderAt = (path: string) => render(<MemoryRouter initialEntries={[path]}><App /></MemoryRouter>);
