import { useEffect, useState, useSyncExternalStore } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { asset } from '../lib/asset';
import { openNotifications } from '../lib/notificationsModal';
import { readAdminHint, readSignedInHint, subscribeSignedInHint } from '../lib/signedInHint';
import { sectionPath, sitemap } from '../data/sitemap';
import { useSiteSettings } from '../services/useSiteData';

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
  return sitemap.find((s) => pathname === `/${s.slug}` || pathname.startsWith(`/${s.slug}/`))?.slug ?? '';
}

export default function Nav() {
  const active = useActiveSection();
  const { previewNotice } = useSiteSettings();
  const { pathname } = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const signedIn = useSyncExternalStore(subscribeSignedInHint, readSignedInHint, () => false);
  const isAdmin = useSyncExternalStore(subscribeSignedInHint, readAdminHint, () => false);

  // The nav is fixed; it turns solid once the page scrolls past the hero's top edge.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className={`nav${scrolled ? ' is-scrolled' : ''}`} aria-label="Primary navigation">
      {previewNotice && <p className="preview-banner" role="note">{previewNotice}</p>}
      <div className="shell nav-inner">
        <Link className="brand" to="/">
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
        <Link className="nav-search" to="/search" aria-label="Search the site" aria-current={pathname === '/search' ? 'page' : undefined}>Search</Link>
        {signedIn && <button type="button" className="nav-search nav-account nav-bell" aria-label="Notifications" onClick={openNotifications}><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.7 21a2 2 0 0 1-3.4 0" /></svg></button>}
        {isAdmin && <Link className="nav-search nav-account" to="/admin" aria-current={pathname.startsWith('/admin') ? 'page' : undefined}>Admin</Link>}
        <Link className="nav-search nav-account" to={signedIn ? '/account/climbs' : '/account/sign-in'} aria-current={pathname.startsWith('/account') ? 'page' : undefined}>{signedIn ? 'My account' : 'Sign in'}</Link>
      </div>
    </nav>
  );
}
