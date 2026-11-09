import { useState, type FormEvent } from 'react';
import { detailsProblem, type Details, type MyClimb } from '../../data/myClimbs';
import { updateMyDetails } from '../../services/registrations';

const FIELDS: [keyof Details, string][] = [
  ['mobile', 'Mobile number'], ['ecName', 'Emergency contact name'], ['ecMobile', 'Emergency contact mobile'],
  ['ecRelationship', 'Relationship to you'], ['medicalConditions', 'Medical conditions, allergies, medicines'],
];

// #168: fix your mobile, emergency contact or health notes after registering.
export default function EditDetails({ row, onDone }: { row: MyClimb; onDone: () => void }) {
  const [open, setOpen] = useState(false);
  const [x, setX] = useState<Details>(row.details);
  const [state, setState] = useState({ busy: false, message: '' });
  if (!open) return <button type="button" className="btn" onClick={() => setOpen(true)}>Edit my details</button>;
  const save = async (e: FormEvent) => {
    e.preventDefault();
    const problem = detailsProblem(x);
    if (problem) return setState({ busy: false, message: problem });
    setState({ busy: true, message: '' });
    try {
      await updateMyDetails(row.id, x);
      setOpen(false);
      onDone();
    } catch (err) {
      setState({ busy: false, message: `Not saved: ${(err as Error).message}` });
    }
  };
  return (
    <form className="pay-form" onSubmit={(e) => void save(e)} noValidate>
      <h3>My details for this climb</h3>
      {FIELDS.map(([k, label]) => (
        <div className="editor-field" key={k}>
          <label htmlFor={`${k}-${row.id}`}>{label}</label>
          <input id={`${k}-${row.id}`} value={x[k]} onChange={(e) => setX({ ...x, [k]: e.target.value })} />
        </div>
      ))}
      {state.message && <p role="alert" className="field-error">{state.message}</p>}
      <div className="editor-actions">
        <button type="submit" className="btn btn-primary" disabled={state.busy}>Save details</button>
        <button type="button" className="btn" onClick={() => setOpen(false)}>Cancel</button>
      </div>
    </form>
  );
}
