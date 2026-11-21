import { useState } from 'react';
import { COMMITTEES, STATUSES, isOverdue, type Task } from '../../data/tasks';
import DataTable from '../DataTable';

const label = (options: readonly (readonly [string, string])[], key: string) => options.find(([k]) => k === key)?.[1] ?? key;

// Delete asks twice (button turns into "Confirm delete") instead of opening a browser dialog.
export default function TaskTable({ tasks, today, busy, onEdit, onDelete }: {
  tasks: Task[]; today: string; busy: boolean; onEdit: (t: Task) => void; onDelete: (t: Task) => void;
}) {
  const [confirming, setConfirming] = useState('');
  return (
    <DataTable caption="Tasks" head={['Task', 'Committee', 'Status', 'Owner', 'Due', 'Actions']}>
      {tasks.map((t) => (
        <tr key={t.id}>
          <th scope="row">{t.title}</th>
          <td>{label(COMMITTEES, t.committee)}</td>
          <td>{label(STATUSES, t.status)}</td>
          <td>{t.ownerName || 'Unassigned'}</td>
          <td>{t.dueDate || '—'}{isOverdue(t, today) && <> <span className="my-climb-chip">Overdue</span></>}</td>
          <td>
            <button type="button" className="chip" disabled={busy} onClick={() => onEdit(t)}>Edit</button>
            {confirming === t.id ? (
              <button type="button" className="chip" disabled={busy} onClick={() => { setConfirming(''); onDelete(t); }}>Confirm delete</button>
            ) : (
              <button type="button" className="chip" disabled={busy} onClick={() => setConfirming(t.id)}>Delete</button>
            )}
          </td>
        </tr>
      ))}
    </DataTable>
  );
}
