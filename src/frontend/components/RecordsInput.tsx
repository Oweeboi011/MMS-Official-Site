import { emptyRow, rowsFromForm, rowsToForm, type Column, type RecordRow } from '../data/records';

interface Props {
  id: string;
  label: string;
  columns: Column[];
  value: string; // rows as JSON (data/records.ts)
  disabled: boolean;
  onChange: (value: string) => void;
}

function Cell({ column, value, label, disabled, onChange }: { column: Column; value: string | boolean; label: string; disabled: boolean; onChange: (v: string | boolean) => void }) {
  if (column.kind === 'bool') return <input type="checkbox" aria-label={label} checked={value === true} disabled={disabled} onChange={(e) => onChange(e.target.checked)} />;
  if (column.kind === 'select') {
    return (
      <select aria-label={label} value={String(value)} disabled={disabled} onChange={(e) => onChange(e.target.value)}>
        <option value="">Choose…</option>
        {column.options?.map((o) => <option key={o}>{o}</option>)}
      </select>
    );
  }
  return <input type="text" aria-label={label} maxLength={column.max} value={String(value)} disabled={disabled} onChange={(e) => onChange(e.target.value)} />;
}

// Rows of small inputs with add / remove / move up, for list fields (fees, routes, officers, itinerary).
export default function RecordsInput({ id, label, columns, value, disabled, onChange }: Props) {
  const rows = rowsFromForm(value);
  const set = (next: RecordRow[]) => onChange(rowsToForm(next));
  const edit = (i: number, key: string, v: string | boolean) => set(rows.map((r, j) => (j === i ? { ...r, [key]: v } : r)));
  const move = (i: number) => {
    const next = [...rows];
    [next[i - 1], next[i]] = [next[i], next[i - 1]];
    set(next);
  };
  return (
    <div className="records" id={id} role="group" aria-label={label}>
      <table>
        <thead><tr>{columns.map((c) => <th key={c.key} scope="col">{c.label}{c.required ? ' *' : ''}</th>)}<th><span className="sr-only">Actions</span></th></tr></thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i /* rows have no ids; position is the identity */}>
              {columns.map((c) => (
                <td key={c.key}><Cell column={c} value={row[c.key] ?? ''} label={`${c.label}, row ${i + 1}`} disabled={disabled} onChange={(v) => edit(i, c.key, v)} /></td>
              ))}
              <td className="records-actions">
                {i > 0 && <button type="button" className="link-button" disabled={disabled} onClick={() => move(i)} aria-label={`Move row ${i + 1} up`}>↑</button>}
                <button type="button" className="link-button" disabled={disabled} onClick={() => set(rows.filter((_, j) => j !== i))} aria-label={`Remove row ${i + 1}`}>Remove</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button type="button" className="chip" disabled={disabled} onClick={() => set([...rows, emptyRow(columns)])}>Add row</button>
    </div>
  );
}
