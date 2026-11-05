// Search index built from site data: subpages (+ blocks, program pages, page-body content), sections, surveys.
import type { SearchDoc } from '../lib/search';
import { announcements, faqs, gallery, joinSteps, journey, mountains, officers, openClimbs, surveys, videos } from './content';
import { glossary } from './glossary';
import { programPages, type ProgramPageData } from './pages';
import { sectionPath, sitemap, subpagePath } from './sitemap';
import { subpageContent, type ContentBlock } from './subpages';

function blockText(b: ContentBlock): (string | undefined)[] {
  const head = [b.eyebrow, b.title, b.intro];
  switch (b.type) {
    case 'text': return [...head, ...b.paragraphs];
    case 'stats': return [...head, ...b.items.flatMap((s) => [s.value, s.label])];
    case 'cards': return [...head, ...b.items.flatMap((c) => [c.tag, c.title, c.meta, c.description])];
    case 'steps': return [...head, ...b.items.flatMap((s) => [s.title, s.description])];
    case 'table': return [...head, ...b.columns, ...b.rows.flat()];
    case 'timeline': return [...head, ...b.items.flatMap((t) => [t.year, t.title, t.description])];
    case 'people': return [...head, ...b.items.flatMap((p) => [p.role, p.name, p.note])];
    case 'quotes': return [...head, ...b.items.flatMap((q) => [q.quote, q.name, q.meta])];
    case 'checklist': return [...head, ...b.items];
  }
}

const programText = (p: ProgramPageData) => [
  p.intro,
  ...p.facts.flatMap((f) => [f.value, f.label]),
  ...p.sections.flatMap((s) => [s.title, s.intro, ...s.items.flatMap((i) => [i.title, i.description])]),
  ...(p.checklist?.items ?? []),
  ...(p.blocks ?? []).flatMap(blockText),
];
const programs = new Map(programPages.map((p) => [p.path, programText(p)]));

// Content rendered by page-body components (App.tsx pageBodies), keyed by the page that shows it.
const steps = (list: { tag: string; title: string; description: string }[]) => list.flatMap((s) => [s.title, s.description]);
const extra: Record<string, string[]> = {
  '/about/our-story': officers.flatMap((o) => [o.role, o.name]),
  '/about/mission': steps(journey),
  '/about/glossary': glossary.flatMap((g) => [g.term, g.name, g.about]),
  '/explore/mountains': mountains.flatMap((m) => [m.name, m.region, m.description]),
  '/activities/upcoming': openClimbs.flatMap((c) => [c.title, c.location, c.dates, c.difficulty, c.type]),
  '/media/news': announcements.flatMap((a) => [a.category, a.title, a.summary]),
  '/media/photos': gallery.map((p) => p.alt),
  '/media/videos': videos.flatMap((v) => [v.title, v.place]),
  '/membership/join': [...steps(joinSteps), ...faqs.flatMap((f) => [f.q, f.a])],
};

const join = (parts: (string | undefined)[]) => parts.filter(Boolean).join(' · ');

const sections: SearchDoc[] = sitemap.map((s) => ({
  path: sectionPath(s), title: s.label, section: 'Section', text: join([s.heading, s.intro, ...s.pages.map((p) => p.label)]),
}));
const standalone: SearchDoc[] = [
  { path: '/surveys', title: 'Surveys', section: 'Media', text: join(surveys.flatMap((v) => [v.title, v.description])) },
];

const subpages: SearchDoc[] = sitemap.flatMap((section) =>
  section.pages.map((page) => {
    const path = subpagePath(section, page);
    return {
      path,
      title: page.label,
      section: section.label,
      text: join([page.summary, ...(subpageContent[path] ?? []).flatMap(blockText), ...(programs.get(path) ?? []), ...(extra[path] ?? [])]),
    };
  }),
);

export const searchIndex: SearchDoc[] = [...subpages, ...sections, ...standalone];
