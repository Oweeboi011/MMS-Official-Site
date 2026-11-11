import { useState, type FormEvent } from 'react';
import { FIELDS, validateEntry, type Entry, type EntryStatus, type FieldDef } from '../../data/contentEntries';
import { CONTENT_PAGES, rightsFor, type ContentPage } from '../../data/contentRights';
import type { EntryInput } from '../../services/contentEntries';

interface Person { role: string; groups: readonly string[] }

function Field({ def, value, onChange }: { def: FieldDef; value: string; onChange: (v: string) => void }) {
  const id = `ce-${def.key}`;
  let input = <input id={id} type={def.type === 'text' ? 'text' : def.type} maxLength={def.max} value={value} onChange={(e) => onChange(e.target.value)} />;
  if (def.type === 'textarea') input = <textarea id={id} maxLength={def.max} value={value} onChange={(e) => onChange(e.target.value)} />;
  if (def.type === 'select') {
    input = (
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">Choose…</option>
        {def.options?.map(([k, label]) => <option key={k} value={k}>{label}</option>)}
      </select>
    );
  }
  return <div className="editor-field"><label htmlFor={id}>{def.label}{def.required ? ' *' : ''}</label>{input}</div>;
}

// New or edited entry. Anyone with rights can save for review; publishing needs the publish right (BOT, ExeCom, admins, TCom on its pages).
export default function ContentEntryForm({ person, entry, busy, onSave, onCancel }: {
  person: Person; entry?: Entry; busy: boolean; onSave: (input: EntryInput) => Promise<boolean>; onCancel: () => void;
}) {
  const pages = CONTENT_PAGES.filter(([p]) => rightsFor(person, p).submit);
  const [page, setPage] = useState<ContentPage>(entry?.page ?? pages[0][0]);
  const [title, setTitle] = useState(entry?.title ?? '');
  const [data, setData] = useState<Record<string, string>>(entry?.data ?? {});
  const [error, setError] = useState('');
  const submit = async (status: EntryStatus, e?: FormEvent) => {
    e?.preventDefault();
    const problem = validateEntry(page, title, data);
    setError(problem);
    if (!problem && (await onSave({ id: entry?.id, page, title, data, status }))) onCancel();
  };
  return (
    <form className="register-form" onSubmit={(e) => void submit('pending', e)} noValidate>
      <div className="editor-field">
        <label htmlFor="ce-page">Page</label>
        <select id="ce-page" value={page} disabled={Boolean(entry)} onChange={(e) => { setPage(e.target.value as ContentPage); setData({}); }}>
          {pages.map(([p, label]) => <option key={p} value={p}>{label}</option>)}
        </select>
      </div>
      <div className="editor-field"><label htmlFor="ce-title">Title *</label><input id="ce-title" maxLength={200} value={title} onChange={(e) => setTitle(e.target.value)} /></div>
      {FIELDS[page].map((def) => <Field key={def.key} def={def} value={data[def.key] ?? ''} onChange={(v) => setData({ ...data, [def.key]: v })} />)}
      {error && <p role="alert" className="field-error">{error}</p>}
      <div className="editor-actions">
        <button type="button" className="btn" disabled={busy} onClick={() => void submit('draft')}>Save draft</button>
        <button type="submit" className="btn" disabled={busy}>Send for review</button>
        {rightsFor(person, page).publish && <button type="button" className="btn btn-primary" disabled={busy} onClick={() => void submit('published')}>Publish</button>}
        <button type="button" className="link-button" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}
