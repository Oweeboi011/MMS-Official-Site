// Props shared by a registrant row and its parts (kept apart to avoid an import cycle).
import type { AdminReg } from '../../data/adminRegistrations';
import type { Account } from '../../services/auth';

export interface RowProps { reg: AdminReg; admin: Account; run: (action: () => Promise<void>) => void; busy: boolean; showClimb?: boolean }
