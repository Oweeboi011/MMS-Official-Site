import { GROUPS, rightsLabel } from '../../data/contentRights';
import type { UserRow } from '../../data/users';

// A person's groups (BOT, ExeCom, TCom) and what those let them do with page data (ADR 0010).
export default function GroupBoxes({ user, busy, onChange }: { user: UserRow; busy: boolean; onChange: (groups: string[]) => void }) {
  const toggle = (key: string, on: boolean) => onChange(on ? [...user.groups, key] : user.groups.filter((g) => g !== key));
  return (
    <>
      <fieldset className="group-boxes" disabled={busy}>
        <legend className="sr-only">Groups for {user.email}</legend>
        {GROUPS.map(([key, label]) => (
          <label key={key}><input type="checkbox" checked={user.groups.includes(key)} onChange={(e) => toggle(key, e.target.checked)} /> {label}</label>
        ))}
      </fieldset>
      <small>{rightsLabel(user)}</small>
    </>
  );
}
