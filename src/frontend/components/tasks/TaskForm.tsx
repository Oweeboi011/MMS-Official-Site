import { useState, type FormEvent } from 'react';
import type { ClimbChoice } from '../../data/taskExtras';
import { COMMITTEES, REPEATS, STATUSES, taskInput, validateTask, type Task, type TaskInput } from '../../data/tasks';
import type { TaskOwner } from '../../services/tasks';
import ChecklistEditor from './ChecklistEditor';
import TaskHistory from './TaskHistory';

const BLANK: TaskInput = { title: '', committee: 'execom', status: 'todo', ownerUid: '', ownerName: '', startDate: '', dueDate: '', notes: '', checklist: '', repeat: '', link: '' };

// New or edited task. The owner list is people who hold a group; an owner who left it stays selectable on their old tasks.
export default function TaskForm({ task, owners, climbs, busy, onSave, onCancel }: {
  task?: Task; owners: TaskOwner[]; climbs: ClimbChoice[]; busy: boolean; onSave: (input: TaskInput, id?: string) => Promise<boolean>; onCancel: () => void;
}) {
  const [v, setV] = useState<TaskInput>(task ? taskInput(task) : BLANK);
  const [error, setError] = useState('');
  const set = (patch: Partial<TaskInput>) => setV({ ...v, ...patch });
  const choices = v.ownerUid && !owners.some((o) => o.uid === v.ownerUid) ? [...owners, { uid: v.ownerUid, name: v.ownerName }] : owners;
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const problem = validateTask(v);
    setError(problem);
    if (!problem && (await onSave(v, task?.id))) onCancel();
  };
  return (
    <form className="register-form" onSubmit={(e) => void submit(e)} noValidate>
      <div className="editor-field"><label htmlFor="tk-title">Title *</label><input id="tk-title" maxLength={200} value={v.title} onChange={(e) => set({ title: e.target.value })} /></div>
      <div className="editor-field">
        <label htmlFor="tk-committee">Committee *</label>
        <select id="tk-committee" value={v.committee} onChange={(e) => set({ committee: e.target.value as TaskInput['committee'] })}>
          {COMMITTEES.map(([key, label]) => <option key={key} value={key}>{label}</option>)}
        </select>
      </div>
      <div className="editor-field">
        <label htmlFor="tk-status">Status</label>
        <select id="tk-status" value={v.status} onChange={(e) => set({ status: e.target.value as TaskInput['status'] })}>
          {STATUSES.map(([key, label]) => <option key={key} value={key}>{label}</option>)}
        </select>
      </div>
      <div className="editor-field">
        <label htmlFor="tk-owner">Owner</label>
        <select id="tk-owner" value={v.ownerUid} onChange={(e) => set({ ownerUid: e.target.value, ownerName: choices.find((o) => o.uid === e.target.value)?.name ?? '' })}>
          <option value="">Unassigned</option>
          {choices.map((o) => <option key={o.uid} value={o.uid}>{o.name}</option>)}
        </select>
      </div>
      <div className="editor-field"><label htmlFor="tk-start">Start</label><input id="tk-start" type="date" value={v.startDate} onChange={(e) => set({ startDate: e.target.value })} /></div>
      <div className="editor-field"><label htmlFor="tk-due">Due</label><input id="tk-due" type="date" value={v.dueDate} onChange={(e) => set({ dueDate: e.target.value })} /></div>
      <div className="editor-field"><label htmlFor="tk-notes">Notes</label><textarea id="tk-notes" maxLength={2000} value={v.notes} onChange={(e) => set({ notes: e.target.value })} /></div>
      <ChecklistEditor value={v.checklist} onChange={(checklist) => set({ checklist })} />
      <div className="editor-field">
        <label htmlFor="tk-repeat">Repeat</label>
        <select id="tk-repeat" value={v.repeat} onChange={(e) => set({ repeat: e.target.value as TaskInput['repeat'] })}>
          {REPEATS.map(([key, label]) => <option key={key} value={key}>{label}</option>)}
        </select>
      </div>
      {climbs.length > 0 && (
        <div className="editor-field">
          <label htmlFor="tk-climb">Related climb</label>
          <select id="tk-climb" value={climbs.some((c) => c.path === v.link) ? v.link : ''} onChange={(e) => set({ link: e.target.value })}>
            <option value="">None</option>
            {climbs.map((c) => <option key={c.path} value={c.path}>{c.label}</option>)}
          </select>
        </div>
      )}
      <div className="editor-field"><label htmlFor="tk-link">Related link</label><input id="tk-link" maxLength={300} placeholder="https://… or /activities/open-climbs" value={v.link} onChange={(e) => set({ link: e.target.value })} /></div>
      {task?.updatedByName && <p className="climb-muted">Last changed by {task.updatedByName}.</p>}
      {task && <TaskHistory key={task.id} taskId={task.id} />}
      {error && <p role="alert" className="field-error">{error}</p>}
      <div className="editor-actions">
        <button type="submit" className="btn btn-primary" disabled={busy}>Save task</button>
        <button type="button" className="link-button" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}
