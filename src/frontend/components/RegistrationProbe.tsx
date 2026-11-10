import { useEffect } from 'react';
import type { MyClimb } from '../data/myClimbs';
import { myRegistrations } from '../services/registrations';
import { useAccount } from '../services/useAccount';

const LIVE = ['pending', 'confirmed', 'waitlisted'];

// Renders nothing: finds the signed-in member's live registration for this climb so the page can say so. Lazy, so
// visitors who aren't signed in never load the Firebase SDK on the climb page.
export default function RegistrationProbe({ climbId, onFound }: { climbId: string; onFound: (row: MyClimb | null) => void }) {
  const state = useAccount();
  const uid = state.status === 'signedIn' ? state.account.uid : '';
  useEffect(() => {
    if (!uid) return undefined;
    let live = true;
    myRegistrations(uid).then(
      (rows) => { if (live) onFound(rows.find((r) => r.climbId === climbId && LIVE.includes(r.status)) ?? null); },
      () => undefined, // can't tell: leave the normal buttons
    );
    return () => { live = false; };
  }, [uid, climbId, onFound]);
  return null;
}
