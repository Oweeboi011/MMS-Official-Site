import { screen, within } from '@testing-library/react';
import { renderAt } from '../helpers';
import { previewNotice } from '../../src/frontend/data/content';

// Firestore answers are injected; the REST client itself is covered in unit/liveContent.
const live = vi.hoisted(() => ({ settings: null as Record<string, unknown> | null, announcements: null as Record<string, unknown>[] | null }));
vi.mock('../../src/frontend/services/publicData', () => ({
  publicReadsEnabled: true,
  loadSettings: async () => live.settings,
  loadAnnouncements: async () => live.announcements,
  loadSurveys: async () => null,
  loadOfficers: async () => [{ body: 'execom', role: 'President', name: 'Live President', current: true, order: 1 }],
}));

describe('pages read site content from Firestore', () => {
  beforeEach(() => {
    live.settings = null;
    live.announcements = null;
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
});
