import type { ReactNode } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Footer from './components/Footer';
import BottomNav from './components/BottomNav';
import Nav from './components/Nav';
import ScrollManager from './components/ScrollManager';
import About from './components/About';
import Faq from './components/Faq';
import Gallery from './components/Gallery';
import Journey from './components/Journey';
import HowToJoin from './components/HowToJoin';
import JoinCta from './components/JoinCta';
import Mountains from './components/Mountains';
import OpenClimbs from './components/OpenClimbs';
import ClimbFinder from './components/ClimbFinder';
import Passport from './components/Passport';
import RelatedPages from './components/RelatedPages';
import Videos from './components/Videos';
import HomePage from './pages/HomePage';
import ProgramPage from './pages/ProgramPage';
import AnnouncementsPage from './pages/AnnouncementsPage';
import SurveysPage from './pages/SurveysPage';
import CreditsPage from './pages/CreditsPage';
import SubPage from './pages/SubPage';
import SectionPage from './pages/SectionPage';
import { bmcPage, openClimbsPage, outreachPage, sartPage } from './data/pages';
import { legacyRedirects, sectionPath, sitemap, subpagePath } from './data/sitemap';

// Subpages with their own full page layout.
const fullPages: Record<string, ReactNode> = {
  '/training/bmcm': <ProgramPage page={bmcPage} />,
  '/activities/open-climbs': <ProgramPage page={openClimbsPage}><ClimbFinder /><OpenClimbs /></ProgramPage>,
  '/community/outreach': <ProgramPage page={outreachPage} />,
  '/community/sart': <ProgramPage page={sartPage} />,
  '/media/news': <AnnouncementsPage />,
};

// Existing sections reused at the top of a subpage; sample content follows from data/subpages.ts.
const pageBodies: Record<string, ReactNode> = {
  '/about/our-story': <About />,
  '/about/mission': <Journey />,
  '/explore/mountains': <Mountains />,
  '/activities/upcoming': <OpenClimbs />,
  '/media/photos': <Gallery />,
  '/media/videos': <Videos />,
  '/membership/join': <><HowToJoin /><Faq /><JoinCta /></>,
  '/membership/login': <Passport />,
};

export default function App() {
  return (
    <>
      <ScrollManager />
      {/* Rendered at the root so the fixed nav sits above every page section. */}
      <Nav />
      <Routes>
        <Route path="/" element={<HomePage />} />
        {sitemap.map((section) => (
          <Route key={section.slug} path={sectionPath(section)} element={<SectionPage section={section} />} />
        ))}
        {sitemap.flatMap((section) =>
          section.pages.map((page) => {
            const path = subpagePath(section, page);
            const element = fullPages[path]
              ? <>{fullPages[path]}<RelatedPages section={section} page={page} /></>
              : <SubPage section={section} page={page}>{pageBodies[path]}</SubPage>;
            return <Route key={path} path={path} element={element} />;
          }),
        )}
        {Object.entries(legacyRedirects).map(([from, to]) => (
          <Route key={from} path={from} element={<Navigate to={to} replace />} />
        ))}
        <Route path="/surveys" element={<SurveysPage />} />
        <Route path="/credits" element={<CreditsPage />} />
        <Route path="*" element={<HomePage />} />
      </Routes>
      <Footer />
      <BottomNav />
    </>
  );
}
