import { useEffect, useState } from 'react';
import { watchAccount, type Account } from './auth';
import { firebaseConfigured } from './firebase';

export type AccountState =
  | { status: 'loading' | 'signedOut' | 'unconfigured' }
  | { status: 'error'; error: string }
  | { status: 'signedIn'; account: Account };

export function useAccount(): AccountState {
  const [state, setState] = useState<AccountState>(firebaseConfigured ? { status: 'loading' } : { status: 'unconfigured' });
  useEffect(() => {
    if (!firebaseConfigured) return undefined;
    return watchAccount(
      (account) => setState(account ? { status: 'signedIn', account } : { status: 'signedOut' }),
      (e) => setState({ status: 'error', error: e.message }),
    );
  }, []);
  return state;
}
