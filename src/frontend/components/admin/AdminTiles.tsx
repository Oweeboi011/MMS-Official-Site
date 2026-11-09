import { Link } from 'react-router-dom';
import type { AdminTile } from '../../data/adminHome';

export default function AdminTiles({ tiles }: { tiles: AdminTile[] }) {
  return (
    <ul className="admin-tiles">
      {tiles.map((t) => (
        <li key={t.to}><Link to={t.to}><strong>{t.title}</strong><span>{t.text}</span></Link></li>
      ))}
    </ul>
  );
}
