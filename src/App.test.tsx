import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';
import { announcements, journey, openClimbs, mountains, programs, surveys } from './data/content';
import { photoCredits } from './data/credits';
import { bmcPage, openClimbsPage, outreachPage, sartPage } from './data/pages';

const renderAt = (path: string) => render(<MemoryRouter initialEntries={[path]}><App /></MemoryRouter>);

describe('Home page', () => {
  it('renders the hero headline and official logo', () => {
    const { container } = renderAt('/');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Go beyondthe trail.');
    expect(container.querySelector('.brand-mark img')).toHaveAttribute('src', '/mms-logo.png');
  });

  it('renders every section anchor used by the navigation', () => {
    const { container } = renderAt('/');
    for (const id of ['home', 'about', 'journey', 'programs', 'mountains', 'open-climbs', 'announcements', 'membership', 'gallery', 'faq', 'join']) {
      expect(container.querySelector(`#${id}`)).toBeInTheDocument();
    }
  });

  it('renders content entries and a preview of open climbs', () => {
    renderAt('/');
    // "Open Climbs" appears as both a journey step and a program card.
    programs.forEach((p) => expect(screen.getAllByRole('heading', { name: p.title }).length).toBeGreaterThan(0));
    journey.forEach((step) => expect(screen.getAllByRole('heading', { name: step.title }).length).toBeGreaterThan(0));
    mountains.forEach((m) => expect(screen.getAllByRole('heading', { name: m.name }).length).toBeGreaterThan(0));
    openClimbs.slice(0, 4).forEach((c) => expect(screen.getAllByRole('heading', { name: c.title }).length).toBeGreaterThan(0));
    expect(screen.getByRole('link', { name: /see all open climbs/i })).toHaveAttribute('href', '/open-climbs');
  });

  it('links each program card to its page', () => {
    renderAt('/');
    for (const p of programs) {
      expect(document.querySelector(`#programs a[href="${p.cta.href}"]`)).toBeInTheDocument();
    }
  });
});

describe('Program pages', () => {
  it.each([bmcPage, openClimbsPage, outreachPage, sartPage])('renders $path', (page) => {
    renderAt(page.path);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(page.title);
    page.sections.forEach((s) => expect(screen.getByRole('heading', { name: s.title })).toBeInTheDocument());
  });

  it('lists every open climb on /open-climbs', () => {
    renderAt('/open-climbs');
    openClimbs.forEach((c) => expect(screen.getByRole('heading', { name: c.title })).toBeInTheDocument());
  });

  it("lists every announcement on /announcements", () => {
    renderAt("/announcements");
    announcements.forEach((a) => expect(screen.getByRole("heading", { name: a.title })).toBeInTheDocument());
  });

  it("lists every survey on /surveys, with a button only for open ones", () => {
    renderAt("/surveys");
    surveys.forEach((s) => expect(screen.getByRole("heading", { name: s.title })).toBeInTheDocument());
    expect(screen.getAllByRole("link", { name: "Take survey" })).toHaveLength(surveys.filter((s) => s.status === "Open").length);
  });

  it("credits every local photo on /credits", () => {
    const { container } = renderAt("/credits");
    expect(container.querySelectorAll(".credits li")).toHaveLength(photoCredits.length);
  });
});
