import { Suspense, lazy, useEffect, type ReactNode } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Footer from './components/Footer';
import BottomNav from './components/BottomNav';
import Nav from './components/Nav';
import RouteErrorBoundary from './components/RouteErrorBoundary';
import { lazyPage, preloadPages } from './components/lazyPage';
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
import SectionPage from './pages/SectionPage';
import { programPages } from './data/pages';
import { legacyRedirects, sectionPath, sitemap, subpagePath } from './data/sitemap';

// Account + admin load Firebase; split out so public pages never download it.
const SignInPage = lazy(() => import('./pages/SignInPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
// Climb pages: own chunk (share + story image) so the first load stays in budget.
const ClimbPage = lazy(() => import('./pages/ClimbPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const MyClimbsPage = lazy(() => import('./pages/MyClimbsPage'));
const WaiverPrintPage = lazy(() => import('./pages/WaiverPrintPage'));
const AdminClimbPage = lazy(() => import('./pages/AdminClimbPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const GuidePage = lazy(() => import('./pages/GuidePage'));
const HelpPage = lazy(() => import('./pages/HelpPage'));
const WhatsNewPage = lazy(() => import('./pages/WhatsNewPage'));
const AdminRegistrationsPage = lazy(() => import('./pages/AdminRegistrationsPage'));
const loading = <main className="section"><div className="shell"><p>Loading…</p></div></main>;
// Sub-page text, the search index and photo credits are big and per-page: load them on demand (initialJs budget).
const SubPage = lazyPage(() => import('./pages/SubPage'));
const SearchPage = lazyPage(() => import('./pages/SearchPage'));
const CreditsPage = lazyPage(() => import('./pages/CreditsPage'));

// Subpages with their own full page layout.
const programExtras: Record<string, ReactNode> = {
  '/activities/open-climbs': <><ClimbFinder /><OpenClimbs /></>,
};
const fullPages: Record<string, ReactNode> = {
  ...Object.fromEntries(programPages.map((p) => [p.path, <ProgramPage key={p.path} page={p}>{programExtras[p.path]}</ProgramPage>])),
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

// After the first page settles, fetch the on-demand public pages so moving between them doesn't flash "Loading…".
function usePrefetchPages() {
  useEffect(() => {
    const run = () => { void preloadPages().catch(() => undefined); };
    if (typeof window.requestIdleCallback === 'function') { // Safari < 18 lacks it
      const id = window.requestIdleCallback(run, { timeout: 4000 });
      return () => window.cancelIdleCallback(id);
    }
    const timer = setTimeout(run, 2500);
    return () => clearTimeout(timer);
  }, []);
}

export default function App() {
  usePrefetchPages();
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
              : <Suspense fallback={loading}><SubPage section={section} page={page}>{pageBodies[path]}</SubPage></Suspense>;
            return <Route key={path} path={path} element={element} />;
          }),
        )}
        {Object.entries(legacyRedirects).map(([from, to]) => (
          <Route key={from} path={from} element={<Navigate to={to} replace />} />
        ))}
        <Route path="/surveys" element={<SurveysPage />} />
        <Route path="/search" element={<Suspense fallback={loading}><SearchPage /></Suspense>} />
        <Route path="/credits" element={<Suspense fallback={loading}><CreditsPage /></Suspense>} />
        <Route path="/activities/open-climbs/guide" element={<RouteErrorBoundary key="guide"><Suspense fallback={loading}><GuidePage /></Suspense></RouteErrorBoundary>} />
        <Route path="/account/whats-new" element={<RouteErrorBoundary key="whats-new"><Suspense fallback={loading}><WhatsNewPage /></Suspense></RouteErrorBoundary>} />
        <Route path="/help" element={<RouteErrorBoundary key="help"><Suspense fallback={loading}><HelpPage /></Suspense></RouteErrorBoundary>} />
        <Route path="/privacy" element={<RouteErrorBoundary key="privacy"><Suspense fallback={loading}><PrivacyPage /></Suspense></RouteErrorBoundary>} />
        <Route path="/account/sign-in" element={<RouteErrorBoundary key="sign-in"><Suspense fallback={loading}><SignInPage /></Suspense></RouteErrorBoundary>} />
        <Route path="/climbs/:id/register" element={<RouteErrorBoundary key="register"><Suspense fallback={loading}><RegisterPage /></Suspense></RouteErrorBoundary>} />
        <Route path="/climbs/:id" element={<RouteErrorBoundary key="climb"><Suspense fallback={loading}><ClimbPage /></Suspense></RouteErrorBoundary>} />
        <Route path="/account/climbs/:regId/waiver" element={<RouteErrorBoundary key="waiver"><Suspense fallback={loading}><WaiverPrintPage /></Suspense></RouteErrorBoundary>} />
        <Route path="/account/climbs" element={<RouteErrorBoundary key="my-climbs"><Suspense fallback={loading}><MyClimbsPage /></Suspense></RouteErrorBoundary>} />
        <Route path="/admin/registrations" element={<RouteErrorBoundary key="admin-regs"><Suspense fallback={loading}><AdminRegistrationsPage /></Suspense></RouteErrorBoundary>} />
        <Route path="/admin/climbs/:id" element={<RouteErrorBoundary key="admin-climb"><Suspense fallback={loading}><AdminClimbPage /></Suspense></RouteErrorBoundary>} />
        <Route path="/admin" element={<RouteErrorBoundary key="admin"><Suspense fallback={loading}><AdminPage /></Suspense></RouteErrorBoundary>} />
        <Route path="*" element={<HomePage />} />
      </Routes>
      <Footer />
      <BottomNav />
    </>
  );
}
