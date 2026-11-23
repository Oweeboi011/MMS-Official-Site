import { summaryOf } from '../../data/taskExtras';
import { STATUSES, type Task } from '../../data/tasks';
import DataTable from '../DataTable';

// Counts per committee across every task, whatever the filters show.
export default function TaskSummary({ tasks, today }: { tasks: Task[]; today: string }) {
  return (
    <DataTable caption="Summary by committee" head={['Committee', ...STATUSES.map(([, label]) => label), 'Overdue', 'Due this week']}>
      {summaryOf(tasks, today).map((s) => (
        <tr key={s.committee}>
          <th scope="row">{s.label}</th>
          {STATUSES.map(([key]) => <td key={key}>{s.counts[key]}</td>)}
          <td>{s.overdue}</td>
          <td>{s.dueSoon}</td>
        </tr>
      ))}
    </DataTable>
  );
}
