import { useCallback, useEffect, useRef, useState } from 'react';
import type { CollectionSpec } from '../data/siteSchemas';
import { listRows, type Row } from '../services/siteData';

// Rows of one collection. `reload` returns null (and sets `error`) when the list can't load.
export function useCollectionRows(spec: CollectionSpec, onFirstLoad: (rows: Row[]) => void) {
  const [rows, setRows] = useState<Row[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const live = useRef(true);
  const firstLoad = useRef(onFirstLoad);

  const accept = useCallback((list: Row[]) => {
    setRows(list);
    setLoaded(true);
    setError(null);
  }, []);

  const reload = useCallback(async (): Promise<Row[] | null> => {
    try {
      const list = await listRows(spec);
      if (live.current) accept(list);
      return list;
    } catch (e) {
      if (live.current) setError(`Couldn't load: ${(e as Error).message}`);
      return null;
    }
  }, [spec, accept]);

  useEffect(() => {
    let active = true; // per run: a slow response from an earlier run must not land
    live.current = true;
    listRows(spec)
      .then((list) => { if (active) { accept(list); firstLoad.current(list); } })
      .catch((e: Error) => { if (active) setError(`Couldn't load: ${e.message}`); });
    return () => { active = false; live.current = false; };
  }, [spec, accept]);

  const clearError = useCallback(() => setError(null), []);
  return { rows, loaded, error, reload, clearError, live };
}
