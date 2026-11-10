import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { AdminReg } from '../../data/adminRegistrations';
import type { Account } from '../../services/auth';
import { useAccount } from '../../services/useAccount';
import RegistrationRow from './RegistrationRow';

interface Props { regs: AdminReg[]; admin: Account; run: (a: () => Promise<void>) => Promise<boolean>; busy: boolean; showClimb?: boolean }

const PAGE = 25;

export default function RegistrationTable({ regs, admin, run, busy, showClimb }: Props) {
  const [page, setPage] = useState(0);
  if (!regs.length) return <p>No registrations.</p>;
  const pages = Math.ceil(regs.length / PAGE);
  const at = Math.min(page, pages - 1);
  const shown = regs.slice(at * PAGE, (at + 1) * PAGE);
  return (
    <>
    <div className="admin-table">
      <table>
        <thead><tr><th scope="col">Registrant</th><th scope="col">Status</th><th scope="col">Payments</th><th scope="col">Documents · notes</th></tr></thead>
        <tbody>{shown.map((r) => <RegistrationRow key={r.id} reg={r} admin={admin} run={(a) => void run(a)} busy={busy} showClimb={showClimb} others={showClimb ? undefined : regs} />)}</tbody>
      </table>
    </div>
    {pages > 1 && (
      <p className="admin-pager" role="navigation" aria-label="Pages">
        <button type="button" className="chip" disabled={at === 0} onClick={() => setPage(at - 1)}>Previous</button>
        <span>{at * PAGE + 1}–{Math.min((at + 1) * PAGE, regs.length)} of {regs.length}</span>
        <button type="button" className="chip" disabled={at >= pages - 1} onClick={() => setPage(at + 1)}>Next</button>
      </p>
    )}
    </>
  );
}

// UI guard only: the rules let admins (and nobody else) read every registration.
export function AdminGate({ children }: { children: (admin: Account) => ReactNode }) {
  const state = useAccount();
  if (state.status === 'signedIn' && state.account.role === 'admin') return children(state.account);
  if (state.status === 'loading') return <p role="status">Checking your sign-in…</p>;
  return <p>Admins only. <Link to="/admin">Sign in on the admin page</Link>.</p>;
}
