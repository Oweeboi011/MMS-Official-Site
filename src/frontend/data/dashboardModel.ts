import type { AdminReg } from './adminRegistrations';
import type { ScheduleClimb } from './climbs';

// The admin Open Climbs dashboard (old app Dashboard): every climb grouped by status with registration counts, headline
// totals, and the newest registrations. Pure data; the service fills it from Firestore counts.
export interface DashboardRow {
  climb: ScheduleClimb & { id: string };
  status: string;
  confirmed: number;
  pending: number;
  waitlisted: number;
  unpaid: number;
  toReview: number;
  fee: string; // member total, e.g. "₱3,590" or "TBA"
}

interface DashboardTotals { climbs: number; registrations: number; toReview: number; unpaid: number; pending: number }
export interface DashboardData { rows: DashboardRow[]; totals: DashboardTotals; recent: AdminReg[] }

const STATUS_ORDER = ['open', 'draft', 'closed', 'completed', 'cancelled'] as const;
const LABEL: Record<string, string> = { open: 'Open', draft: 'Drafts', closed: 'Closed', completed: 'Completed', cancelled: 'Cancelled' };
export const PAST_GROUPS = ['completed', 'cancelled'];

// Non-empty groups in the old app's order; a status it doesn't know comes last under its own name.
export function groupByStatus(rows: DashboardRow[]): { status: string; label: string; rows: DashboardRow[] }[] {
  const known = STATUS_ORDER.map((status) => ({ status: status as string, label: LABEL[status], rows: rows.filter((r) => r.status === status) }));
  const others = [...new Set(rows.map((r) => r.status))].filter((s) => !(STATUS_ORDER as readonly string[]).includes(s));
  return [...known, ...others.map((status) => ({ status, label: status || 'No status', rows: rows.filter((r) => r.status === status) }))].filter((g) => g.rows.length > 0);
}
