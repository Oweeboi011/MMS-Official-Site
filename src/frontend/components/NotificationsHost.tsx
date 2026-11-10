import { Suspense, lazy, useEffect, useState } from 'react';
import { onOpenNotifications } from '../lib/notificationsModal';

const NotificationsModal = lazy(() => import('./myclimbs/NotificationsModal'));

// Mounted once in the app; renders nothing (and loads nothing) until the panel is first opened.
export default function NotificationsHost() {
  const [open, setOpen] = useState(false);
  useEffect(() => onOpenNotifications(() => setOpen(true)), []);
  if (!open) return null;
  return <Suspense fallback={null}><NotificationsModal onClose={() => setOpen(false)} /></Suspense>;
}
