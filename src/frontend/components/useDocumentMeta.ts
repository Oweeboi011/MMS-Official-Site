import { useEffect } from 'react';

const DESCRIPTION_MAX = 160;

// Tab title and meta description for the page on screen; the previous values come back when it leaves.
export function useDocumentMeta(title: string, description: string) {
  useEffect(() => {
    const previousTitle = document.title;
    const meta = document.head.querySelector<HTMLMetaElement>('meta[name="description"]');
    const previousDescription = meta?.content ?? '';
    document.title = `${title} | MMS`;
    if (meta) meta.content = description.slice(0, DESCRIPTION_MAX);
    return () => {
      document.title = previousTitle;
      if (meta) meta.content = previousDescription;
    };
  }, [title, description]);
}
