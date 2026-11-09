import { Component, type ReactNode } from 'react';

// Lazy account/admin pages: a chunk that fails to download (often a new deploy) or a page that crashes.
export default class RouteErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error) {
    console.error('Page failed to load', error);
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <main className="section">
        <div className="shell">
          <p role="alert">This page couldn&apos;t load. Reload to try again; if it keeps failing, tell the site maintainer.</p>
          <button type="button" className="btn btn-primary" onClick={() => window.location.reload()}>Reload</button>
        </div>
      </main>
    );
  }
}
