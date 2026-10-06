import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { asset } from '../lib/asset';
import { sectionPath, sitemap } from '../data/sitemap';

// Which top-nav item is current: the section under the viewport on the home page, else the subpage's section.
function useActiveSection() {
  const { pathname } = useLocation();
  const [spied, setSpied] = useState('home');

  useEffect(() => {
    if (pathname !== '/' || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setSpied(e.target.id)),
      { rootMargin: '-45% 0px -50% 0px' },
    );
    ['home', ...sitemap.map((s) => s.slug)].forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [pathname]);

  if (pathname === '/') return spied;
  return sitemap.find((s) => pathname.startsWith(`/${s.slug}/`))?.slug ?? '';
}

export default function Nav() {
  const active = useActiveSection();
  const [scrolled, setScrolled] = useState(false);

  // The nav is fixed; it turns solid once the page scrolls past the hero's top edge.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className={`nav${scrolled ? ' is-scrolled' : ''}`} aria-label="Primary navigation">
      <div className="shell nav-inner">
        <Link className="brand" to="/" aria-label="MMS home">
          <span className="brand-mark" aria-hidden="true">
            <img src={asset('/mms-logo.png')} alt="" />
          </span>
          <span className="brand-name">MMS<small>Established 1994</small></span>
        </Link>
        <ul className="desktop-links">
          <li><Link to="/" aria-current={active === 'home' ? 'true' : undefined}>Home</Link></li>
          {sitemap.map((section) => (
            <li key={section.slug}>
              <Link to={sectionPath(section)} aria-current={active === section.slug ? 'true' : undefined}>{section.label}</Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
