import { Link } from 'react-router-dom';
import Announcements from '../components/Announcements';
import PageHero from '../components/PageHero';

export default function AnnouncementsPage() {
  return (
    <>
      <PageHero
        eyebrow="Club news"
        title="Announcements"
        intro="Updates on climbs, training, outreach, and SART. Check here before every climb."
        image="/images/page-announcements.webp"
      />
      <main>
        <Announcements />
        <section className="cta">
          <div className="shell">
            <div className="eyebrow">Have your say</div>
            <h2>Help shape MMS.</h2>
            <p>Tell us about your climbs and what you want next. Every response helps us plan better.</p>
            <Link className="btn" to="/surveys">Take a survey</Link>
          </div>
        </section>
      </main>
    </>
  );
}
