import { useState } from 'react';
import type { ClimbDetail } from '../../data/climbDetail';
import type { MyClimb } from '../../data/myClimbs';
import { DOC_TYPES, uploadProblem } from '../../data/requiredDocs';
import { submitDocument } from '../../services/uploads';

interface Props { row: MyClimb; climb: ClimbDetail; uid: string; onDone: () => void }

// Required documents can come after registering; each is uploaded once (an officer replaces it if needed).
export default function DocUploads({ row, climb, uid, onDone }: Props) {
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  if (!climb.requiredDocs.length) return null;
  const send = async (prefix: string, field: string, file: File | undefined) => {
    if (!file) return;
    const problem = uploadProblem(file, 'document');
    if (problem) return setMessage(problem);
    setBusy(true);
    setMessage('Uploading…');
    try {
      await submitDocument(row.id, row.climbId, uid, prefix, field, file);
      setMessage('');
      onDone();
    } catch (err) {
      setMessage(`Not uploaded: ${(err as Error).message}`);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="doc-uploads">
      <h3>Required documents</h3>
      <ul>
        {climb.requiredDocs.map((t) => (
          <li key={t.key}>
            <strong>{t.label}</strong>{' '}
            {row.uploaded.includes(t.uploadField) ? <span>✓ Uploaded</span> : (
              <>
                <span className="climb-muted">{t.hint}</span>
                {t.sampleUrl && <> <a href={t.sampleUrl} target="_blank" rel="noopener noreferrer">Template / sample</a></>}
                <label className="sr-only" htmlFor={`${t.key}-${row.id}`}>Upload {t.label}</label>
                <input id={`${t.key}-${row.id}`} type="file" accept={DOC_TYPES} disabled={busy} onChange={(e) => void send(t.prefix, t.uploadField, e.target.files?.[0])} />
              </>
            )}
          </li>
        ))}
      </ul>
      {message && <p role="status">{message}</p>}
    </div>
  );
}
