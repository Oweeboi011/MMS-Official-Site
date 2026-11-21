import { NavLink } from 'react-router-dom';
import { hasContentRights } from '../data/contentRights';
import { canUseTasks } from '../data/tasks';
import { useAccount } from '../services/useAccount';

const TABS = [
  { to: '/account/details', label: 'Profile' },
  { to: '/account/activities', label: 'Activities' },
  { to: '/account/climbs', label: 'Open Climbs' },
];

// Shared by the three account pages so they read as one place.
export default function AccountTabs() {
  const state = useAccount();
  const person = state.status === 'signedIn' ? { role: state.account.role, groups: state.account.groups ?? [] } : null;
  const content = person !== null && hasContentRights(person);
  const tasks = person !== null && canUseTasks(person);
  return (
    <nav className="account-tabs" aria-label="My account">
      {TABS.map((t) => <NavLink key={t.to} to={t.to} end>{t.label}</NavLink>)}
      {content && <NavLink to="/account/content" end>Page content</NavLink>}
      {tasks && <NavLink to="/account/tasks" end>Tasks</NavLink>}
    </nav>
  );
}
