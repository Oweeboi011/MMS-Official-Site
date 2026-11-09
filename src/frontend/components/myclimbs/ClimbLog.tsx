import { Link } from 'react-router-dom';
import type { MyClimb } from '../../data/myClimbs';
import { useClimb } from '../../services/useClimb';

function Entry({ row }: { row: MyClimb }) {
  const climb = useClimb(row.climbId);
  if (!climb?.over) return null;
  return <li><Link to={`/climbs/${row.climbId}`}>{row.title}</Link> · {row.date}{climb.rating && ` · ${climb.rating}`}</li>;
}

// #95 / #62: your climb log, from your own confirmed registrations on climbs that are over (no extra data stored).
export default function ClimbLog({ rows }: { rows: MyClimb[] }) {
  const confirmed = rows.filter((r) => r.status === 'confirmed');
  if (!confirmed.length) return null;
  return (
    <details className="register-section climb-log">
      <summary><strong>Climb log</strong></summary>
      <ul>{confirmed.map((r) => <Entry key={r.id} row={r} />)}</ul>
      <p className="climb-muted">Climbs you were confirmed on, once they’re over. Climbs from the old app appear after the switch.</p>
    </details>
  );
}
