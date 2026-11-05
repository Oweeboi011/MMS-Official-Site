import PageHero from '../components/PageHero';
import HomeSection from '../components/HomeSection';
import type { SiteSection } from '../data/sitemap';

// A section on its own page with every subpage card; home shows a short summary instead.
export default function SectionPage({ section }: { section: SiteSection }) {
  return (
    <>
      <PageHero eyebrow={section.label} title={section.heading} intro={section.intro} image={section.image} />
      <main>
        <HomeSection section={section} banner={false} />
      </main>
    </>
  );
}
