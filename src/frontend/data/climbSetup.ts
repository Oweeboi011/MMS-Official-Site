// #171: what a climb still needs before members can register, pay and turn up prepared (old app utils/climbSetup).
import { rowsFromForm } from './records';
import type { FormValues } from './siteSchemas';

const has = (v: unknown) => String(v ?? '').trim() !== '';

export function setupGaps(v: FormValues): string[] {
  const gaps: string[] = [];
  if (!has(v.startDate)) gaps.push('Set the climb dates.');
  const slots = Number(v.maxParticipants);
  if (!Number.isFinite(slots) || slots <= 0) gaps.push('Set the slots: without a limit there is no waitlist.');
  const fees = rowsFromForm(v.fees).filter((r) => has(r.label));
  if (!fees.length) gaps.push('Add the fees.');
  else if (!has(v.gcashNumber) && !has(v.gcashQrUrl)) gaps.push('Add GCash details so members know where to pay.');
  if (!rowsFromForm(v.officers).some((r) => has(r.name))) gaps.push('Add the climb officers.');
  if (!has(v.description)) gaps.push('Describe the climb.');
  return gaps;
}
