import { useState } from 'react';
import { Link } from 'react-router-dom';
import PageHero from '../components/PageHero';
import SignInForm from '../components/SignInForm';
import { signOut } from '../services/auth';
import { useAccount } from '../services/useAccount';

export default function SignInPage() {
  const state = useAccount();
  const [error, setError] = useState<string | null>(null);
  return (
    <>
      <PageHero compact eyebrow="Account" title="Sign in" intro="Guests, members and officers: sign in with Google or your email. A free account; joining a climb doesn't need MMS membership." image="/images/page-surveys.webp" />
      <main>
        <section className="section">
          <div className="shell">
            {state.status === 'loading' && <p>Checking your sign-in…</p>}
            {state.status === 'unconfigured' && <p>Sign-in isn't set up on this copy of the site yet.</p>}
            {state.status === 'error' && (
              <div className="account-card">
                <p role="alert">Couldn't load your account: {state.error}</p>
                <button type="button" className="btn btn-dark" onClick={() => signOut().then(() => window.location.reload()).catch(() => setError('Sign-out failed. Check your connection and try again.'))}>Sign out and retry</button>
                {error && <p className="account-message" role="alert">{error}</p>}
              </div>
            )}
            {state.status === 'signedOut' && <SignInForm />}
            {state.status === 'signedIn' && (
              <div className="account-card">
                <p>Signed in as <strong>{state.account.email}</strong>{state.account.role === 'admin' ? ' (admin)' : ''}.</p>
                {state.account.role === 'admin' && <Link className="btn btn-primary" to="/admin">Open admin</Link>}
                <button type="button" className="btn btn-dark"
                  onClick={() => signOut().catch(() => setError('Sign-out failed. Check your connection and try again.'))}>Sign out</button>
                {error && <p className="account-message" role="alert">{error}</p>}
              </div>
            )}
          </div>
        </section>
      </main>
    </>
  );
}
