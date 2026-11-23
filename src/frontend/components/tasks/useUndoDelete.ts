import { useCallback, useEffect, useRef, useState } from 'react';
import type { Task } from '../../data/tasks';

// A delete waits a few seconds so Undo can cancel it; leaving the page or deleting another task sends it now.
export function useUndoDelete(remove: (t: Task) => Promise<boolean>, delayMs = 6000) {
  const [pending, setPending] = useState<Task | null>(null);
  const current = useRef<Task | null>(null);
  const removeRef = useRef(remove);
  useEffect(() => { removeRef.current = remove; current.current = pending; });
  useEffect(() => {
    if (!pending) return;
    const timer = setTimeout(() => {
      current.current = null; // so an unmount or another Delete before the re-render does not remove it twice
      setPending(null);
      void removeRef.current(pending);
    }, delayMs);
    return () => clearTimeout(timer);
  }, [pending, delayMs]);
  useEffect(() => () => { if (current.current) void removeRef.current(current.current); }, []);
  const request = useCallback((t: Task) => {
    if (current.current) void removeRef.current(current.current);
    setPending(t);
  }, []);
  return { pending, request, undo: () => setPending(null) };
}
