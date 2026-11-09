import { feeLines, feeTotal, type FeeItem } from '../../data/registration';
import type { SectionProps } from './RegisterFields';

const peso = (n: number) => `₱${n.toLocaleString('en-PH')}`;

// What you'll owe: required fees, the guest fee if you're a guest, and optional extras you tick.
export default function FeeBreakdown({ fees, form, set }: SectionProps & { fees: FeeItem[] }) {
  if (!fees.length) return null;
  const lines = feeLines(fees, form.memberType, form.extras);
  const { total, tba } = feeTotal(lines);
  return (
    <fieldset className="register-section">
      <legend>Fees</legend>
      <ul className="fee-lines">
        {fees.map((f, i) => {
          const line = lines[i];
          if (f.isGuestFee && !line.selected) return null; // members never see the guest fee
          return (
            <li key={f.label}>
              {f.optional && !f.isGuestFee
                ? <label><input type="checkbox" checked={line.selected} onChange={(e) => set('extras', { ...form.extras, [f.label]: e.target.checked })} /> {f.label}</label>
                : <span>{f.label}</span>}
              <span>{f.amount}</span>
              {f.note && <small>{f.note}</small>}
            </li>
          );
        })}
      </ul>
      <p className="fee-total"><strong>Total: {peso(total)}{tba ? ' + amounts still TBA' : ''}</strong></p>
      <p className="climb-muted">You can pay after registering. Payment details come with your confirmation.</p>
    </fieldset>
  );
}
