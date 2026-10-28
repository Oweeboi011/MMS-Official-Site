import '@testing-library/jest-dom/vitest';

// jsdom does not implement scrolling; ScrollManager calls it on every route change.
window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
