import { useEffect, useState } from 'react';
import AccountTabs from '../components/AccountTabs';
import { useAdminList } from '../components/admin/useAdminList';
import PageHero from '../components/PageHero';
import SignInForm from '../components/SignInForm';
import TaskForm from '../components/tasks/TaskForm';
import TaskTable from '../components/tasks/TaskTable';
import { COMMITTEES, STATUSES, canUseTasks, viewTasks, type Task, type TaskView } from '../data/tasks';
import type { Account } from '../services/auth';
import { TASK_LIMIT, loadOwners, loadTasks, removeTask, saveTask, type TaskOwner } from '../services/tasks';
import { useAccount } from '../services/useAccount';

const SORTS: [TaskView['sort'], string][] = [['due', 'Due date'], ['title', 'Title'], ['status', 'Status'], ['committee', 'Committee']];
const today = () => new Date().toLocaleDateString('en-CA');

function Filter({ id, label, value, onChange, options }: { id: string; label: string; value: string; onChange: (v: string) => void; options: readonly (readonly [string, string])[] }) {
  return (
    <div className="editor-field">
      <label htmlFor={id}>{label}</label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">All</option>
        {options.map(([key, text]) => <option key={key} value={key}>{text}</option>)}
      </select>
    </div>
  );
}

function Tasks({ account }: { account: Account }) {
  const { rows, message, busy, run } = useAdminList(loadTasks);
  const [owners, setOwners] = useState<TaskOwner[]>([]);
  const [editing, setEditing] = useState<Task | 'new' | null>(null);
  const [view, setView] = useState<TaskView>({ committee: '', status: '', ownerUid: '', sort: 'due' });
  useEffect(() => { void loadOwners().then(setOwners, () => setOwners([])); }, []);
  if (!rows) return <p role="status">{message || 'Loading…'}</p>;
  if (editing) {
    return (
      <>
        {message && <p role="status">{message}</p>}
        <TaskForm task={editing === 'new' ? undefined : editing} owners={owners} busy={busy} onCancel={() => setEditing(null)}
          onSave={(input, id) => run(() => saveTask(account, input, id))} />
      </>
    );
  }
  const shown = viewTasks(rows, view);
  const set = (patch: Partial<TaskView>) => setView({ ...view, ...patch });
  return (
    <>
      <p><button type="button" className="btn btn-primary" onClick={() => setEditing('new')}>New task</button></p>
      <div className="register-form">
        <Filter id="tf-committee" label="Committee" value={view.committee} onChange={(committee) => set({ committee })} options={COMMITTEES} />
        <Filter id="tf-status" label="Status" value={view.status} onChange={(status) => set({ status })} options={STATUSES} />
        <Filter id="tf-owner" label="Owner" value={view.ownerUid} onChange={(ownerUid) => set({ ownerUid })} options={owners.map((o) => [o.uid, o.name] as const)} />
        <div className="editor-field">
          <label htmlFor="tf-sort">Sort by</label>
          <select id="tf-sort" value={view.sort} onChange={(e) => set({ sort: e.target.value as TaskView['sort'] })}>
            {SORTS.map(([key, text]) => <option key={key} value={key}>{text}</option>)}
          </select>
        </div>
      </div>
      {message && <p role="status">{message}</p>}
      <p className="climb-muted">{shown.length} of {rows.length} tasks</p>
      {rows.length >= TASK_LIMIT && <p className="climb-notice" role="note">Showing the {TASK_LIMIT} most recently changed tasks; older ones are not listed.</p>}
      {shown.length === 0 ? <p>No tasks match.</p> : (
        <TaskTable tasks={shown} today={today()} busy={busy} onEdit={setEditing} onDelete={(t) => void run(() => removeTask(t))} />
      )}
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
