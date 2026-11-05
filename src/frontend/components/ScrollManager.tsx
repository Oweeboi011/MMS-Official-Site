import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Scrolls to the #hash target after route changes (e.g. /#faq from another page), otherwise to the top.
// Navigations with state.keepScroll (e.g. typing in search) stay put.
export default function ScrollManager() {
  const { pathname, hash, key, state } = useLocation();
  const keepScroll = (state as { keepScroll?: boolean } | null)?.keepScroll === true;

  useEffect(() => {
    if (keepScroll) return;
    if (hash) {
      requestAnimationFrame(() => document.getElementById(hash.slice(1))?.scrollIntoView?.());
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname, hash, key, keepScroll]);

  return null;
}
