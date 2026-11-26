import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageHero from '../components/PageHero';

// Cloudflare serves the SPA shell with 200 for every path, so search engines get noindex instead of a 404 status.
function useNoIndex() {
  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex';
    document.head.append(meta);
    return () => meta.remove();
  }, []);
}

export default function NotFoundPage() {
  useNoIndex();
  return (
    <>
      <PageHero compact eyebrow="404" title="Page not found" intro="That address doesn't match a page on this site. It may have moved, or the link may have a typo." image="/images/page-surveys.webp" />
      <main>
        <section className="section">
          <div className="shell">
            <p><Link className="btn btn-primary" to="/">Go to the home page</Link></p>
            <p>Or <Link to="/search">search the site</Link> for what you were looking for.</p>
          </div>
        </section>
      </main>
    </>
  );
}
