// "Am I signed in?" for pages that must not load Firebase (the header). Written by the auth watcher on account and
// admin pages; a hint only: the account pages re-check the real session, so a stale value costs one extra click.
const KEY = 'mms.signedIn';
const EVENT = 'mms-signed-in';

function stored(): string | null {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export const readSignedInHint = (): boolean => stored() !== null;
export const readAdminHint = (): boolean => stored() === 'admin'; // shows the header's Admin link; /admin still checks the real role

export function setSignedInHint(signedIn: boolean, role?: string): void {
  try {
    if (signedIn) localStorage.setItem(KEY, role === 'admin' ? 'admin' : '1');
    else localStorage.removeItem(KEY);
  } catch {
    // storage blocked: the header just keeps offering "Sign in"
  }
  window.dispatchEvent(new Event(EVENT));
}

export function subscribeSignedInHint(onChange: () => void): () => void {
  window.addEventListener(EVENT, onChange);
  window.addEventListener('storage', onChange);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener('storage', onChange);
  };
}
