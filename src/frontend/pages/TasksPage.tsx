import { useCallback, useEffect, useMemo, useState } from 'react';
import AccountTabs from '../components/AccountTabs';
import { useAdminList } from '../components/admin/useAdminList';
import PageHero from '../components/PageHero';
import SignInForm from '../components/SignInForm';
import TaskFilters from '../components/tasks/TaskFilters';
import TaskForm from '../components/tasks/TaskForm';
import TaskSummary from '../components/tasks/TaskSummary';
import TaskTable from '../components/tasks/TaskTable';
import TaskTimeline from '../components/tasks/TaskTimeline';
import { useStoredView } from '../components/tasks/useStoredView';
import { useTaskShortcuts } from '../components/tasks/useTaskShortcuts';
import { useUndoDelete } from '../components/tasks/useUndoDelete';
import { shiftDates } from '../data/taskExtras';
import { canUseTasks, manilaToday, taskInput, tasksToCsv, viewTasks, type Task, type TaskView } from '../data/tasks';
import { downloadCsv } from '../lib/download';
import type { Account } from '../services/auth';
import { TASK_LIMIT, loadOwners, loadTasks, removeTask, saveTask, type TaskOwner } from '../services/tasks';
import { useAccount } from '../services/useAccount';

interface ResultsProps {
  tasks: Task[]; total: number; mode: 'table' | 'timeline'; busy: boolean; staleOwner: (t: Task) => boolean;
  onEdit: (t: Task) => void; onDelete: (t: Task) => void; onStatus: (t: Task, s: Task['status']) => void; onMove: (t: Task, days: number) => void; onClear: () => void;
}

function Results({ tasks, total, mode, busy, staleOwner, onEdit, onDelete, onStatus, onMove, onClear }: ResultsProps) {
  if (total === 0) return <p>No tasks yet. Add the first with New task.</p>;
  if (tasks.length === 0) return <p>No tasks match these filters. <button type="button" className="chip" onClick={onClear}>Clear filters</button></p>;
  const today = manilaToday();
  if (mode === 'timeline') return <TaskTimeline tasks={tasks} today={today} busy={busy} onEdit={onEdit} onMove={onMove} />;
  return <TaskTable tasks={tasks} today={today} busy={busy} staleOwner={staleOwner} onEdit={onEdit} onDelete={onDelete} onStatus={onStatus} />;
}

function ViewToggle({ mode, onChange }: { mode: 'table' | 'timeline'; onChange: (m: 'table' | 'timeline') => void }) {
  return (
    <div className="trail-tabs" role="group" aria-label="View">
      {(['table', 'timeline'] as const).map((m) => (
        <button key={m} type="button" className="chip" aria-pressed={mode === m} onClick={() => onChange(m)}>{m === 'table' ? 'Table' : 'Timeline'}</button>
      ))}
    </div>
  );
}

function Tasks({ account }: { account: Account }) {
  const [max, setMax] = useState(TASK_LIMIT);
  const load = useCallback(() => loadTasks(max), [max]);
  const { rows, message, busy, run } = useAdminList(load);
  const [owners, setOwners] = useState<TaskOwner[] | null>(null);
  const [editing, setEditing] = useState<Task | 'new' | null>(null);
  const [{ mode, view }, setStored] = useStoredView(account.uid);
  const undo = useUndoDelete((t) => run(() => removeTask(t)));
  useEffect(() => { void loadOwners().then(setOwners, () => setOwners(null)); }, []);
  const shortcuts = useMemo(() => ({
    n: () => setEditing('new'), t: () => setStored((s) => ({ ...s, mode: 'table' })), l: () => setStored((s) => ({ ...s, mode: 'timeline' })),
  }), [setStored]);
  useTaskShortcuts(!editing, shortcuts);
  if (!rows) return <p role="status">{message || 'Loading…'}</p>;
  if (editing) {
    const wasDone = editing !== 'new' && editing.status === 'done';
    return (
      <>
        {message && <p role="status">{message}</p>}
        <TaskForm task={editing === 'new' ? undefined : editing} owners={owners ?? []} busy={busy} onCancel={() => setEditing(null)}
          onSave={(input, id) => run(() => saveTask(account, input, id, wasDone))} />
      </>
    );
  }
  const visible = rows.filter((t) => t.id !== undo.pending?.id);
  const shown = viewTasks(visible, view);
  const set = (patch: Partial<TaskView>) => setStored((s) => ({ ...s, view: { ...s.view, ...patch } }));
  const change = (t: Task, patch: Partial<ReturnType<typeof taskInput>>) => void run(() => saveTask(account, { ...taskInput(t), ...patch }, t.id, t.status === 'done'));
  return (
    <>
      <p>
        <button type="button" className="btn btn-primary" onClick={() => setEditing('new')}>New task</button>{' '}
        <button type="button" className="btn" disabled={!shown.length} onClick={() => downloadCsv('committee-tasks', tasksToCsv(shown))}>Download CSV ({shown.length})</button>
      </p>
      <p className="climb-muted">Shortcuts: N new task, T table, L timeline.</p>
      <TaskSummary tasks={visible} today={manilaToday()} />
      <ViewToggle mode={mode} onChange={(m) => setStored((s) => ({ ...s, mode: m }))} />
      <TaskFilters view={view} owners={owners ?? []} myUid={account.uid} showSort={mode === 'table'} onChange={set} />
      {message && <p role="status">{message}</p>}
      {undo.pending && <p role="status" className="climb-notice">Deleted “{undo.pending.title}”. <button type="button" className="chip" onClick={undo.undo}>Undo</button></p>}
      <p className="climb-muted">{shown.length} of {visible.length} tasks</p>
      {rows.length >= max && <p className="climb-notice" role="note">Showing the {max} most recently changed tasks. <button type="button" className="chip" onClick={() => setMax(max + TASK_LIMIT)}>Show more tasks</button></p>}
      <Results tasks={shown} total={visible.length} mode={mode} busy={busy} onEdit={setEditing} onDelete={undo.request} onClear={() => set({ committee: '', status: '', ownerUid: '' })}
        staleOwner={(t) => owners !== null && Boolean(t.ownerUid) && !owners.some((o) => o.uid === t.ownerUid)}
        onStatus={(t, status) => change(t, { status })} onMove={(t, days) => change(t, shiftDates(t, days))} />
    </>
  );
}

// ADR 0012: ExeCom, TCom and BOT members and admins track committee tasks here.
export default function TasksPage() {
  const state = useAccount();
  let body = <p role="status">Checking your sign-in…</p>;
  if (state.status === 'signedIn') {
    body = canUseTasks({ role: state.account.role, groups: state.account.groups ?? [] })
      ? <Tasks account={state.account} />
      : <p>Your account doesn’t have access to the task tracker. Ask an admin to add you to BOT, ExeCom or TCom.</p>;
  } else if (state.status !== 'loading') body = <><p>Sign in to see the committee tasks.</p><SignInForm /></>;
  return (
    <>
      <PageHero compact eyebrow="Account" title="Committee tasks" intro="What ExeCom and TCom are working on, and when it is due." image="/images/page-open-climbs.webp" />
      <main><section className="section page-section"><div className="shell register-shell"><AccountTabs />{body}</div></section></main>
    </>
  );
}
