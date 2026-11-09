import { createElement, lazy, type ComponentType } from 'react';

// React.lazy, plus: once a page's code has loaded it renders directly (no Suspense flash), and preloadPages()
// can fetch them ahead of time (tests; idle prefetch later).
const preloaders: (() => Promise<void>)[] = [];

export function lazyPage<P extends object>(load: () => Promise<{ default: ComponentType<P> }>): ComponentType<P> {
  let loaded: ComponentType<P> | null = null;
  const remember = () => load().then((m) => { loaded = m.default; return m; });
  const Lazy = lazy(remember);
  preloaders.push(() => remember().then(() => undefined));
  return function Page(props: P) {
    return loaded ? createElement(loaded, props) : createElement(Lazy, props);
  };
}

export const preloadPages = () => Promise.all(preloaders.map((p) => p()));
