import { Analytics } from '@vercel/analytics/react';
import { Route, Routes } from 'react-router-dom';
import Footer from './components/Footer';
import BottomNav from './components/BottomNav';
import ScrollManager from './components/ScrollManager';
import OpenClimbs from './components/OpenClimbs';
import HomePage from './pages/HomePage';
import ProgramPage from './pages/ProgramPage';
import AnnouncementsPage from './pages/AnnouncementsPage';
import SurveysPage from './pages/SurveysPage';
import CreditsPage from './pages/CreditsPage';
import { bmcPage, openClimbsPage, outreachPage, sartPage } from './data/pages';

export default function App() {
  return (
    <>
      <ScrollManager />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/open-climbs" element={<ProgramPage page={openClimbsPage}><OpenClimbs /></ProgramPage>} />
        <Route path="/bmc" element={<ProgramPage page={bmcPage} />} />
        <Route path="/outreach" element={<ProgramPage page={outreachPage} />} />
        <Route path="/sart" element={<ProgramPage page={sartPage} />} />
        <Route path="/announcements" element={<AnnouncementsPage />} />
        <Route path="/surveys" element={<SurveysPage />} />
        <Route path="/credits" element={<CreditsPage />} />
        <Route path="*" element={<HomePage />} />
      </Routes>
      <Footer />
      <BottomNav />
      {/* Vercel Analytics only works on Vercel deployments (served from the root). */}
      {import.meta.env.BASE_URL === '/' && <Analytics />}
    </>
  );
}
