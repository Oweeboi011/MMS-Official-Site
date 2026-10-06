import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { asset } from '../lib/asset';
import { subpagePath, type SiteSection } from '../data/sitemap';

interface Props {
  section: SiteSection;
}

// A top-level section on the home page (target of the top nav): one card per subpage.
export default function HomeSection({ section }: Props) {
  return (
    <section className="section home-section" id={section.slug} style={{ '--accent': section.accent } as CSSProperties}>
      <div className="shell">
        <div className="home-section-banner" style={{ backgroundImage: `url("${asset(section.image)}")` }}>
          <div>
            <div className="eyebrow">{section.label}</div>
            <h2>{section.heading}</h2>
          </div>
        </div>
        <p className="home-section-intro">{section.intro}</p>
        <div className="section-grid">
          {section.pages.map((page) => (
            <Link className="program-card" key={page.slug} to={subpagePath(section, page)}>
              <h3>{page.label}</h3>
              <p>{page.summary}</p>
              <span className="text-link">Learn more →</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
