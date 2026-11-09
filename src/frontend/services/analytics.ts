// #156 anonymous page views + client errors, written over Firestore REST (no SDK on public pages). Signed-out shape only:
// userId null, role 'guest' (rules: analyticsIdentityIsHonest). Kept 90 days (expireAt TTL; privacy notice). Off on
// preview (read-only builds), in dev and in tests.
import { DATABASE_ID, firebaseConfig, firebaseConfigured, useEmulators, writesEnabled } from './firebaseEnv';

const enabled = firebaseConfigured && writesEnabled && !useEmulators && !import.meta.env.DEV && import.meta.env.MODE !== 'test';
const RETAIN_MS = 90 * 86400_000;

type Value = { stringValue: string } | { nullValue: null } | { timestampValue: string };
const s = (v: string): Value => ({ stringValue: v.slice(0, 500) });
const randomId = (bytes: number) => Array.from(crypto.getRandomValues(new Uint8Array(bytes)), (b) => b.toString(16).padStart(2, '0')).join('');

function sessionId(): string {
  try {
    const existing = sessionStorage.getItem('mms.sid');
    if (existing) return existing;
    const id = randomId(6);
    sessionStorage.setItem('mms.sid', id);
    return id;
  } catch {
    return 'no-storage';
  }
}

// One create with the server-time field set by Firestore (rules compare it to request.time).
function create(collection: string, fields: Record<string, Value>, serverTimeField: string) {
  if (!enabled) return;
  const { projectId, apiKey } = firebaseConfig;
  const root = `projects/${projectId}/databases/${DATABASE_ID}/documents`;
  const id = `${Date.now().toString(36)}${randomId(4)}`;
  const body = {
    writes: [{
      update: { name: `${root}/${collection}/${id}`, fields: { ...fields, expireAt: { timestampValue: new Date(Date.now() + RETAIN_MS).toISOString() } } },
      updateTransforms: [{ fieldPath: serverTimeField, setToServerValue: 'REQUEST_TIME' }],
      currentDocument: { exists: false },
    }],
  };
  // text/plain: no CORS preflight (same as publicData reads). Fire and forget.
  void fetch(`https://firestore.googleapis.com/v1/${root}:commit?key=${apiKey}`, { method: 'POST', body: JSON.stringify(body), keepalive: true }).catch(() => undefined);
}

export function logPageView(path: string) {
  if (/^\/(admin|account)(\/|$)/.test(path)) return; // signed-in pages: not anonymous traffic
  const climbId = /^\/climbs\/([\w-]+)/.exec(path)?.[1];
  create('pageViews', { path: s(path.slice(0, 300)), climbId: climbId ? s(climbId) : { nullValue: null }, userId: { nullValue: null }, userRole: s('guest'), sessionId: s(sessionId()) }, 'timestamp');
}

export function logClientError(source: string, message: string) {
  create('failedRequests', { type: s('client'), source: s(source.slice(0, 200)), message: s(message), path: s(location.pathname.slice(0, 300)), userId: { nullValue: null }, userRole: s('guest') }, 'createdAt');
}
