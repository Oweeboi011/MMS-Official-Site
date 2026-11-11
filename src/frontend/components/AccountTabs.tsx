import { NavLink } from 'react-router-dom';

const TABS = [
  { to: '/account/details', label: 'Profile' },
  { to: '/account/activities', label: 'Activities' },
  { to: '/account/climbs', label: 'Open Climbs' },
];

// Shared by the three account pages so they read as one place.
export default function AccountTabs() {
  return (
    <nav className="account-tabs" aria-label="My account">
      {TABS.map((t) => <NavLink key={t.to} to={t.to} end>{t.label}</NavLink>)}
    </nav>
  );
}
