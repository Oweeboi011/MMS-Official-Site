// Public membership inquiry: one Firestore REST create (no SDK on public pages); createdAt is server time, as the rules require.
import { inquiryFields, type InquiryForm } from '../data/inquiry';
import { DATABASE_ID, firebaseConfig, firebaseConfigured, writesEnabled } from './firebaseEnv';

export const inquiriesOpen = firebaseConfigured && writesEnabled;

export async function sendInquiry(form: InquiryForm): Promise<void> {
  const { projectId, apiKey } = firebaseConfig;
  const root = `projects/${projectId}/databases/${DATABASE_ID}/documents`;
  const id = `${Date.now().toString(36)}${Array.from(crypto.getRandomValues(new Uint8Array(4)), (b) => b.toString(16).padStart(2, '0')).join('')}`;
  const body = {
    writes: [{ update: { name: `${root}/inquiries/${id}`, fields: inquiryFields(form) }, updateTransforms: [{ fieldPath: 'createdAt', setToServerValue: 'REQUEST_TIME' }], currentDocument: { exists: false } }],
  };
  const res = await fetch(`https://firestore.googleapis.com/v1/${root}:commit?key=${apiKey}`, { method: 'POST', body: JSON.stringify(body) });
  if (!res.ok) throw new Error(res.status === 429 ? 'Too many messages right now. Try again later.' : `HTTP ${res.status}`);
}
