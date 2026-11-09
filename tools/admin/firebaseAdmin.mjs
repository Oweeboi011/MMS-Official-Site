// Shared setup for the owner-only admin scripts: firebase-admin from the functions package, gcloud Application
// Default Credentials (`gcloud auth application-default login`), project from .env.local or --project.
import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(new URL('../../src/backend/functions/package.json', import.meta.url));
const { initializeApp, getApps } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
export { FieldValue };

function envProject() {
  if (process.env.VITE_FIREBASE_PROJECT_ID) return process.env.VITE_FIREBASE_PROJECT_ID;
  if (!existsSync('.env.local')) return '';
  const key = 'VITE_FIREBASE_PROJECT_ID=';
  const line = readFileSync('.env.local', 'utf8').split('\n').find((l) => l.startsWith(key));
  return line ? line.slice(key.length).split(' #')[0].trim() : '';
}

export function args() {
  const all = process.argv.slice(2);
  const at = all.indexOf('--project');
  const project = at >= 0 ? all[at + 1] : envProject();
  const rest = all.filter((_, i) => at < 0 || (i !== at && i !== at + 1));
  return { project, flags: rest.filter((a) => a.startsWith('--')), positional: rest.filter((a) => !a.startsWith('--')) };
}

export function connect(project) {
  if (!project) throw new Error('No project: set VITE_FIREBASE_PROJECT_ID in .env.local or pass --project <id>.');
  if (!getApps().length) initializeApp({ projectId: project });
  const db = getFirestore();
  db.settings({ databaseId: 'openclimbs' });
  return { db, auth: getAuth() };
}

// By uid or email; the users/ profile's email is admin-editable, so Auth is the source of truth.
export async function findAccount(auth, who) {
  try {
    return who.includes('@') ? await auth.getUserByEmail(who) : await auth.getUser(who);
  } catch {
    throw new Error(`No sign-in account for ${who}.`);
  }
}

export async function main(run) {
  try {
    await run();
  } catch (e) {
    console.error(e instanceof Error ? e.message : e);
    process.exit(1);
  }
}
