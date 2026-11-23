import { useEffect } from 'react';

// N, T and L act only when nobody is typing and no modifier is held, so screen reader and browser keys keep working.
export function useTaskShortcuts(enabled: boolean, keys: Record<string, () => void>) {
  useEffect(() => {
    if (!enabled) return;
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (e.ctrlKey || e.metaKey || e.altKey || target?.closest('input, select, textarea, [contenteditable]')) return;
      keys[e.key.toLowerCase()]?.();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [enabled, keys]);
}
