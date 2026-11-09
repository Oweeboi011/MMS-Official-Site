// Tiles on the admin home: pages for running Open Climbs, looking after people and records, and site health.
export interface AdminTile { to: string; title: string; text: string }

export const climbTiles: AdminTile[] = [
  { to: '/admin/registrations', title: 'All registrations', text: 'Search and filter every registration, check payments, export a CSV.' },
  { to: '/admin/treasurer', title: 'Payments and treasurer', text: 'Cash in, refunds, expenses and net funds per climb.' },
];

export const recordTiles: AdminTile[] = [
  { to: '/admin/users', title: 'Accounts and roles', text: 'Create, correct and delete accounts; give or remove admin.' },
  { to: '/admin/audit', title: 'Audit log', text: 'Who changed what: payments, roles, deletions.' },
];

export const healthTiles: AdminTile[] = [
  { to: '/admin/insights', title: 'Insights', text: 'Function health, storage, cost, page views and recent errors.' },
  { to: '/admin/help', title: 'Officer guide', text: 'How each admin task works, step by step.' },
];
