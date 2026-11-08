// Feature parity with mms-open-climbs.web.app (source: github.com/Oweeboi011/mms-open-climbs README).
// Each todo becomes a real test in its migration phase (docs/solution-plan/SOLUTION-PLAN.md). Count = remaining gap.

describe('Open Climbs parity: auth + users', () => {
  it.todo('sign in with email + Google; all old accounts work (hashes migrated)');
  it.todo('admin user management: create, correct, delete, roles, link walk-ins');
});

describe('Open Climbs parity: member', () => {
  it.todo('schedule by season, card grid with elevation, difficulty, distance');
  it.todo('mountain profile: elevation, jump-off, gain, itinerary, water, links');
  it.todo('trail photo carousel + keyboard lightbox');
  it.todo('register: details, emergency contact, experience, medical; waitlist when full');
  it.todo('optional fees + fee breakdown before submit');
  it.todo('digital waiver (typed name) + printable signed waiver');
  it.todo('GCash pay now/later, instalments, receipt upload');
  it.todo('required documents upload at registration or later');
  it.todo('donation drive pledge');
  it.todo('My Climbs: status, balance, payment log, next steps, self-cancel');
  it.todo('rate a climb afterwards');
  it.todo('release notes page + one-time what-is-new popup');
  it.todo('notification bell');
  it.todo('first-login welcome tour');
  it.todo('emails: registration received, status updates, post-climb thank-you');
});

describe('Open Climbs parity: admin', () => {
  it.todo('dashboard: climbs with type, slots, confirmed, pending');
  it.todo('climbs CRUD: open/close, cancel, postpone, fees, QR, officers, docs, meetings, announcements, drives');
  it.todo('climb detail: registrants, payments, split, refunds, walk-ins, no-shows, services, expenses, net funds, climb-day sheet');
  it.todo('all registrations: search, filters, CSV export');
  it.todo('payments: cash flow, service headcounts');
  it.todo('analytics: page views, failedRequests log');
  it.todo('app insights dashboards');
  it.todo('release notes publish + tracked member email send');
});

describe('Open Climbs parity: found in plan review 2026-11-09', () => {
  it.todo('weather forecast per climb (Open-Meteo) + PAGASA / Windy links');
  it.todo('trail map embeds (AllTrails, Komoot, Google Maps)');
  it.todo('packing list + Leave No Trace ethics on the climb page');
  it.todo('registrant-only section: participants, resources, pre-climb meetings, officer contacts');
  it.todo('admin audit log of sensitive actions');
  it.todo('help and privacy pages');
  it.todo('installable app: web manifest + icons');
  it.todo('accessibility checks (axe) on key pages');
  it.todo('verify-email banner after sign-up');
  it.todo('edit registration details after submitting');
  it.todo('view an uploaded receipt (receipt modal)');
  it.todo('beginner mountaineering guide + registration and cancellation policy text');
  it.todo('admin climb setup checklist (completeness before opening)');
  it.todo('compress images in the browser before upload');
  it.todo('member and admin help guides (old USER_MANUAL)');
  it.todo('render release notes and announcements with lightweight markdown');
});
