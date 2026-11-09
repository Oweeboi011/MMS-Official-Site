import { screen, within } from '@testing-library/react';
import { renderAt } from '../helpers';
import { previewNotice } from '../../src/frontend/data/content';

// Firestore answers are injected; the REST client itself is covered in unit/liveContent.
const live = vi.hoisted(() => ({ settings: null as Record<string, unknown> | null, announcements: null as Record<string, unknown>[] | null, climbs: null as Record<string, unknown>[] | null }));
vi.mock('../../src/frontend/services/publicData', () => ({
  publicReadsEnabled: true,
  loadSettings: async () => live.settings,
  announcementsLoader: () => async () => live.announcements,
  climbsLoader: () => async () => live.climbs,
  loadSurveys: async () => null,
  loadOfficers: async () => [{ body: 'execom', role: 'President', name: 'Live President', current: true, order: 1 }],
  loadCurrentOfficers: async () => [{ body: 'execom', role: 'President', name: 'Live President', current: true, order: 1 }],
}));

describe('pages read site content from Firestore', () => {
  beforeEach(() => {
    live.settings = null;
    live.announcements = null;
    live.climbs = null;
  });

  it('keeps sample content while Firestore has nothing', async () => {
    renderAt('/media/news');
    expect(await screen.findByText(previewNotice)).toBeInTheDocument();
  });

  it('shows published announcements and the saved settings', async () => {
    live.announcements = [{ title: 'Live climb news', summary: 'S', category: 'Climbs', publishedAt: new Date('2026-11-09T02:00:00Z') }];
    live.settings = { previewNotice: '', membershipEmail: 'join@mms.org', socials: { facebook: 'https://facebook.com/mms' } };
    renderAt('/media/news');
    expect(await screen.findByRole('heading', { name: 'Live climb news' })).toBeInTheDocument();
    expect(screen.queryByText(previewNotice)).not.toBeInTheDocument();
    const footer = screen.getByRole('contentinfo');
    expect(within(footer).getByRole('link', { name: 'join@mms.org' })).toHaveAttribute('href', 'mailto:join@mms.org');
    expect(within(footer).getByRole('link', { name: 'Facebook' })).toHaveAttribute('href', 'https://facebook.com/mms');
  });

  it('lists only live officers on the leadership page, no sample names beside them', async () => {
    renderAt('/about/leadership');
    expect(await screen.findByText('Live President')).toBeInTheDocument();
    expect(screen.queryByText('Faye Roderos')).not.toBeInTheDocument(); // sample TComm
    expect(screen.queryByText('Past presidents')).not.toBeInTheDocument();
  });

  it('shows no sample contact while Firestore is still answering', () => {
    live.settings = { membershipEmail: 'join@mms.org' };
    renderAt('/');
    expect(screen.queryByText(previewNotice)).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'membership@example.com' })).not.toBeInTheDocument();
  });

  describe('open climbs', () => {
    const year = new Date().getFullYear();
    const at = (days: number) => new Date(Date.now() + days * 86400_000);

    it('lists upcoming climbs and this year’s completed ones, hides drafts and cancelled', async () => {
      live.climbs = [
        { id: 'a', title: 'Live Upcoming', status: 'open', type: 'major', startDate: at(10), difficulty: '4/9' },
        { id: 'b', title: 'Live Done', status: 'completed', type: 'minor', startDate: new Date(Date.UTC(year, 0, 2)) },
        { id: 'c', title: 'Live Draft', status: 'draft', startDate: at(5) },
        { id: 'd', title: 'Live Cancelled', status: 'open', cancellationStatus: 'cancelled', startDate: at(6) },
      ];
      renderAt('/activities/open-climbs');
      expect(await screen.findByRole('heading', { name: 'Live Upcoming' })).toBeInTheDocument();
      expect(screen.getByText(/Moderate \(4\/9\)/)).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: `Completed in ${year}` })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Live Done' })).toBeInTheDocument();
      expect(screen.queryByText('Live Draft')).not.toBeInTheDocument();
      expect(screen.queryByText('Live Cancelled')).not.toBeInTheDocument();
    });

    it('shows a past year without sample climbs', async () => {
      renderAt(`/activities/open-climbs?year=${year - 1}`);
      expect(await screen.findByText(`No climbs recorded for ${year - 1} yet.`)).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: `Climbs in ${year - 1}.` })).toBeInTheDocument();
    });
  });
});
