import { Fragment, type ReactNode } from 'react';
import Hero from '../components/Hero';
import Ticker from '../components/Ticker';
import Intro from '../components/Intro';
import HomeSection from '../components/HomeSection';
import OpenClimbs from '../components/OpenClimbs';
import Announcements from '../components/Announcements';
import Faq from '../components/Faq';
import JoinCta from '../components/JoinCta';
import { sitemap } from '../data/sitemap';

// Live previews shown right after a section's cards.
const previews: Record<string, ReactNode> = {
  activities: <OpenClimbs limit={4} />,
  media: <Announcements limit={3} />,
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <Ticker />
      <main>
        <Intro />
        {sitemap.map((section) => (
          <Fragment key={section.slug}>
            <HomeSection section={section} />
            {previews[section.slug]}
          </Fragment>
        ))}
        <Faq />
        <JoinCta />
      </main>
    </>
  );
}
