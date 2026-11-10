import { useState, type FormEvent } from 'react';
import type { UserRow } from '../../data/users';
import { createAccount, deleteAccount } from '../../services/users';

type Run = (a: () => Promise<void>) => Promise<boolean>;

// #135: create an account for someone (e.g. a walk-in who wants to see their climbs).
export function AddAccount({ run, busy }: { run: Run; busy: boolean }) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [note, setNote] = useState('');
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const at = email.trim().indexOf('@');
    if (at < 1 || !email.trim().slice(at + 1).includes('.')) return setNote('Enter a valid email.');
    let sent = true;
    const ok = await run(async () => { sent = (await createAccount(email, name)).emailSent; });
    if (!ok) return;
    setNote(sent ? 'Account created; a welcome email with a set-password link was sent.' : 'Account created. The welcome email isn’t set up yet: tell them to use “Forgot password” on the sign-in page.');
    setEmail('');
    setName('');
  };
  return (
    <form className="admin-filters" onSubmit={(e) => void submit(e)} noValidate>
      <label htmlFor="new-email">New account email</label>
      <input id="new-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <label htmlFor="new-name">Name</label>
      <input id="new-name" value={name} onChange={(e) => setName(e.target.value)} />
      <button type="submit" className="btn" disabled={busy}>Add account</button>
      {note && <p role="status">{note}</p>}
    </form>
  );
}

// Two clicks; never your own account (the callable refuses it too).
export function DeleteAccount({ user, run, busy }: { user: UserRow; run: Run; busy: boolean }) {
  const [confirm, setConfirm] = useState(false);
  if (!confirm) return <button type="button" className="link-button" disabled={busy} onClick={() => setConfirm(true)}>Delete</button>;
  return (
    <>
      <button type="button" className="chip" disabled={busy} onClick={() => void run(() => deleteAccount(user.uid, user.email))}>Confirm delete {user.email}</button>
      {' '}<button type="button" className="link-button" onClick={() => setConfirm(false)}>Keep</button>
    </>
  );
}
