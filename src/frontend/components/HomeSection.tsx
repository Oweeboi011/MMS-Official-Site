import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { asset } from '../lib/asset';
import { sectionPath, subpagePath, type SiteSection } from '../data/sitemap';
import GlossaryText from './GlossaryText';

interface Props {
  section: SiteSection;
  // Home shows the first few cards plus a link to the full section page.
  limit?: number;
  // Section pages show PageHero instead of the banner + intro.
  banner?: boolean;
}

// A top-level section on the home page (target of the top nav): one card per subpage.
export default function HomeSection({ section, limit, banner = true }: Props) {
  const pages = limit ? section.pages.slice(0, limit) : section.pages;
  return (
    <section className="section home-section" id={section.slug} style={{ '--accent': section.accent } as CSSProperties}>
      <div className="shell">
        {banner && (
          <>
            <div className="home-section-banner" style={{ backgroundImage: `url("${asset(section.image)}")` }}>
              <div>
                <div className="eyebrow">{section.label}</div>
                <h2>{section.heading}</h2>
              </div>
            </div>
            <p className="home-section-intro">{section.intro}</p>
          </>
        )}
        <div className="section-grid">
          {pages.map((page) => (
            <Link className="program-card" key={page.slug} to={subpagePath(section, page)}>
              <h3>{page.label}</h3>
              <p><GlossaryText text={page.summary} /></p>
              <span className="text-link">Learn more →</span>
            </Link>
          ))}
        </div>
        {pages.length < section.pages.length && (
          <Link className="text-link see-all" to={sectionPath(section)}>See all {section.pages.length} in {section.label} →</Link>
        )}
      </div>
    </section>
  );
}
