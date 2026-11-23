import { COMMITTEES, STATUSES, isOverdue, type Task } from '../../data/tasks';
import DataTable from '../DataTable';
import DueNote from './DueNote';
import TaskDetails from './TaskDetails';

const label = (options: readonly (readonly [string, string])[], key: string) => options.find(([k]) => k === key)?.[1] ?? key;

interface Props {
  tasks: Task[]; today: string; busy: boolean; staleOwner: (t: Task) => boolean;
  onEdit: (t: Task) => void; onDelete: (t: Task) => void; onStatus: (t: Task, status: Task['status']) => void;
}

// Delete is undoable (the page offers Undo for a few seconds), so there is no confirm step here.
export default function TaskTable({ tasks, today, busy, staleOwner, onEdit, onDelete, onStatus }: Props) {
  return (
    <DataTable caption="Tasks" className="task-table" head={['Task', 'Committee', 'Status', 'Owner', 'Due', 'Actions']}>
      {tasks.map((t) => (
        <tr key={t.id}>
          <th scope="row" data-label="Task">{t.title}<TaskDetails task={t} /></th>
          <td data-label="Committee">{label(COMMITTEES, t.committee)}</td>
          <td data-label="Status">
            <select aria-label={`Status of ${t.title}`} value={t.status} disabled={busy} onChange={(e) => onStatus(t, e.target.value as Task['status'])}>
              {STATUSES.map(([key, text]) => <option key={key} value={key}>{text}</option>)}
            </select>
          </td>
          <td data-label="Owner">{t.ownerName || 'Unassigned'}{staleOwner(t) && <> <span className="climb-muted">(no longer in a group)</span></>}</td>
          <td data-label="Due">{t.dueDate || '—'}{isOverdue(t, today) && <> <span className="task-overdue">Overdue</span></>}<DueNote task={t} today={today} /></td>
          <td data-label="Actions">
            <button type="button" className="chip" disabled={busy} onClick={() => onEdit(t)}>Edit</button>
            <button type="button" className="chip" disabled={busy} onClick={() => onDelete(t)}>Delete</button>
          </td>
        </tr>
      ))}
    </DataTable>
  );
}
