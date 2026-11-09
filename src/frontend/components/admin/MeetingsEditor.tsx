import { useEffect, useState } from 'react';
import { meetingCodec, meetingColumns, resourceCodec, resourceColumns } from '../../data/climbPrivate';
import { rowsFromForm, rowsProblem, rowsToForm } from '../../data/records';
import { loadClimbPrivateRaw, saveClimbPrivate } from '../../services/climbPrivate';
import RecordsInput from '../RecordsInput';

// Registrants-only meetings + resources for one climb (climbPrivate; admins write).
export default function MeetingsEditor({ climbId, run, busy }: { climbId: string; run: (a: () => Promise<void>) => Promise<boolean>; busy: boolean }) {
  const [meetings, setMeetings] = useState<string | null>(null);
  const [resources, setResources] = useState('[]');
  const [problem, setProblem] = useState('');
  useEffect(() => {
    let live = true;
    loadClimbPrivateRaw(climbId).then((d) => {
      if (!live) return;
      setMeetings(rowsToForm(meetingCodec.decode(d.preClimbMeetings)));
      setResources(rowsToForm(resourceCodec.decode(d.resources)));
    }, () => { if (live) setMeetings('[]'); });
    return () => { live = false; };
  }, [climbId]);
  if (meetings === null) return null;
  const save = () => {
    const p = rowsProblem('Meetings', meetingColumns, rowsFromForm(meetings)) ?? rowsProblem('Resources', resourceColumns, rowsFromForm(resources));
    setProblem(p ?? '');
    if (!p) void run(() => saveClimbPrivate(climbId, { preClimbMeetings: meetingCodec.encode(rowsFromForm(meetings)), resources: resourceCodec.encode(rowsFromForm(resources)) }));
  };
  return (
    <details className="register-section">
      <summary><strong>Pre-climb meetings and resources (registrants only)</strong></summary>
      <RecordsInput id="pcm" label="Pre-climb meetings" columns={meetingColumns} value={meetings} disabled={busy} onChange={setMeetings} />
      <RecordsInput id="res" label="Resources" columns={resourceColumns} value={resources} disabled={busy} onChange={setResources} />
      {problem && <p role="alert" className="field-error">{problem}</p>}
      <button type="button" className="btn btn-primary" disabled={busy} onClick={save}>Save meetings and resources</button>
    </details>
  );
}
