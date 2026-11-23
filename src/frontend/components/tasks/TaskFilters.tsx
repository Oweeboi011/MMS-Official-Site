import { COMMITTEES, STATUSES, UNASSIGNED, type TaskView } from '../../data/tasks';
import type { TaskOwner } from '../../services/tasks';

const SORTS: [TaskView['sort'], string][] = [['due', 'Due date'], ['title', 'Title'], ['status', 'Status'], ['committee', 'Committee']];

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

// Filters for both views; Sort applies to the table only.
export default function TaskFilters({ view, owners, myUid, showSort, onChange }: { view: TaskView; owners: TaskOwner[]; myUid: string; showSort: boolean; onChange: (patch: Partial<TaskView>) => void }) {
  const ownerOptions = [[myUid, 'My tasks'], [UNASSIGNED, 'Unassigned'], ...owners.filter((o) => o.uid !== myUid).map((o) => [o.uid, o.name] as const)] as const;
  return (
    <div className="register-form">
      <Filter id="tf-committee" label="Committee" value={view.committee} onChange={(committee) => onChange({ committee })} options={COMMITTEES} />
      <Filter id="tf-status" label="Status" value={view.status} onChange={(status) => onChange({ status })} options={STATUSES} />
      <Filter id="tf-owner" label="Owner" value={view.ownerUid} onChange={(ownerUid) => onChange({ ownerUid })} options={ownerOptions} />
      {showSort && (
        <div className="editor-field">
          <label htmlFor="tf-sort">Sort by</label>
          <select id="tf-sort" value={view.sort} onChange={(e) => onChange({ sort: e.target.value as TaskView['sort'] })}>
            {SORTS.map(([key, text]) => <option key={key} value={key}>{text}</option>)}
          </select>
        </div>
      )}
    </div>
  );
}
