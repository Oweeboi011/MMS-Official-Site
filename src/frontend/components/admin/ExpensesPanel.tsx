import { useEffect, useState } from 'react';
import { expensesTotal, refundedTotal, type AdminReg, type Expense } from '../../data/adminRegistrations';
import { rowsFromForm, rowsToForm, type Column } from '../../data/records';
import { loadExpenses, saveExpenses } from '../../services/adminRegistrations';
import RecordsInput from '../RecordsInput';

const peso = (n: number) => `₱${n.toLocaleString('en-PH')}`;
const columns: Column[] = [{ key: 'label', label: 'Cost (permit, guide, van…)', required: true, max: 120 }, { key: 'amount', label: 'Amount (₱)', required: true, max: 12 }];

// #80 / #153: post-climb expenses and net funds = verified payments − refunds − expenses (admin-only climbExpenses).
export default function ExpensesPanel({ climbId, regs, run, busy }: { climbId: string; regs: AdminReg[]; run: (a: () => Promise<void>) => Promise<boolean>; busy: boolean }) {
  const [value, setValue] = useState<string | null>(null);
  const [saved, setSaved] = useState<Expense[]>([]);
  useEffect(() => {
    let live = true;
    loadExpenses(climbId).then((items) => {
      if (!live) return;
      setSaved(items);
      setValue(rowsToForm(items.map((i) => ({ label: i.label, amount: String(i.amount) }))));
    }, () => { if (live) setValue('[]'); });
    return () => { live = false; };
  }, [climbId]);
  if (value === null) return null;
  const collected = regs.reduce((t, r) => t + r.payments.filter((p) => p.status === 'verified').reduce((s, p) => s + p.amount, 0), 0);
  const refunds = regs.reduce((t, r) => t + refundedTotal(r), 0);
  const costs = expensesTotal(saved);
  const save = () => {
    const items = rowsFromForm(value).map((r) => ({ label: String(r.label ?? '').trim(), amount: Number(String(r.amount ?? '').replace(/[^0-9.]/g, '')) || 0 })).filter((i) => i.label && i.amount > 0);
    void run(async () => { await saveExpenses(climbId, items); setSaved(items); });
  };
  return (
    <details className="register-section">
      <summary><strong>Expenses and net funds</strong> · net {peso(collected - refunds - costs)}</summary>
      <p>Verified payments {peso(collected)} − refunds {peso(refunds)} − expenses {peso(costs)} = <strong>{peso(collected - refunds - costs)}</strong></p>
      <RecordsInput id="expenses" label="Expenses" columns={columns} value={value} disabled={busy} onChange={setValue} />
      <button type="button" className="btn btn-primary" disabled={busy} onClick={save}>Save expenses</button>
    </details>
  );
}
