import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { logPageView } from '../services/analytics';

// #156: one anonymous page view per route change (production only; see services/analytics).
export default function PageViews() {
  const { pathname } = useLocation();
  useEffect(() => { logPageView(pathname); }, [pathname]);
  return null;
}
