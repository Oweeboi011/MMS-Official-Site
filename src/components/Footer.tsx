import { Link } from 'react-router-dom';
import { membershipEmail, motto, socials } from '../data/content';
import { sectionPath, sitemap, subpagePath } from '../data/sitemap';

export default function Footer() {
  return (
    <footer>
      <div className="shell footer-grid">
        <div>
          <div className="footer-title">Metropolitan Mountaineering Society</div>
          <p className="motto">{motto}</p>
          <p>A concept prototype for a modern Philippine mountaineering organization.</p>
          <div className="footer-contact">
            <a href={`mailto:${membershipEmail}`}>{membershipEmail}</a>
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
        <div className="footer-note">Prototype content and event details are illustrative. Photos via Wikimedia Commons — <Link to="/credits">photo credits</Link>.</div>
      </div>
    </footer>
  );
}
