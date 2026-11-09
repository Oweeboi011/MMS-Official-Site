import { useState } from 'react';
import type { Account } from '../services/auth';
import { resendVerification } from '../services/auth';

// #167: email accounts confirm their address (confirmations and payment updates go there).
export default function VerifyEmailBanner({ account }: { account: Account }) {
  const [state, setState] = useState<'idle' | 'sent' | 'error'>('idle');
  if (account.emailVerified) return null;
  const resend = () => resendVerification().then(() => setState('sent'), () => setState('error'));
  return (
    <p className="climb-notice" role="note">
      Please verify {account.email}: open the link we emailed you, then reload this page.{' '}
      {state === 'idle' && <button type="button" className="link-button" onClick={() => void resend()}>Resend the link</button>}
      {state === 'sent' && 'Sent. Check your inbox and spam folder.'}
      {state === 'error' && 'Couldn’t send just now. Try again in a few minutes.'}
    </p>
  );
}
