import { Link } from 'react-router-dom';

// A strip of headline numbers for an admin page: [label, value, highlight?, link?]. A highlighted one needs attention;
// one with a link opens the list behind the number.
export default function AdminStats({ items }: { items: [string, string, boolean?, string?][] }) {
  return (
    <ul className="admin-stats">
      {items.map(([label, value, alert, to]) => {
        const body = <><strong>{value}</strong><span>{label}</span></>;
        return <li key={label} className={alert ? 'is-alert' : undefined}>{to ? <Link to={to}>{body}</Link> : body}</li>;
      })}
    </ul>
  );
}
