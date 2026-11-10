// The notifications panel opens from the header bell and from My Climbs. This tiny event keeps those callers free of
// Firebase: the panel (and the SDK) only load once somebody opens it.
const EVENT = 'mms-open-notifications';

export const openNotifications = (): void => {
  window.dispatchEvent(new Event(EVENT));
};

export function onOpenNotifications(handler: () => void): () => void {
  window.addEventListener(EVENT, handler);
  return () => window.removeEventListener(EVENT, handler);
}
