import type { CSSProperties, ReactNode } from 'react';
import ContentBlocks from '../components/ContentBlocks';
import PageHero from '../components/PageHero';
import RelatedPages from '../components/RelatedPages';
import { subpagePath, type SiteSection, type SiteSubpage } from '../data/sitemap';
import { subpageContent } from '../data/subpages';

interface Props {
  section: SiteSection;
  page: SiteSubpage;
  // Existing page sections shown before the page's sample content.
  children?: ReactNode;
}

export default function SubPage({ section, page, children }: Props) {
  const blocks = subpageContent[subpagePath(section, page)];
  return (
    <>
      <PageHero eyebrow={section.label} title={page.label} intro={page.summary} image={page.image ?? section.image} />
      <main style={{ '--accent': section.accent } as CSSProperties}>
        {children}
        {blocks && <ContentBlocks blocks={blocks} />}
        {!children && !blocks && (
          <section className="section page-section">
            <div className="shell">
              <div className="checklist coming-soon">
                <h2>Coming soon.</h2>
                <p>We are preparing the content for this page. In the meantime, browse the rest of {section.label} or send us a message.</p>
              </div>
            </div>
          </section>
        )}
      </main>
      <RelatedPages section={section} page={page} />
    </>
  );
}
