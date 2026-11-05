import { screen } from '@testing-library/react';
import { renderAt } from '../helpers';
import { announcements, openClimbs, surveys } from '../../src/frontend/data/content';
import { surveyState } from '../../src/frontend/lib/survey';
import { photoCredits } from '../../src/frontend/data/credits';
import { bmcPage, openClimbsPage, outreachPage, sartPage } from '../../src/frontend/data/pages';
import { legacyRedirects, sectionPath, sitemap, subpagePath } from '../../src/frontend/data/sitemap';

describe('Home page', () => {
  it('renders the hero headline and official logo', () => {
    const { container } = renderAt('/');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Looking fora new hobby?');
    expect(container.querySelector('.brand-mark img')).toHaveAttribute('src', '/mms-logo.png');
  });

  it('summarizes each section: first 3 cards + link to the full section page', () => {
    const { container } = renderAt('/');
    for (const section of sitemap) {
      const el = container.querySelector(`#${section.slug}`);
      expect(el).toBeInTheDocument();
      const hrefs = [...el!.querySelectorAll('.section-grid a')].map((a) => a.getAttribute('href'));
      expect(hrefs).toEqual(section.pages.slice(0, 3).map((p) => subpagePath(section, p)));
      const seeAll = el!.querySelector('.see-all');
      if (section.pages.length > 3) expect(seeAll).toHaveAttribute('href', sectionPath(section));
      else expect(seeAll).toBeNull();
    }
  });

  it('previews upcoming open climbs and the latest announcements', () => {
    renderAt('/');
    openClimbs.slice(0, 4).forEach((c) => expect(screen.getAllByRole('heading', { name: c.title }).length).toBeGreaterThan(0));
    announcements.slice(0, 3).forEach((a) => expect(screen.getByRole('heading', { name: a.title })).toBeInTheDocument());
    expect(screen.getByRole('link', { name: /see all open climbs/i })).toHaveAttribute('href', '/activities/open-climbs');
  });
});

describe('Program pages', () => {
  it.each([bmcPage, openClimbsPage, outreachPage, sartPage])('renders $path', (page) => {
    renderAt(page.path);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(page.title);
    page.sections.forEach((s) => expect(screen.getByRole('heading', { name: s.title })).toBeInTheDocument());
  });

  it('lists every open climb on /activities/open-climbs', () => {
    renderAt('/activities/open-climbs');
    openClimbs.forEach((c) => expect(screen.getByRole('heading', { name: c.title })).toBeInTheDocument());
  });

  it('lists every announcement on /media/news', () => {
    renderAt('/media/news');
    announcements.forEach((a) => expect(screen.getByRole('heading', { name: a.title })).toBeInTheDocument());
  });

  it('lists every survey on /surveys, with a button only for open ones', () => {
    renderAt('/surveys');
    surveys.forEach((s) => expect(screen.getByRole('heading', { name: s.title })).toBeInTheDocument());
    const open = surveys.filter((s) => surveyState(s, new Date()) === 'open').length;
    expect(screen.queryAllByRole('link', { name: 'Take survey' })).toHaveLength(open);
  });

  it('credits every local photo on /credits', () => {
    const { container } = renderAt('/credits');
    expect(container.querySelectorAll('.credits li')).toHaveLength(photoCredits.length);
  });
});

describe('Site structure', () => {
  it('shows Home plus the seven sections in the top nav, each linking to its home page section', () => {
    const { container } = renderAt('/');
    const links = [...container.querySelectorAll('.desktop-links a')];
    expect(links.map((a) => a.textContent)).toEqual(['Home', ...sitemap.map((s) => s.label)]);
    expect(links.map((a) => a.getAttribute('href'))).toEqual(['/', ...sitemap.map((s) => sectionPath(s))]);
  });

  it("highlights the current page's section in the top nav", () => {
    const { container } = renderAt('/training/amc');
    expect(container.querySelector('.desktop-links a[aria-current]')).toHaveTextContent('Training');
  });

  it.each(sitemap.map((s) => [sectionPath(s), s] as const))('section page %s lists every subpage', (path, section) => {
    const { container } = renderAt(path);
    const hrefs = [...container.querySelectorAll(`#${section.slug} .section-grid a`)].map((a) => a.getAttribute('href'));
    expect(hrefs).toEqual(section.pages.map((p) => subpagePath(section, p)));
  });

  it('explains abbreviations: tooltip in text, full list on the glossary page', () => {
    const { container } = renderAt('/about/glossary');
    expect(screen.getByText('Leave No Trace', { exact: false })).toBeInTheDocument();
    expect(container.querySelectorAll('.program-card').length).toBeGreaterThanOrEqual(5);
    const home = renderAt('/');
    expect(home.container.querySelector('abbr[title="Leave No Trace"]')).toBeInTheDocument();
  });

  it.each(sitemap.flatMap((s) => s.pages.map((p) => [subpagePath(s, p), s] as const)))('renders subpage %s with breadcrumbs and content', (path, section) => {
    const { container } = renderAt(path);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    const crumbs = [...container.querySelectorAll('.breadcrumbs a')].map((a) => a.getAttribute('href'));
    expect(crumbs).toEqual(['/', sectionPath(section)]);
    expect(screen.queryByRole('heading', { name: 'Coming soon.' })).not.toBeInTheDocument();
    expect(container.querySelector(`.related a[href="${sectionPath(section)}"]`)).toBeInTheDocument();
  });

  it.each(Object.entries(legacyRedirects))('redirects %s to %s', (from, to) => {
    const target = renderAt(to);
    const expected = screen.getByRole('heading', { level: 1 }).textContent;
    target.unmount();
    renderAt(from);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(expected ?? '');
  });
});

