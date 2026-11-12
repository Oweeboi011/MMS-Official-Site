import { Link } from 'react-router-dom';
import DataTable from '../DataTable';
import type { MyClimb } from '../../data/myClimbs';
import { useClimb } from '../../services/useClimb';

function Entry({ row }: { row: MyClimb }) {
  const climb = useClimb(row.climbId);
  if (!climb?.over) return null;
  return <tr><th scope="row"><Link to={`/climbs/${row.climbId}`}>{row.title}</Link></th><td>{row.date}</td><td>{climb.rating}</td></tr>;
}

// #95 / #62: your climb log, from your own confirmed registrations on climbs that are over (no extra data stored).
export default function ClimbLog({ rows }: { rows: MyClimb[] }) {
  const confirmed = rows.filter((r) => r.status === 'confirmed');
  if (!confirmed.length) return null;
  return (
    <details className="register-section climb-log">
      <summary><strong>Climb log</strong></summary>
      <DataTable caption="Your climb log" head={['Climb', 'Date', 'Rating']}>{confirmed.map((r) => <Entry key={r.id} row={r} />)}</DataTable>
      <p className="climb-muted">Climbs you were confirmed on, once they’re over. Climbs from the old app appear after the switch.</p>
    </details>
  );
}
