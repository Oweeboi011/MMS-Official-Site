import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { sectionPath, sitemap, subpagePath } from '../data/sitemap';

export default function BottomNav() {
  const [open, setOpen] = useState(false);
  const { pathname, hash } = useLocation();
  const current = (match: boolean) => (match && !open ? 'page' : undefined);

  // Close the menu after navigating, and on Escape.
  useEffect(() => setOpen(false), [pathname, hash]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      {open && (
        <div className="menu-sheet" id="site-menu">
          <div className="menu-group">
            <Link className="menu-heading" to="/" onClick={() => setOpen(false)}>Home</Link>
          </div>
          {sitemap.map((section) => (
            <div className="menu-group" key={section.slug}>
              <Link className="menu-heading" aria-current={pathname.startsWith('/' + section.slug + '/') ? 'true' : undefined} to={sectionPath(section)} onClick={() => setOpen(false)}>{section.label}</Link>
              <div className="menu-links">
                {section.pages.map((page) => (
                  <Link key={page.slug} to={subpagePath(section, page)} aria-current={pathname === subpagePath(section, page) ? 'page' : undefined} onClick={() => setOpen(false)}>{page.label}</Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      <nav className="bottom-nav" aria-label="Mobile navigation">
        <Link to="/" aria-current={current(pathname === '/')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m3 11 9-8 9 8v10h-6v-6H9v6H3Z" /></svg>
          <span>Home</span>
        </Link>
        <Link to="/activities/upcoming" aria-current={current(pathname.startsWith('/activities/'))}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 3v3M18 3v3M4 8h16M5 5h14a1 1 0 0 1 1 1v14H4V6a1 1 0 0 1 1-1Z" /></svg>
          <span>Climbs</span>
        </Link>
        <Link to="/membership/join" aria-current={current(pathname.startsWith('/membership/'))}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" /><path d="M9 10a3 3 0 1 0 6 0 3 3 0 0 0-6 0ZM7 18c1-2 2.5-3 5-3s4 1 5 3" /></svg>
          <span>Join</span>
        </Link>
        <button type="button" aria-expanded={open} aria-controls="site-menu" onClick={() => setOpen((o) => !o)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
          <span>{open ? 'Close' : 'Menu'}</span>
        </button>
      </nav>
    </>
  );
}
