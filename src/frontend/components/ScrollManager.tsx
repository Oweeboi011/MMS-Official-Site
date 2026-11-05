import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Scrolls to the #hash target after route changes (e.g. /#faq from another page), otherwise to the top.
export default function ScrollManager() {
  const { pathname, hash, key } = useLocation();

  useEffect(() => {
    if (hash) {
      requestAnimationFrame(() => document.getElementById(hash.slice(1))?.scrollIntoView?.());
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname, hash, key]);

  return null;
}
