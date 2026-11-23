import { STATUSES, isOverdue, timelineOf, type Task } from '../../data/tasks';

const statusLabel = (key: string) => STATUSES.find(([k]) => k === key)?.[1] ?? key;

function datesText(t: Task): string {
  if (t.startDate && t.dueDate) return `${t.startDate} to ${t.dueDate}`;
  if (t.dueDate) return `Due ${t.dueDate}`;
  return t.startDate ? `Starts ${t.startDate}` : '';
}

function Meta({ task, today, busy, onEdit }: { task: Task; today: string; busy: boolean; onEdit: (t: Task) => void }) {
  const dates = datesText(task);
  return (
    <div className="tl-meta">
      <span className="tl-title">{task.title}</span>
      <span className="climb-muted">{[dates, statusLabel(task.status), task.ownerName].filter(Boolean).join(' · ')}</span>
      {isOverdue(task, today) && <span className="task-overdue">Overdue</span>}
      <button type="button" className="chip" disabled={busy} aria-label={`Edit ${task.title}`} onClick={() => onEdit(task)}>Edit</button>
    </div>
  );
}

// Bars run from start to due on one shared scale; the text beside each bar carries the same facts for screen readers.
export default function TaskTimeline({ tasks, today, busy, onEdit }: { tasks: Task[]; today: string; busy: boolean; onEdit: (t: Task) => void }) {
  const tl = timelineOf(tasks);
  return (
    <section className="tl" aria-label="Timeline">
      {tl.from && <p className="climb-muted">{tl.from} to {tl.to}</p>}
      {tl.months.length > 0 && (
        <div className="tl-axis" aria-hidden="true">
          {tl.months.map((m) => <span key={m.label} style={{ left: `${m.left}%` }}>{m.label}</span>)}
        </div>
      )}
      {tl.groups.map((g) => (
        <div key={g.committee}>
          <h2>{g.label}</h2>
          <ul className="tl-rows">
            {g.bars.map((b) => (
              <li key={b.task.id} className="tl-row">
                <Meta task={b.task} today={today} busy={busy} onEdit={onEdit} />
                <div className="tl-track" aria-hidden="true"><span className={`tl-bar is-${b.task.status}`} style={{ left: `${b.left}%`, width: `${b.width}%` }} /></div>
              </li>
            ))}
          </ul>
        </div>
      ))}
      {tl.undated.length > 0 && (
        <div>
          <h2>No dates yet</h2>
          <ul className="tl-rows">
            {tl.undated.map((t) => <li key={t.id} className="tl-row"><Meta task={t} today={today} busy={busy} onEdit={onEdit} /></li>)}
          </ul>
        </div>
      )}
    </section>
  );
}
