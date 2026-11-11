import '@testing-library/jest-dom/vitest';

// jsdom does not implement scrolling; ScrollManager calls it on every route change. Node-env tests (functions) have no window.
if (typeof window !== 'undefined') window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;

// Lazy route chunks transform on first use; under a full parallel run that can pass the 1 s default for findBy*.
if (typeof window !== 'undefined') {
  const { configure } = await import('@testing-library/react');
  configure({ asyncUtilTimeout: 5000 });
}
