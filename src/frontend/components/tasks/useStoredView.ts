import { useEffect, useState } from 'react';
import { parseStoredView, type StoredView } from '../../data/taskExtras';

function readStored(key: string): string | null {
  try { return window.localStorage.getItem(key); } catch { return null; } // blocked storage: start from the default view
}

// Remembers Table or Timeline and the filters for this person on this device. The page mounts per person (key={uid}).
export function useStoredView(uid: string) {
  const key = `mms.tasks.view.${uid}`;
  const [state, setState] = useState<StoredView>(() => parseStoredView(readStored(key)));
  useEffect(() => {
    try { window.localStorage.setItem(key, JSON.stringify(state)); } catch { /* storage full or blocked: the view just is not remembered */ }
  }, [key, state]);
  return [state, setState] as const;
}
