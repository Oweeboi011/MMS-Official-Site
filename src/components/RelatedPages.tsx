import { Link } from 'react-router-dom';
import { sectionPath, subpagePath, type SiteSection, type SiteSubpage } from '../data/sitemap';

interface Props {
  section: SiteSection;
  page: SiteSubpage;
}

// Bottom-of-page links to the other pages in the same section, shown on every subpage.
export default function RelatedPages({ section, page }: Props) {
  return (
    <aside className="section related" aria-label={`More in ${section.label}`}>
      <div className="shell">
        <div className="section-head">
          <div><div className="eyebrow" style={{ color: 'var(--red)' }}>More in {section.label}</div><h2>Keep exploring.</h2></div>
          <Link className="text-link" to={sectionPath(section)}>← Back to {section.label}</Link>
        </div>
        <div className="section-grid">
          {section.pages.filter((p) => p.slug !== page.slug).map((p) => (
            <Link className="program-card" key={p.slug} to={subpagePath(section, p)}>
              <h3>{p.label}</h3>
              <p>{p.summary}</p>
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
}
