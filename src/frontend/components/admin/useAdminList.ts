import { useCallback, useEffect, useState } from 'react';

// Loads a list, and runs officer actions one at a time, reloading after each.
export function useAdminList<T>(load: () => Promise<T[]>) {
  const [rows, setRows] = useState<T[] | null>(null);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const reload = useCallback(() => load().then(setRows, (e: Error) => setMessage(`Couldn’t load: ${e.message}`)), [load]);
  useEffect(() => { void reload(); }, [reload]);
  const run = useCallback(async (action: () => Promise<void>): Promise<boolean> => {
    setBusy(true);
    try {
      await action();
      setMessage('Saved.');
      await reload();
      return true;
    } catch (e) {
      setMessage(`Not saved: ${(e as Error).message}`);
      return false;
    } finally {
      setBusy(false);
    }
  }, [reload]);
  return { rows, message, busy, run };
}
