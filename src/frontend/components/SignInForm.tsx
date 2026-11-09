import { useState, type FormEvent } from 'react';
import { resetPassword, signInWithEmail, signInWithGoogle, signUpWithEmail } from '../services/auth';

type Mode = 'signIn' | 'signUp';

// Firebase error codes → plain words (the raw codes mean nothing to members).
const MESSAGES: Record<string, string> = {
  'auth/invalid-credential': 'Wrong email or password.',
  'auth/wrong-password': 'Wrong email or password.',
  'auth/email-already-in-use': 'That email already has an account. Sign in instead.',
  'auth/weak-password': 'Use at least 6 characters for the password.',
  'auth/invalid-email': 'That email address doesn\'t look right.',
  'auth/missing-email': 'Enter your email first.',
  'auth/too-many-requests': 'Too many tries. Wait a few minutes, then try again.',
  'auth/popup-closed-by-user': 'Google sign-in was closed before finishing.',
  'auth/cancelled-popup-request': 'Google sign-in was closed before finishing.',
  'auth/popup-blocked': 'Your browser blocked the Google window. Allow pop-ups for this site and try again.',
  'auth/network-request-failed': 'No connection. Check your internet and try again.',
};
const friendly = (e: unknown, context: 'signIn' | 'reset' = 'signIn'): string => {
  const code = (e as { code?: string }).code ?? '';
  if (code === 'auth/user-not-found') return context === 'reset' ? 'No account uses that email.' : 'Wrong email or password.';
  return MESSAGES[code] ?? 'Something went wrong. Try again.';
};

export default function SignInForm() {
  const [mode, setMode] = useState<Mode>('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const run = async (action: () => Promise<unknown>, done?: string, context: 'signIn' | 'reset' = 'signIn') => {
    setBusy(true);
    setMessage(null);
    try {
      await action();
      if (done) setMessage(done);
    } catch (e) {
      setMessage(friendly(e, context));
    } finally {
      setBusy(false);
    }
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    run(() => (mode === 'signIn' ? signInWithEmail(email, password) : signUpWithEmail(email, password)));
  };

  return (
    <div className="account-card">
      <button type="button" className="btn btn-dark" disabled={busy} onClick={() => run(signInWithGoogle)}>Continue with Google</button>
      <p className="account-or">or with email</p>
      <form className="account-form" onSubmit={submit}>
        <label htmlFor="account-email">Email</label>
        <input id="account-email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <label htmlFor="account-password">Password</label>
        <input id="account-password" type="password" autoComplete={mode === 'signIn' ? 'current-password' : 'new-password'} required minLength={6}
          value={password} onChange={(e) => setPassword(e.target.value)} />
        <button type="submit" className="btn btn-primary" disabled={busy}>{mode === 'signIn' ? 'Sign in' : 'Create account'}</button>
      </form>
      {message && <p className="account-message" role="status">{message}</p>}
      <div className="account-links">
        <button type="button" className="link-button" onClick={() => setMode(mode === 'signIn' ? 'signUp' : 'signIn')}>
          {mode === 'signIn' ? 'New here? Create an account' : 'Have an account? Sign in'}
        </button>
        {mode === 'signIn' && (
          <button type="button" className="link-button" disabled={!email || busy}
            onClick={() => run(() => resetPassword(email), 'Check your email for a reset link.', 'reset')}>Forgot password?</button>
        )}
      </div>
    </div>
  );
}
