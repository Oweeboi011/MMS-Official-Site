import { Link } from 'react-router-dom';
import { asset } from '../lib/asset';
import { navLinks } from '../data/content';

export default function Nav() {
  return (
    <nav className="nav" aria-label="Primary navigation">
      <div className="shell nav-inner">
        <Link className="brand" to="/" aria-label="MMS home">
          <span className="brand-mark" aria-hidden="true">
            <img src={asset('/mms-logo.png')} alt="" />
          </span>
          <span className="brand-name">MMS<small>Established 1994</small></span>
        </Link>
        <div className="desktop-links">
          {navLinks.map((link) => (
            <Link key={link.href} to={link.href}>{link.label}</Link>
          ))}
          <Link className="nav-cta" to="/#join">Join MMS</Link>
        </div>
      </div>
    </nav>
  );
}
