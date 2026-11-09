import { useState } from 'react';
import type { AdminReg } from '../../data/adminRegistrations';
import { splitPayment } from '../../services/adminRegistrations';

interface Props { payer: AdminReg; index: number; others: AdminReg[]; actor: string; run: (a: () => Promise<void>) => void; busy: boolean }

// #153: move part of this payment onto another registrant it also covered (one at a time).
export default function SplitForm({ payer, index, others, actor, run, busy }: Props) {
  const [open, setOpen] = useState(false);
  const [to, setTo] = useState('');
  const [amount, setAmount] = useState('');
  const candidates = others.filter((r) => r.id !== payer.id && r.status !== 'cancelled');
  if (!candidates.length) return null;
  if (!open) return <button type="button" className="chip" disabled={busy} onClick={() => setOpen(true)}>Split</button>;
  const target = candidates.find((r) => r.id === to);
  const n = Number(amount.replace(/[^0-9.]/g, ''));
  const ready = Boolean(target) && Number.isFinite(n) && n > 0;
  return (
    <span className="admin-refund">
      <label className="sr-only" htmlFor={`split-to-${payer.id}-${index}`}>Split to</label>
      <select id={`split-to-${payer.id}-${index}`} value={to} onChange={(e) => setTo(e.target.value)}>
        <option value="">Also paid for…</option>
        {candidates.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
      </select>
      <label className="sr-only" htmlFor={`split-amt-${payer.id}-${index}`}>Split amount</label>
      <input id={`split-amt-${payer.id}-${index}`} inputMode="decimal" placeholder="₱" value={amount} onChange={(e) => setAmount(e.target.value)} />
      <button type="button" className="chip" disabled={busy || !ready} onClick={() => {
        if (target) run(() => splitPayment(payer, index, [{ reg: target, amount: n }], actor));
        setOpen(false);
      }}>Move share</button>
    </span>
  );
}
