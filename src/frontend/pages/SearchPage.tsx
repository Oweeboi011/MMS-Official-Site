import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import PageHero from '../components/PageHero';
import { searchIndex } from '../data/searchIndex';
import { liveSearchDocs } from '../data/liveSearch';
import { prepare, searchDocs } from '../lib/search';
import { useAnnouncements, useClimbSchedule } from '../services/useSiteData';

const countLabel = (shown: number, total: number) => {
  if (!total) return 'No results. Try another word.';
  if (shown < total) return `Showing the top ${shown} of ${total} results.`;
  return total === 1 ? '1 result' : `${total} results`;
};

// L9: search every page in the browser; the query lives in ?q= so results can be shared.
export default function SearchPage() {
  const [params, setParams] = useSearchParams();
  const query = params.get('q') ?? '';
  const announcements = useAnnouncements();
  const { upcoming, completed } = useClimbSchedule(null);
  const index = useMemo(() => prepare([...searchIndex, ...liveSearchDocs(announcements, [...upcoming, ...completed], searchIndex)]), [announcements, upcoming, completed]);
  const { hits, total } = useMemo(() => searchDocs(index, query), [index, query]);

  return (
    <>
      <PageHero compact eyebrow="Search" title="Find a page" intro="Search climbs, courses, programs, news, and MMS terms." image="/images/page-surveys.webp" />
      <main>
        <section className="section">
          <div className="shell">
            <form role="search" className="search-form" onSubmit={(e) => e.preventDefault()}>
              <label htmlFor="site-search">Search the site</label>
              <input
                id="site-search"
                type="search"
                value={query}
                placeholder="e.g. BMC, Pulag, SART"
                // keepScroll: ScrollManager must not jump to the top on every keystroke.
                onChange={(e) => setParams(e.target.value ? { q: e.target.value } : {}, { replace: true, state: { keepScroll: true } })}
              />
            </form>
            {query && <p className="search-count" aria-live="polite">{countLabel(hits.length, total)}</p>}
            <ul className="search-results">
              {hits.map(({ doc, snippet }) => (
                <li key={doc.path}>
                  <span className="search-section">{doc.section}</span>
                  <Link to={doc.path}>{doc.title}</Link>
                  <p>{snippet}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>
    </>
  );
}
