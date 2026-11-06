import '@testing-library/jest-dom/vitest';

// jsdom does not implement scrolling; ScrollManager calls it on every route change. Node-env tests (functions) have no window.
if (typeof window !== 'undefined') window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
