import { fireEvent, screen, within } from '@testing-library/react';
import { renderAt } from '../helpers';
import { previewNotice } from '../../src/frontend/data/content';

// Firestore answers are injected; the REST client itself is covered in unit/liveContent.
const live = vi.hoisted(() => ({ settings: null as Record<string, unknown> | null, announcements: null as Record<string, unknown>[] | null, climbs: null as Record<string, unknown>[] | null, climb: null as Record<string, unknown> | null }));
vi.mock('../../src/frontend/services/publicData', () => ({
  publicReadsEnabled: true,
  loadSettings: async () => live.settings,
  announcementsLoader: () => async () => live.announcements,
  climbsLoader: () => async () => live.climbs,
  climbLoader: async () => live.climb,
  loadSurveys: async () => null,
  loadOfficers: async () => [{ body: 'execom', role: 'President', name: 'Live President', current: true, order: 1 }],
  loadCurrentOfficers: async () => [{ body: 'execom', role: 'President', name: 'Live President', current: true, order: 1 }],
}));

vi.mock('../../src/frontend/services/weather', () => ({
  useForecast: () => ({ status: 'ready', message: '', coords: { lat: 16.6, lng: 120.9 }, days: [{ date: '2026-11-20', label: 'Fri, Nov 20 · Rain', max: 14, min: 6, rainChance: 80 }] }),
}));

describe('pages read site content from Firestore', () => {
  beforeEach(() => {
    live.settings = null;
    live.announcements = null;
    live.climbs = null;
    live.climb = null;
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

  describe('climb page', () => {
    const soon = new Date(Date.now() + 10 * 86400_000);

    it('shows the climb, its stats, packing list and share links', async () => {
      live.climb = { id: 'pulag', title: 'Mt. Pulag', location: 'Benguet', type: 'major', status: 'open', startDate: soon, difficulty: '7/9', elevation: 2926, jumpOff: 'Ranger station', description: 'Sea of clouds.',
        fees: [{ label: 'Guide Fee', amount: '1500' }, { label: 'Guest Fee', amount: '450', optional: true, isGuestFee: true }, { label: 'Van', amount: 'TBA', optional: true, note: 'if availed' }],
        officers: [{ role: 'Team Leader', name: 'Ana Cruz', userId: 'u1' }] };
      renderAt('/climbs/pulag');
      expect(await screen.findByRole('heading', { level: 1, name: 'Mt. Pulag' })).toBeInTheDocument();
      expect(screen.getByText('2,926m')).toBeInTheDocument();
      expect(screen.getByText('Ranger station')).toBeInTheDocument();
      expect(screen.getByText('Sea of clouds.')).toBeInTheDocument();
      expect(screen.getByText('Head lamp')).toBeInTheDocument();
      expect(screen.getByRole('cell', { name: '₱1,500' })).toBeInTheDocument();
      expect(screen.getByRole('cell', { name: 'Guests only' })).toBeInTheDocument();
      expect(screen.getByRole('cell', { name: 'Optional: if availed' })).toBeInTheDocument();
      expect(screen.getByText('Ana Cruz')).toBeInTheDocument();
      const share = screen.getByRole('group', { name: 'Share this climb' });
      expect(within(share).getByRole('link', { name: 'Facebook' }).getAttribute('href')).toContain(encodeURIComponent('/climbs/pulag'));
      expect(within(share).getByRole('button', { name: 'Copy link' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Ask to join this climb/ })).toBeInTheDocument();
    });

    it('shows weather, trail maps and photos with a keyboard lightbox', async () => {
      live.climb = { id: 'p', title: 'Mt. Pulag', status: 'open', startDate: soon, location: 'Kabayan, Benguet',
        trailMaps: [{ label: 'Akiki', allTrailsUrl: 'https://www.alltrails.com/trail/philippines/benguet/akiki', komootUrl: 'https://www.komoot.com/tour/123?share_token=abc' }, { label: 'Ambangeg', googleMapsUrl: 'https://www.google.com/maps/@16.58,120.89,13z' }],
        // eslint-disable-next-line sonarjs/no-clear-text-protocols -- the http photo must be dropped
        trailImages: ['https://img.example/1.jpg', 'https://img.example/2.jpg', 'http://insecure/3.jpg'], waterSourceNote: 'Boil first.',
        itinerary: [{ day: 'Day 1', entries: [{ time: '04:00', activity: 'Start trek' }, { time: '', activity: '' }] }, { day: 'Day 2', entries: [] }] };
      renderAt('/climbs/p');
      expect(await screen.findByText('Fri, Nov 20 · Rain')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Windy' }).getAttribute('href')).toContain('16.6,120.9');
      expect(screen.getByTitle('Mt. Pulag trail map (AllTrails)')).toHaveAttribute('src', expect.stringContaining('alltrails.com/widget/trail/philippines/benguet/akiki'));
      expect(screen.getByTitle('Mt. Pulag route (Komoot)')).toHaveAttribute('src', expect.stringContaining('/tour/123/embed?share_token=abc'));
      fireEvent.click(screen.getByRole('button', { name: 'Ambangeg' }));
      expect(screen.getByTitle('Mt. Pulag location map')).toHaveAttribute('src', expect.stringContaining('maps.google.com/maps?q=16.58%2C120.89'));
      expect(screen.getByText(/Boil first\./)).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Day 1' })).toBeInTheDocument();
      expect(screen.getByText('Start trek')).toBeInTheDocument();
      expect(screen.queryByRole('heading', { name: 'Day 2' })).not.toBeInTheDocument(); // empty day dropped
      const thumbs = screen.getAllByRole('button', { name: /Open photo/ });
      expect(thumbs).toHaveLength(2); // http photo dropped
      fireEvent.click(thumbs[0]);
      const box = screen.getByRole('dialog', { name: 'Mt. Pulag photo 1 of 2' });
      fireEvent.keyDown(box, { key: 'ArrowRight' });
      expect(screen.getByRole('dialog', { name: 'Mt. Pulag photo 2 of 2' })).toBeInTheDocument();
      fireEvent.keyDown(box, { key: 'Escape' });
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('explains a cancelled climb instead of hiding the shared link', async () => {
      live.climb = { id: 'x', title: 'Mt. Gone', status: 'cancelled', startDate: soon };
      renderAt('/climbs/x');
      expect(await screen.findByText('This climb was cancelled.')).toBeInTheDocument();
      expect(screen.queryByRole('group', { name: 'Share this climb' })).not.toBeInTheDocument();
      expect(screen.queryByRole('link', { name: /Ask to join/ })).not.toBeInTheDocument();
    });

    it('says when a climb does not exist', async () => {
      renderAt('/climbs/nope');
      expect(await screen.findByRole('heading', { name: 'Climb not found' })).toBeInTheDocument();
    });
  });
});
