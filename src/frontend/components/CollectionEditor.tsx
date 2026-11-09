import { useCallback, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { lockedKeys, toForm, validate, type CollectionSpec, type Field, type FormValues } from '../data/siteSchemas';
import { MAX_ROWS, removeRow, saveRow, type Row } from '../services/siteData';
import RecordsInput from './RecordsInput';
import { useCollectionRows } from './useCollectionRows';

const NEW = '__new__';

// Rules errors arrive as permission-denied: say what that usually means.
const failure = (action: 'saved' | 'deleted', e: unknown) => {
  if ((e as { code?: string }).code !== 'permission-denied') return `Not ${action}: ${(e as Error).message}`;
  return action === 'saved'
    ? 'Not saved: the database rejected it. Check required fields, lengths and links, and that you are an admin.'
    : 'Not deleted: the database refused. Check that you are still an admin.';
};

interface InputProps { field: Field; value: string | boolean; disabled: boolean; onChange: (v: string | boolean) => void }

function Control({ field, value, disabled, onChange }: InputProps) {
  const id = `field-${field.key}`;
  const text = String(value);
  const onText = (e: { target: { value: string } }) => onChange(e.target.value);
  switch (field.kind) {
    case 'bool':
      return <input id={id} disabled={disabled} type="checkbox" checked={value === true} onChange={(e) => onChange(e.target.checked)} />;
    case 'select':
      return (
        <select id={id} disabled={disabled} value={text} onChange={onText}>
          <option value="">Choose…</option>
          {field.options?.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      );
    case 'records':
      return <RecordsInput id={id} label={field.label} columns={field.columns ?? []} value={text} disabled={disabled} onChange={onChange} />;
    case 'longText':
    case 'lines':
      return <textarea id={id} disabled={disabled} rows={field.kind === 'lines' ? 6 : 4} maxLength={field.max} value={text} onChange={onText} />;
    default:
      return <input id={id} disabled={disabled} type={{ int: 'number', date: 'date' }[field.kind as string] ?? 'text'} maxLength={field.max} value={text} onChange={onText} />;
  }
}

function FieldInput({ field, value, readOnly, locked, onChange }: { field: Field; value: string | boolean; readOnly: boolean; locked: boolean; onChange: (v: string | boolean) => void }) {
  return (
    <div className={`editor-field editor-${field.kind}`}>
      <label htmlFor={`field-${field.key}`}>{field.label}{field.required ? ' *' : ''}</label>
      <Control field={field} value={value} disabled={readOnly || locked} onChange={onChange} />
      {field.hint && <small>{field.hint}</small>}
      {locked && <small>Stored in another format: kept as is (edit in the Firebase console).</small>}
    </div>
  );
}

// A saved row's own page (e.g. a climb's registrations).
function RowLink({ spec, selected }: { spec: CollectionSpec; selected: string | null }) {
  if (!spec.rowLink || !selected || selected === NEW) return null;
  const { to, label } = spec.rowLink(selected);
  return <p><Link className="btn" to={to}>{label}</Link></p>;
}

function RowList({ spec, rows, selected, busy, onPick }: { spec: CollectionSpec; rows: Row[]; selected: string | null; busy: boolean; onPick: (id: string | null) => void }) {
  return (
    <div className="editor-list">
      {!spec.readOnly && <button type="button" className="btn btn-primary" disabled={busy} onClick={() => onPick(null)}>New</button>}
      <ul>
        {rows.map((r) => (
          <li key={r.id}>
            <button type="button" className={`link-button${r.id === selected ? ' is-active' : ''}`} disabled={busy} onClick={() => onPick(r.id)}>
              {spec.rowLabel ? spec.rowLabel(r.data) : String(r.data[spec.titleField] ?? r.id)}
            </button>
          </li>
        ))}
      </ul>
      {!rows.length && <p>No {spec.label.toLowerCase()} yet.</p>}
      {rows.length >= MAX_ROWS && <p>Showing the first {MAX_ROWS}. Older entries: Firebase console.</p>}
    </div>
  );
}

interface FormProps {
  spec: CollectionSpec;
  values: FormValues;
  locked: string[];
  busy: boolean;
  canDelete: boolean;
  confirmDelete: boolean;
  onChange: (values: FormValues) => void;
  onSave: () => void;
  onDelete: () => void;
}

function EditorForm({ spec, values, locked, busy, canDelete, confirmDelete, onChange, onSave, onDelete }: FormProps) {
  const readOnly = Boolean(spec.readOnly);
  return (
    <form className="editor-form" onSubmit={(e) => { e.preventDefault(); onSave(); }}>
      {spec.fields.map((f) => (
        <FieldInput key={f.key} field={f} value={values[f.key]} readOnly={readOnly} locked={locked.includes(f.key)}
          onChange={(v) => onChange({ ...values, [f.key]: v })} />
      ))}
      <div className="editor-actions">
        {!readOnly && <button type="submit" className="btn btn-primary" disabled={busy}>Save</button>}
        {canDelete && <button type="button" className="btn btn-dark" disabled={busy} onClick={onDelete}>{confirmDelete ? 'Confirm delete' : 'Delete'}</button>}
      </div>
    </form>
  );
}

export default function CollectionEditor({ spec, onBusyChange }: { spec: CollectionSpec; onBusyChange?: (busy: boolean) => void }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [values, setValues] = useState<FormValues>(toForm(spec));
  const [locked, setLocked] = useState<string[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const current = useRef<string | null>(null);
  const inFlight = useRef(false); // a ref, not state: two fast clicks share one render

  const open = useCallback((id: string | null, list: Row[]) => {
    current.current = id ?? NEW;
    setSelected(current.current);
    const data = list.find((r) => r.id === id)?.data;
    setValues(toForm(spec, data));
    setLocked(lockedKeys(spec, data));
    setConfirmDelete(false);
  }, [spec]);

  // No form before data: a blank save would wipe siteSettings.
  const { rows, loaded, error, reload, clearError, live } = useCollectionRows(spec, (list) => {
    if (spec.singleton) open(spec.singleton, list);
  });

  const run = async (action: () => Promise<void>) => {
    if (inFlight.current) return;
    inFlight.current = true;
    setBusy(true);
    onBusyChange?.(true);
    try { await action(); } finally {
      inFlight.current = false;
      onBusyChange?.(false);
      if (live.current) setBusy(false);
    }
  };

  const save = () => run(async () => {
    const problem = validate(spec, values, locked);
    if (problem) return setStatus(problem);
    const editing = selected;
    try {
      const id = await saveRow(spec, editing === NEW ? null : editing, values, locked);
      // From here the row exists: a second Save must update it, not add another.
      if (current.current === editing) { current.current = id; setSelected(id); }
      const list = await reload();
      if (!list) return setStatus('Saved, but the list could not reload. Refresh the page.');
      const shown = list.some((r) => r.id === id);
      if (current.current === id && shown) open(id, list); // admin may have moved on to another row
      setStatus(shown ? 'Saved.' : `Saved (beyond the first ${MAX_ROWS} shown).`);
    } catch (e) {
      setStatus(failure('saved', e));
    }
  });

  const remove = () => run(async () => {
    if (!selected || selected === NEW) return;
    if (!confirmDelete) return setConfirmDelete(true);
    const target = selected;
    try {
      await removeRow(spec, target);
      if (current.current === target) { current.current = null; setSelected(null); }
      setStatus((await reload()) ? 'Deleted.' : 'Deleted, but the list could not reload. Refresh the page.');
    } catch (e) {
      setConfirmDelete(false); // the next click must ask again
      setStatus(failure('deleted', e));
    }
  });

  const pick = (id: string | null) => { open(id, rows); setStatus(null); clearError(); };
  const message = status ?? error;
  return (
    <div className={spec.singleton ? 'editor is-single' : 'editor'}>
      {!spec.singleton && loaded && <RowList spec={spec} rows={rows} selected={selected} busy={busy} onPick={pick} />}
      {!loaded && !error && <p>Loading…</p>}
      {loaded && <RowLink spec={spec} selected={selected} />}
      {loaded && selected && (
        <EditorForm spec={spec} values={values} locked={locked} busy={busy} confirmDelete={confirmDelete}
          canDelete={selected !== NEW && !spec.singleton} onChange={setValues} onSave={save} onDelete={remove} />
      )}
      {message && <p className="account-message" role="status">{message}</p>}
    </div>
  );
}
