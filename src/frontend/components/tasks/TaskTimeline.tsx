import { useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { dragDays, todayMarker } from '../../data/taskExtras';
import { COMMITTEES, STATUSES, isOverdue, timelineOf, type Task } from '../../data/tasks';

const statusLabel = (key: string) => STATUSES.find(([k]) => k === key)?.[1] ?? key;
const ZOOMS = [1, 2, 4];

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

interface BarProps { task: Task; left: number; width: number; from: string; to: string; busy: boolean; trackRef: { current: HTMLDivElement | null }; onMove: (t: Task, days: number) => void }

// Moves with the arrow keys (1 day, Shift = 7) or by dragging; both end in the same date change.
function BarHandle({ task, left, width, from, to, busy, trackRef, onMove }: BarProps) {
  const startX = useRef<number | null>(null);
  const key = (e: KeyboardEvent) => {
    const step = e.shiftKey ? 7 : 1;
    if (e.key === 'ArrowLeft') onMove(task, -step);
    else if (e.key === 'ArrowRight') onMove(task, step);
    else return;
    e.preventDefault();
  };
  const up = (e: PointerEvent) => {
    if (startX.current === null) return;
    const days = dragDays(e.clientX - startX.current, trackRef.current?.getBoundingClientRect().width ?? 0, from, to);
    startX.current = null;
    if (days) onMove(task, days);
  };
  return (
    <span
      className={`tl-bar is-${task.status} is-${task.committee}`} style={{ left: `${left}%`, width: `${width}%` }}
      role="button" tabIndex={busy ? -1 : 0} aria-disabled={busy} aria-label={`Move ${task.title}: arrow keys change its dates by a day, Shift by a week`}
      onKeyDown={key} onPointerDown={(e) => { startX.current = e.clientX; }} onPointerUp={up} onPointerCancel={() => { startX.current = null; }}
    />
  );
}

function Legend() {
  return (
    <ul className="tl-legend" aria-label="Legend">
      {STATUSES.map(([key, text]) => <li key={key}><span className={`tl-swatch tl-bar is-${key}`} aria-hidden="true" /> {text}</li>)}
      {COMMITTEES.map(([key, text]) => <li key={key}><span className={`tl-swatch tl-stripe is-${key}`} aria-hidden="true" /> {text} (bar edge)</li>)}
    </ul>
  );
}

// Bars run from start to due on one shared scale; the text beside each bar carries the same facts for screen readers.
export default function TaskTimeline({ tasks, today, busy, onEdit, onMove }: { tasks: Task[]; today: string; busy: boolean; onEdit: (t: Task) => void; onMove: (t: Task, days: number) => void }) {
  const tl = timelineOf(tasks);
  const [zoom, setZoom] = useState(1);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const now = todayMarker(tl.from, tl.to, today);
  return (
    <section className="tl" aria-label="Timeline">
      {tl.from && (
        <p className="climb-muted">
          {tl.from} to {tl.to}{' '}
          <button type="button" className="chip" disabled={zoom === 1} onClick={() => setZoom(ZOOMS[ZOOMS.indexOf(zoom) - 1])}>Zoom out</button>{' '}
          <button type="button" className="chip" disabled={zoom === ZOOMS.at(-1)} onClick={() => setZoom(ZOOMS[ZOOMS.indexOf(zoom) + 1])}>Zoom in</button>
        </p>
      )}
      <Legend />
      <div className="tl-scroll">
        <div className="tl-inner" style={{ width: `${zoom * 100}%` }}>
          {tl.months.length > 0 && (
            <div className="tl-axis" aria-hidden="true">
              {tl.months.map((m) => <span key={m.label} style={{ left: `${m.left}%` }}>{m.label}</span>)}
            </div>
          )}
          {now !== null && <div className="tl-today" style={{ left: `${now}%` }} role="img" aria-label={`Today, ${today}`} />}
          {tl.groups.map((g) => (
            <div key={g.committee}>
              <h2>{g.label}</h2>
              <ul className="tl-rows">
                {g.bars.map((b) => (
                  <li key={b.task.id} className="tl-row">
                    <Meta task={b.task} today={today} busy={busy} onEdit={onEdit} />
                    <div className="tl-track" ref={trackRef}><BarHandle task={b.task} left={b.left} width={b.width} from={tl.from} to={tl.to} busy={busy} trackRef={trackRef} onMove={onMove} /></div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
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
