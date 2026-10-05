import { Link } from 'react-router-dom';

export default function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="Mobile navigation">
      <Link to="/">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m3 11 9-8 9 8v10h-6v-6H9v6H3Z" /></svg>
        <span>Home</span>
      </Link>
      <Link to="/#programs">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m3 20 6-11 4 6 2-3 6 8Z" /></svg>
        <span>Programs</span>
      </Link>
      <Link to="/open-climbs">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 3v3M18 3v3M4 8h16M5 5h14a1 1 0 0 1 1 1v14H4V6a1 1 0 0 1 1-1Z" /></svg>
        <span>Climbs</span>
      </Link>
      <Link to="/#join">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" /><path d="M9 10a3 3 0 1 0 6 0 3 3 0 0 0-6 0ZM7 18c1-2 2.5-3 5-3s4 1 5 3" /></svg>
        <span>Join</span>
      </Link>
    </nav>
  );
}
