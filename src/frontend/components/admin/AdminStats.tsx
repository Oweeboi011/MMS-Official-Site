// A strip of headline numbers for an admin page: [label, value, highlight?]. A highlighted one needs attention.
export default function AdminStats({ items }: { items: [string, string, boolean?][] }) {
  return (
    <ul className="admin-stats">
      {items.map(([label, value, alert]) => (
        <li key={label} className={alert ? 'is-alert' : undefined}><strong>{value}</strong><span>{label}</span></li>
      ))}
    </ul>
  );
}
