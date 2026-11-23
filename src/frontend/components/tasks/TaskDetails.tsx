import { Link } from 'react-router-dom';
import { checklistProgress, linkify, parseChecklist } from '../../data/taskExtras';
import type { Task } from '../../data/tasks';

// Only http(s) addresses in notes become links (see linkify); everything else is plain text.
function Notes({ text }: { text: string }) {
  return (
    <p>
      {linkify(text).map((s, i) => (s.href ? <a key={i} href={s.href} target="_blank" rel="noopener noreferrer">{s.text}</a> : <span key={i}>{s.text}</span>))}
    </p>
  );
}

function RelatedLink({ href }: { href: string }) {
  return (
    <p>
      Related: {href.startsWith('/') ? <Link to={href}>{href}</Link> : <a href={href} target="_blank" rel="noopener noreferrer">{href}</a>}
    </p>
  );
}

const hasDetails = (t: Task) => [t.notes, t.checklist, t.link, t.updatedByName, t.repeat].some(Boolean);

// Folded under the title so the table stays compact; nothing renders for a bare task.
export default function TaskDetails({ task }: { task: Task }) {
  if (!hasDetails(task)) return null;
  const items = parseChecklist(task.checklist);
  const progress = checklistProgress(task.checklist);
  return (
    <details className="task-details">
      <summary>Details{progress && ` (${progress} done)`}</summary>
      {task.notes && <Notes text={task.notes} />}
      {items.length > 0 && (
        <ul className="task-checklist">
          {items.map((i, n) => <li key={n}><span aria-hidden="true">{i.done ? '☑' : '☐'}</span> <span className="sr-only">{i.done ? 'Done: ' : 'Open: '}</span>{i.text}</li>)}
        </ul>
      )}
      {task.link && <RelatedLink href={task.link} />}
      {task.repeat && <p className="climb-muted">Repeats {task.repeat === 'weekly' ? 'every week' : 'every month'}.</p>}
      {task.updatedByName && <p className="climb-muted">Last changed by {task.updatedByName}.</p>}
    </details>
  );
}
