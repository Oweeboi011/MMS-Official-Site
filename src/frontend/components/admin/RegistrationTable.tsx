import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { AdminReg } from '../../data/adminRegistrations';
import type { Account } from '../../services/auth';
import { useAccount } from '../../services/useAccount';
import RegistrationRow from './RegistrationRow';

interface Props { regs: AdminReg[]; admin: Account; run: (a: () => Promise<void>) => Promise<boolean>; busy: boolean; showClimb?: boolean }

export default function RegistrationTable({ regs, admin, run, busy, showClimb }: Props) {
  if (!regs.length) return <p>No registrations.</p>;
  return (
    <div className="admin-table">
      <table>
        <thead><tr><th scope="col">Registrant</th><th scope="col">Status</th><th scope="col">Payments</th><th scope="col">Documents · notes</th></tr></thead>
        <tbody>{regs.map((r) => <RegistrationRow key={r.id} reg={r} admin={admin} run={(a) => void run(a)} busy={busy} showClimb={showClimb} />)}</tbody>
      </table>
    </div>
  );
}

// UI guard only: the rules let admins (and nobody else) read every registration.
export function AdminGate({ children }: { children: (admin: Account) => ReactNode }) {
  const state = useAccount();
  if (state.status === 'signedIn' && state.account.role === 'admin') return children(state.account);
  if (state.status === 'loading') return <p role="status">Checking your sign-in…</p>;
  return <p>Admins only. <Link to="/admin">Sign in on the admin page</Link>.</p>;
}
