import { useEffect, useState } from 'react';
import { parseStoredView, type StoredView } from '../../data/taskExtras';

// Remembers Table or Timeline and the filters for this person on this device.
export function useStoredView(uid: string) {
  const key = `mms.tasks.view.${uid}`;
  const [state, setState] = useState<StoredView>(() => parseStoredView(window.localStorage.getItem(key)));
  useEffect(() => {
    try { window.localStorage.setItem(key, JSON.stringify(state)); } catch { /* storage full or blocked: the view just is not remembered */ }
  }, [key, state]);
  return [state, setState] as const;
}
