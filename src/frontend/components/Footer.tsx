import { Link } from 'react-router-dom';
import { sectionPath, sitemap, subpagePath } from '../data/sitemap';
import { useSiteSettings } from '../services/useSiteData';

export default function Footer() {
  const { contactName, contactPhone, membershipEmail, motto, socials } = useSiteSettings();
  return (
    <footer>
      <div className="shell footer-grid">
        <div>
          <div className="footer-title">Metropolitan Mountaineering Society</div>
          {motto && <p className="motto">{motto}</p>}
          <p>A concept prototype for a modern Philippine mountaineering organization.</p>
          <div className="footer-contact">
            {contactPhone ? <a href={`tel:${contactPhone.replace(/\s/g, '')}`}>{[contactName, contactPhone].filter(Boolean).join(' · ')}</a> : contactName && <span>{contactName}</span>}
            {membershipEmail && <a href={`mailto:${membershipEmail}`}>{membershipEmail}</a>}
            {socials.map((s) => (
              <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer">{s.label}</a>
            ))}
            <Link to="/surveys">Surveys</Link>
          </div>
        </div>
        <div className="footer-sitemap">
          {sitemap.map((section) => (
            <div key={section.slug}>
              <Link className="footer-heading" to={sectionPath(section)}>{section.label}</Link>
              {section.pages.map((page) => (
                <Link key={page.slug} to={subpagePath(section, page)}>{page.label}</Link>
              ))}
            </div>
          ))}
        </div>
        <div className="footer-note">Prototype content and event details are illustrative. Photos via Wikimedia Commons, mountain data via Wikipedia — <Link to="/credits">credits</Link> · <Link to="/privacy">privacy notice</Link>.</div>
      </div>
    </footer>
  );
}
