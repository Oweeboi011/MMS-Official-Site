import { Link } from 'react-router-dom';
import { footerLinks, membershipEmail, motto, socials } from '../data/content';

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
          </div>
        </div>
        <div className="footer-links">
          {footerLinks.map((link) => <Link key={link.href} to={link.href}>{link.label}</Link>)}
        </div>
        <div className="footer-note">Prototype content and event details are illustrative. Photos via Wikimedia Commons — <Link to="/credits">photo credits</Link>.</div>
      </div>
    </footer>
  );
}
