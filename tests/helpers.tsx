import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../src/frontend/App';
import { preloadPages } from '../src/frontend/components/lazyPage';

// On-demand pages (sub-pages, search, credits) are fetched once up front so tests can render them synchronously.
await preloadPages();

export const renderAt = (path: string) => render(<MemoryRouter initialEntries={[path]}><App /></MemoryRouter>);
