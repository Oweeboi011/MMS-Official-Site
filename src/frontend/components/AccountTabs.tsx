import { NavLink } from 'react-router-dom';
import { hasContentRights } from '../data/contentRights';
import { useAccount } from '../services/useAccount';

const TABS = [
  { to: '/account/details', label: 'Profile' },
  { to: '/account/activities', label: 'Activities' },
  { to: '/account/climbs', label: 'Open Climbs' },
];

// Shared by the three account pages so they read as one place.
export default function AccountTabs() {
  const state = useAccount();
  const content = state.status === 'signedIn' && hasContentRights({ role: state.account.role, groups: state.account.groups ?? [] });
  return (
    <nav className="account-tabs" aria-label="My account">
      {TABS.map((t) => <NavLink key={t.to} to={t.to} end>{t.label}</NavLink>)}
      {content && <NavLink to="/account/content" end>Page content</NavLink>}
    </nav>
  );
}
