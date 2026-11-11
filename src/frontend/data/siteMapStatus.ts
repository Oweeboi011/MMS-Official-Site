import { programPages } from './pages';
import { sitemap, subpagePath } from './sitemap';

// Admin site map: every page, whether it shows real content, and what an officer still has to supply.
// Pure: the service reads the counts and settings, this decides the status. Sample copy = not confirmed by officers.
export type PageState = 'live' | 'partial' | 'sample' | 'off';
export interface PageFacts {
  counts: Record<string, number>; // collection → documents
  settings: Record<string, string>; // siteSettings/site fields (blank when unset)
  openClimbs: number; // climbs people can see
  registrationOpen: boolean; // VITE_REGISTRATION_ENABLED
  unreadable?: string[]; // reads the rules or network refused: those pages are judged without that data
}
export interface MapPage { path: string; label: string; area: string; state: PageState; note: string; fix?: string }

export const STATE_LABEL: Record<PageState, string> = { live: 'Live', partial: 'Partial', sample: 'Sample copy', off: 'Off' };
const SAMPLE = 'Sample copy, not confirmed by officers.';
const EDIT = '/admin#site-content';

type Verdict = Pick<MapPage, 'state' | 'note' | 'fix'>;
type Rule = (f: PageFacts) => Verdict;
const live = (): Verdict => ({ state: 'live', note: 'Showing real data.' });
const sample = (note = SAMPLE, fix?: string): Verdict => ({ state: 'sample', note, fix });
const partial = (note: string, fix?: string): Verdict => ({ state: 'partial', note, fix });
const needs = (ok: boolean, whenMissing: Verdict): Verdict => (ok ? live() : whenMissing);
const has = (f: PageFacts, collection: string) => (f.counts[collection] ?? 0) > 0;
const hasSocial = (f: PageFacts) => Object.keys(f.settings).some((k) => k.startsWith('socials.') && f.settings[k]);

// Pages whose content comes from admin-edited data, by path; every other page is sample copy.
const RULES: Record<string, Rule> = {
  '/about/leadership': (f) => needs(has(f, 'officers'), sample('No officers entered: sample names are shown.', EDIT)),
  '/about/committees': (f) => needs(has(f, 'committees'), sample('No committees entered: sample list shown.', EDIT)),
  '/about/glossary': (f) => needs(has(f, 'glossary'), sample('Glossary not entered: sample terms shown.', EDIT)),
  '/media/news': (f) => needs(has(f, 'announcements'), partial('No announcements published yet.', EDIT)),
  '/media/photos': (f) => needs(has(f, 'media') || Boolean(f.settings.photoAlbumsUrl), sample('No MMS photos or albums added: stock photos shown.', EDIT)),
  '/media/stories': (f) => needs(has(f, 'reviews'), sample('No approved reviews yet: sample quotes shown.', EDIT)),
  '/activities/upcoming': (f) => needs(f.openClimbs > 0, partial('No climbs published.', '/admin')),
  '/activities/open-climbs': (f) => needs(f.openClimbs > 0, partial('No climbs published.', '/admin')),
  '/membership/join': (f) => needs(Boolean(f.settings.membershipEmail), partial('No membership email set; the inquiry form still works.', EDIT)),
  '/surveys': (f) => needs(has(f, 'surveys'), partial('No surveys listed.', EDIT)),
  '/': (f) => needs(Boolean(f.settings.contactName || f.settings.contactPhone) && hasSocial(f), partial('Contact details or social links missing in the footer.', EDIT)),
};

const ACCOUNTS = 'Accounts and registration';

// What each part of the site does, as far as the code can tell; things outside the browser's view are noted as such.
function features(f: PageFacts): MapPage[] {
  const closed: Verdict = { state: 'off', note: 'Closed until the switch from the old Open Climbs site.' };
  const reg = f.registrationOpen ? live() : closed;
  return [
    { path: '/account/sign-in', label: 'Sign in', area: ACCOUNTS, ...live() },
    { path: '/account/details', label: 'My details', area: ACCOUNTS, ...live() },
    { path: '/account/activities', label: 'My activities', area: ACCOUNTS, ...live() },
    { path: '/account/climbs', label: 'My climbs', area: ACCOUNTS, ...live() },
    { path: '/account/whats-new', label: 'What is new', area: ACCOUNTS, ...live() },
    { path: '/climbs/:id/register', label: 'Register for a climb', area: ACCOUNTS, ...reg },
    { path: '/account/climbs#pay', label: 'Pay and upload receipts', area: ACCOUNTS, ...reg },
    { path: '(email)', label: 'Emails to members', area: ACCOUNTS, state: 'off', note: 'Off until Brevo is set up (registration, payment and post-climb emails).' },
    { path: '(reminders)', label: 'Climb reminders', area: ACCOUNTS, state: 'off', note: 'The daily reminder job is off until the switch.' },
  ];
}

const ADMIN_PAGES: [string, string][] = [
  ['/admin', 'Admin home'], ['/admin/registrations', 'All registrations'], ['/admin/treasurer', 'Payments and treasurer'], ['/admin/users', 'Accounts and roles'],
  ['/admin/audit', 'Audit log'], ['/admin/insights', 'Insights'], ['/admin/sitemap', 'Site map'], ['/admin/help', 'Officer guide'],
];

export function siteMapPages(f: PageFacts): MapPage[] {
  const verdict = (path: string): Verdict => (RULES[path] ?? (() => sample()))(f);
  const programs = new Set(programPages.map((p) => p.path));
  const subpages = sitemap.flatMap((s) => s.pages.map((p) => {
    const path = subpagePath(s, p);
    return { path, label: programs.has(path) ? `${p.label} (program page)` : p.label, area: s.label, ...verdict(path) };
  }));
  return [
    { path: '/', label: 'Home', area: 'Home and search', ...verdict('/') },
    { path: '/surveys', label: 'Surveys', area: 'Home and search', ...verdict('/surveys') },
    ...subpages,
    ...features(f),
    ...ADMIN_PAGES.map(([path, label]): MapPage => ({ path, label, area: 'Admin', ...live() })),
  ];
}

export function stateCounts(pages: MapPage[]): Record<PageState, number> {
  const counts: Record<PageState, number> = { live: 0, partial: 0, sample: 0, off: 0 };
  for (const p of pages) counts[p.state] += 1;
  return counts;
}
