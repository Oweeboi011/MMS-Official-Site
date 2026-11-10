// Account rows for the admin Accounts page. Plain data: no Firebase here.
export interface UserRow { uid: string; email: string; name: string; role: string; createdAt: number; addedBy: string; canEmailMembers: boolean }

export const joinedLabel = (ms: number) => (ms ? new Date(ms).toLocaleDateString('en-PH', { dateStyle: 'medium', timeZone: 'Asia/Manila' }) : '—');

// "Added by" holds a uid (an admin made the account), 'self' (they signed up) or a script label.
export function addedByLabel(user: UserRow, all: UserRow[]): string {
  if (!user.addedBy || user.addedBy === 'self') return 'Signed up themselves';
  const who = all.find((u) => u.uid === user.addedBy);
  return who ? who.name || who.email : user.addedBy;
}

export const initials = (user: UserRow) => (user.name || user.email || '?').split(/[\s@.]+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('');
