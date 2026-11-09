// "Am I signed in?" for pages that must not load Firebase (the header). Written by the auth watcher on account and
// admin pages; a hint only: the account pages re-check the real session, so a stale value costs one extra click.
const KEY = 'mms.signedIn';
const EVENT = 'mms-signed-in';

export function readSignedInHint(): boolean {
  try {
    return localStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
}

export function setSignedInHint(signedIn: boolean): void {
  try {
    if (signedIn) localStorage.setItem(KEY, '1');
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
