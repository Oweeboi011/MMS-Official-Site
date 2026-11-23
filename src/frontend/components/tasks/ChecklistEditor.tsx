import { formatChecklist, parseChecklist } from '../../data/taskExtras';

// Items live in the task as text lines; this edits them one row at a time.
export default function ChecklistEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const items = parseChecklist(value);
  const update = (next: typeof items) => onChange(formatChecklist(next));
  return (
    <fieldset className="task-checklist-editor">
      <legend>Checklist</legend>
      {items.map((item, n) => (
        <div key={n} className="editor-field">
          <input type="checkbox" aria-label={`Done: ${item.text}`} checked={item.done} onChange={(e) => update(items.map((x, i) => (i === n ? { ...x, done: e.target.checked } : x)))} />
          <input aria-label={`Item ${n + 1}`} value={item.text} onChange={(e) => update(items.map((x, i) => (i === n ? { ...x, text: e.target.value } : x)))} />
          <button type="button" className="link-button" onClick={() => update(items.filter((_, i) => i !== n))}>Remove item {n + 1}</button>
        </div>
      ))}
      <button type="button" className="chip" onClick={() => update([...items, { text: 'New item', done: false }])}>Add item</button>
    </fieldset>
  );
}
