import { sitemap } from './sitemap';
import type { MapPage, PageFacts, PageState } from './siteMapStatus';

// The site map as a flow: Admin enters content → it is stored → pages show it. Anything not flowing yet is coloured.
// Pure layout data (React Flow draws it): three columns, sources → pages that depend on them → pages still on sample copy.
export type FlowState = PageState | 'info';
export interface FlowNode { id: string; x: number; y: number; title: string; sub: string; state: FlowState }
export interface FlowEdge { id: string; from: string; to: string; state: FlowState }

interface Source { id: string; label: string; ok: (f: PageFacts) => boolean; detail: (f: PageFacts) => string; pages: string[] }
const entered = (f: PageFacts, c: string) => f.counts[c] ?? 0;
const count = (c: string) => (f: PageFacts) => `${entered(f, c)} entered`;

const SOURCES: Source[] = [
  { id: 'officers', label: 'Officers (Admin → Leadership)', ok: (f) => entered(f, 'officers') > 0, detail: count('officers'), pages: ['/about/leadership'] },
  { id: 'committees', label: 'Committees', ok: (f) => entered(f, 'committees') > 0, detail: count('committees'), pages: ['/about/committees'] },
  { id: 'glossary', label: 'Glossary', ok: (f) => entered(f, 'glossary') > 0, detail: count('glossary'), pages: ['/about/glossary'] },
  { id: 'announcements', label: 'Announcements', ok: (f) => entered(f, 'announcements') > 0, detail: count('announcements'), pages: ['/media/news'] },
  { id: 'media', label: 'Photos and albums', ok: (f) => entered(f, 'media') > 0 || Boolean(f.settings.photoAlbumsUrl), detail: count('media'), pages: ['/media/photos'] },
  { id: 'reviews', label: 'Approved reviews', ok: (f) => entered(f, 'reviews') > 0, detail: count('reviews'), pages: ['/media/stories'] },
  { id: 'surveys', label: 'Surveys', ok: (f) => entered(f, 'surveys') > 0, detail: count('surveys'), pages: ['/surveys'] },
  { id: 'climbs', label: 'Published climbs', ok: (f) => f.openClimbs > 0, detail: (f) => `${f.openClimbs} open`, pages: ['/activities/upcoming', '/activities/open-climbs'] },
  { id: 'settings', label: 'Site settings (contact, socials)', ok: (f) => Boolean(f.settings.membershipEmail || f.settings.contactName), detail: (f) => (f.settings.membershipEmail || f.settings.contactName ? 'set' : 'blank'), pages: ['/', '/membership/join'] },
];
const SWITCH_FEATURES = ['Register for a climb', 'Pay and upload receipts', 'Climb reminders'];
const EMAIL_FEATURES = ['Emails to members'];

const GAP = 84;
const COL = [0, 330, 680];
const col = <T>(items: T[], make: (item: T, y: number) => FlowNode): FlowNode[] => items.map((item, i) => make(item, i * GAP));

export function buildFlow(pages: MapPage[], f: PageFacts): { nodes: FlowNode[]; edges: FlowEdge[] } {
  const byPath = new Map(pages.map((p) => [p.path, p]));
  const byLabel = new Map(pages.map((p) => [p.label, p]));
  const dataDriven = new Set(SOURCES.flatMap((s) => s.pages));
  const state = (p?: MapPage): FlowState => p?.state ?? 'sample';

  const sourceNodes: FlowNode[] = [
    ...col(SOURCES, (s, y) => ({ id: s.id, x: COL[0], y, title: s.label, sub: s.detail(f), state: s.ok(f) ? 'live' : 'partial' })),
    { id: 'switch', x: COL[0], y: SOURCES.length * GAP, title: 'Switch from the old site', sub: f.registrationOpen ? 'done' : 'not yet', state: f.registrationOpen ? 'live' : 'off' },
    { id: 'brevo', x: COL[0], y: (SOURCES.length + 1) * GAP, title: 'Brevo email account', sub: 'not set up', state: 'off' },
  ];
  const edges: FlowEdge[] = [];
  const pageNodes: FlowNode[] = [];
  let row = 0;
  const addPage = (id: string, p: MapPage | undefined, title: string, from: string) => {
    pageNodes.push({ id, x: COL[1], y: row++ * GAP, title, sub: p?.state === 'live' ? 'Live' : (p?.note ?? ''), state: state(p) });
    edges.push({ id: `${from}>${id}`, from, to: id, state: state(p) });
  };
  for (const s of SOURCES) for (const path of s.pages) addPage(`p:${path}`, byPath.get(path), byPath.get(path)?.label ?? path, s.id);
  for (const label of SWITCH_FEATURES) addPage(`f:${label}`, byLabel.get(label), label, 'switch');
  for (const label of EMAIL_FEATURES) addPage(`f:${label}`, byLabel.get(label), label, 'brevo');

  const sections = sitemap.map((s) => {
    const sample = pages.filter((p) => p.area === s.label && p.state === 'sample' && !dataDriven.has(p.path));
    return { label: s.label, sample };
  }).filter((s) => s.sample.length > 0);
  const sectionNodes: FlowNode[] = [
    { id: 'signoff', x: COL[1], y: row * GAP + 20, title: 'Officers confirm or replace the copy', sub: 'content sign-off', state: 'info' },
    ...col(sections, (s, y) => ({ id: `s:${s.label}`, x: COL[2], y, title: s.label, sub: `${s.sample.length} page${s.sample.length === 1 ? '' : 's'} on sample copy: ${s.sample.map((p) => p.label).join(', ')}`, state: 'sample' as const })),
  ];
  for (const s of sections) edges.push({ id: `signoff>s:${s.label}`, from: 'signoff', to: `s:${s.label}`, state: 'sample' });
  return { nodes: [...sourceNodes, ...pageNodes, ...sectionNodes], edges };
}
