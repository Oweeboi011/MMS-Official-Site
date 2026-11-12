import { useCallback, useState } from 'react';
import AccountTabs from '../components/AccountTabs';
import ContentEntryForm from '../components/admin/ContentEntryForm';
import DataTable from '../components/DataTable';
import { useAdminList } from '../components/admin/useAdminList';
import PageHero from '../components/PageHero';
import SignInForm from '../components/SignInForm';
import { STATUS_LABEL, entryActions, entrySummary, type Entry } from '../data/contentEntries';
import { CONTENT_PAGES, hasContentRights, isContentReviewer, rightsFor } from '../data/contentRights';
import { loadEntries, removeEntry, reviewEntry, saveEntry } from '../services/contentEntries';
import type { Account } from '../services/auth';
import { useAccount } from '../services/useAccount';

const pageLabel = (page: string) => CONTENT_PAGES.find(([p]) => p === page)?.[1] ?? page;

function Row({ entry, account, busy, canReview, onEdit, run }: { entry: Entry; account: Account; busy: boolean; canReview: boolean; onEdit: () => void; run: (a: () => Promise<void>) => Promise<boolean> }) {
  const person = { role: account.role, groups: account.groups ?? [] };
  const can = entryActions(entry.status, { mine: entry.submittedBy === account.uid, canReview, canPublish: rightsFor(person, entry.page).publish });
  return (
    <tr>
      <th scope="row">{entry.title}{entry.note && <small className="cell-note">Reviewer note: {entry.note}</small>}</th>
      <td>{pageLabel(entry.page)}</td>
      <td>{STATUS_LABEL[entry.status]}</td>
      <td>{entrySummary(entry)}{entry.submittedByName && ` · by ${entry.submittedByName}`}</td>
      <td><div className="editor-actions">
        {can.edit && <button type="button" className="chip" disabled={busy} onClick={onEdit}>Edit</button>}
        {can.publish && <button type="button" className="chip" disabled={busy} onClick={() => void run(() => reviewEntry(account, entry, 'published'))}>Publish</button>}
        {can.reject && <button type="button" className="chip" disabled={busy} onClick={() => void run(() => reviewEntry(account, entry, 'rejected', window.prompt('Why is it rejected? The submitter sees this.') ?? ''))}>Reject</button>}
        {can.unpublish && <button type="button" className="chip" disabled={busy} onClick={() => void run(() => reviewEntry(account, entry, 'draft'))}>Unpublish</button>}
        {can.remove && <button type="button" className="chip" disabled={busy} onClick={() => void run(() => removeEntry(entry))}>Delete</button>}
      </div></td>
    </tr>
  );
}

function Entries({ account }: { account: Account }) {
  const person = { role: account.role, groups: account.groups ?? [] };
  const canReview = isContentReviewer(person);
  const load = useCallback(() => loadEntries(account, canReview), [account, canReview]);
  const { rows, message, busy, run } = useAdminList(load);
  const [editing, setEditing] = useState<Entry | 'new' | null>(null);
  if (!rows) return <p role="status">{message || 'Loading…'}</p>;
  const waiting = rows.filter((e) => e.status === 'pending');
  return (
    <>
      {editing ? (
        <ContentEntryForm person={person} entry={editing === 'new' ? undefined : editing} busy={busy} onCancel={() => setEditing(null)}
          onSave={(input) => run(() => saveEntry(account, input, canReview))} />
      ) : (
        <p><button type="button" className="btn btn-primary" onClick={() => setEditing('new')}>New entry</button></p>
      )}
      {message && <p role="status">{message}</p>}
      {canReview && <p className="climb-muted">{waiting.length === 0 ? 'Nothing is waiting for review.' : `${waiting.length} waiting for review.`}</p>}
      {rows.length === 0 ? <p>No entries yet.</p> : (
        <DataTable caption="Your page content entries" head={['Entry', 'Page', 'Status', 'Details', 'Actions']}>
          {rows.map((e) => <Row key={e.id} entry={e} account={account} busy={busy} canReview={canReview} onEdit={() => setEditing(e)} run={run} />)}
        </DataTable>
      )}
      <p className="climb-muted">Published entries show on the public pages. Drafts and entries waiting for review are seen only by you and the reviewers (admins, BOT and ExeCom).</p>
    </>
  );
}

// ADR 0010: officers with rights submit page data here; reviewers publish it.
export default function ContentEntriesPage() {
  const state = useAccount();
  let body = <p role="status">Checking your sign-in…</p>;
  if (state.status === 'signedIn') {
    body = hasContentRights({ role: state.account.role, groups: state.account.groups ?? [] })
      ? <Entries account={state.account} />
      : <p>Your account doesn’t have content rights yet. Ask an admin to add you to BOT, ExeCom or TCom.</p>;
  } else if (state.status !== 'loading') body = <><p>Sign in to submit page content.</p><SignInForm /></>;
  return (
    <>
      <PageHero compact eyebrow="Account" title="Page content" intro="Submit and publish the data behind the public pages." image="/images/page-open-climbs.webp" />
      <main><section className="section page-section"><div className="shell register-shell"><AccountTabs />{body}</div></section></main>
    </>
  );
}
