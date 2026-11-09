// Feature parity with mms-open-climbs.web.app (source: github.com/Oweeboi011/mms-open-climbs README).
// Each todo becomes a real test in its migration phase (docs/solution-plan/SOLUTION-PLAN.md). Count = remaining gap.
import { existsSync, readFileSync } from 'node:fs';

describe('Open Climbs parity: auth + users', () => {
  it.todo('sign in with email + Google; all old accounts work (hashes migrated)');
  // admin user management: create, correct (roles), delete, link walk-ins: tests/integration/adminUsers.test.tsx
});

describe('Open Climbs parity: member', () => {
  // schedule by year (season), rows with elevation, difficulty, distance: tests/unit/climbs.test.ts
  // mountain profile (stats, jump-off, gain, itinerary, water, links): tests/integration/liveContent.test.tsx (climb page)
  // trail photo carousel + keyboard lightbox: tests/integration/liveContent.test.tsx (climb page)
  // register: details, emergency contact, experience, medical; waitlist when full: tests/integration/register.test.tsx, liveContent (slots)
  // optional fees + fee breakdown before submit: tests/unit/registration.test.ts, tests/integration/register.test.tsx
  // digital waiver (typed name) + printable signed waiver: tests/integration/waiverPrint.test.tsx
  // GCash pay now/later, instalments, receipt upload: tests/integration/myClimbs.test.tsx
  // required documents upload (after registering): tests/integration/myClimbs.test.tsx
  // donation drive pledge: tests/unit/donations.test.ts, tests/integration/myClimbs.test.tsx
  // My Climbs: status, balance, payment log, next steps, self-cancel: tests/unit/myClimbs.test.ts
  // release notes page + one-time what's-new banner: tests/unit/releaseNotes.test.ts, tests/integration/whatsNew.test.tsx
  // rate a climb afterwards: tests/integration/myClimbs.test.tsx (feedback rules: rules.emulator.mjs)
  // notifications (on My Climbs; header bell would load Firebase on every page): tests/integration/myClimbs.test.tsx
  // first-login welcome (My Climbs, once per browser): tests/integration/myClimbs.test.tsx
  it.todo('emails: registration received, status updates, post-climb thank-you');
});

describe('Open Climbs parity: admin', () => {
  // dashboard: climbs with type, slots, confirmed, pending: tests/integration/account.test.tsx
  // climb detail: registrants, payments, split, refunds, walk-ins, no-shows, services, expenses, net funds, climb-day sheet: tests/unit/splitPayment.test.ts, adminClimb.test.tsx
  // climbs CRUD: open/close, cancel, postpone, fees, QR, officers, docs, meetings, announcements, drives: climbSchema.ts, MeetingsEditor (tests/unit/climbSchema.test.ts, climbNotices.test.ts)
  // all registrations: search, filters, CSV export: tests/integration/adminClimb.test.tsx
  // payments: cash flow, service headcounts: tests/unit/treasury.test.ts (/admin/treasurer)
  // analytics: page views, failedRequests log: services/analytics.ts (tests/unit/analytics.test.ts), /admin/insights
  // app insights dashboards: /admin/insights (tests/integration/adminInsights.test.tsx)
  it.todo('release notes publish + tracked member email send');
});

describe('Open Climbs parity: found in plan review 2026-11-09', () => {
  // weather forecast per climb (Open-Meteo) + PAGASA / Windy links: tests/integration/liveContent.test.tsx (climb page)
  // trail map embeds (AllTrails, Komoot, Google Maps): tests/integration/liveContent.test.tsx (climb page)
  // packing list + Leave No Trace ethics on the climb page: tests/integration/liveContent.test.tsx (climb page)
  // registrant-only section: participants, resources, pre-climb meetings, officers: tests/integration/registrantArea.test.tsx
  // admin audit log of sensitive actions: tests/integration/adminAudit.test.tsx
  // help and privacy pages: tests/integration/help.test.tsx, privacy.test.tsx
  it('installable app: web manifest + icons', () => {
    const manifest = JSON.parse(readFileSync('public/manifest.webmanifest', 'utf8')) as { display: string; start_url: string; icons: { src: string; sizes: string; purpose?: string }[] };
    expect(manifest.display).toBe('standalone');
    expect(manifest.start_url).toBe('/');
    expect(manifest.icons.map((i) => i.sizes)).toEqual(expect.arrayContaining(['192x192', '512x512']));
    expect(manifest.icons.some((i) => i.purpose === 'maskable')).toBe(true);
    for (const icon of manifest.icons) expect(existsSync(`public${icon.src}`)).toBe(true);
    expect(readFileSync('index.html', 'utf8')).toContain('rel="manifest"');
  });
  // accessibility checks (axe) on key pages: tests/e2e/a11y.spec.ts
  // verify-email banner after sign-up: tests/integration/myClimbs.test.tsx
  // edit registration details after submitting: tests/integration/myClimbs.test.tsx
  // view an uploaded receipt: My Climbs receipt links (tests/unit/slice4.test.ts)
  it.todo('registration and cancellation policy page (beginner guide done: /activities/open-climbs/guide)');
  // admin climb setup checklist: tests/unit/climbSetup.test.ts
  // compress images in the browser before upload: lib/compressImage.ts (tests/unit/slice4.test.ts)
  // member (/help) and officer (/admin/help) guides: tests/integration/help.test.tsx
  // lightweight markdown (**bold**) in announcements, surveys, guides: components/RichText (tests/unit/guide.test.tsx)
});
