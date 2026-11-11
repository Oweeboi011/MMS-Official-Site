import { useState, type FormEvent } from 'react';
import type { ClimbDetail } from '../../data/climbDetail';
import type { MyClimb } from '../../data/myClimbs';
import { RECEIPT_TYPES, amountProblem, parseAmount, uploadProblem } from '../../data/requiredDocs';
import { submitPayment } from '../../services/uploads';
import GcashButton from '../GcashModal';

interface Props { row: MyClimb; climb: ClimbDetail; uid: string; onDone: () => void }

// ADR 0007: pay the MMS GCash / QR Ph account in your own app, then upload the receipt; an officer verifies it.
export default function PayForm({ row, climb, uid, onDone }: Props) {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [state, setState] = useState<{ busy: boolean; message: string }>({ busy: false, message: '' });
  const pay = climb.payTo;
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const fileProblem = files.length ? files.map((f) => uploadProblem(f, 'receipt')).find(Boolean) : 'Attach your receipt (screenshot or PDF).';
    const problem = amountProblem(amount) ?? fileProblem;
    if (problem) return setState({ busy: false, message: problem });
    setState({ busy: true, message: 'Uploading…' });
    try {
      await submitPayment({ registrationId: row.id, climbId: row.climbId, uid, amount: parseAmount(amount), previousPaid: row.paid, note, files });
      onDone();
    } catch (err) {
      setState({ busy: false, message: `Not sent: ${(err as Error).message}` });
    }
  };
  return (
    <form className="pay-form" onSubmit={(e) => void submit(e)} noValidate>
      <h3>Pay</h3>
      {pay ? (
        <div className="pay-to">
          {pay.qrUrl && <img src={pay.qrUrl} alt="MMS GCash / QR Ph code for this climb" width={180} height={180} />}
          <p>{pay.name && <>Account name: <strong>{pay.name}</strong><br /></>}{pay.number && <>GCash number: <strong>{pay.number}</strong></>}</p>
          <p className="climb-muted">Scan with GCash, Maya or any bank app (QR Ph), then upload the receipt here.</p>
          {pay.qrUrl && <p><GcashButton payTo={pay} label="Enlarge the QR code" /></p>}
        </div>
      ) : <p className="climb-muted">Payment details for this climb aren’t posted yet. The climb officers will share them.</p>}
      <label htmlFor={`amt-${row.id}`}>Amount paid (₱)</label>
      <input id={`amt-${row.id}`} inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} />
      <label htmlFor={`rcpt-${row.id}`}>Receipt (photo or PDF)</label>
      <input id={`rcpt-${row.id}`} type="file" accept={RECEIPT_TYPES} multiple onChange={(e) => setFiles(Array.from(e.target.files ?? []))} />
      <label htmlFor={`note-${row.id}`}>Note (optional)</label>
      <input id={`note-${row.id}`} maxLength={500} value={note} onChange={(e) => setNote(e.target.value)} />
      {state.message && <p role="status">{state.message}</p>}
      <button type="submit" className="btn btn-primary" disabled={state.busy}>Send payment</button>
    </form>
  );
}
