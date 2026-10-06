export interface SiteSubpage {
  slug: string;
  label: string;
  summary: string;
  // Hero photo; defaults to the section's.
  image?: string;
}

export interface SiteSection {
  slug: string;
  label: string;
  eyebrow: string;
  heading: string;
  intro: string;
  image: string;
  accent: string;
  pages: SiteSubpage[];
}

// Site structure: drives the top nav, home page sections, footer, and subpage routes.
// Placeholder summaries — replace with official MMS copy.
export const sitemap: SiteSection[] = [
  {
    slug: 'about',
    label: 'About MMS',
    eyebrow: 'Who we are',
    heading: 'Climbing together since 1994.',
    intro: 'A Philippine mountaineering organization built on training, responsible exploration, leadership, and conservation since 1994.',
    image: '/images/section-about.webp',
    accent: 'var(--navy)',
    pages: [
      { slug: 'our-story', label: 'Our Story', summary: 'How a group of city climbers became the Metropolitan Mountaineering Society.' },
      { slug: 'mission', label: 'Mission, Values & MMS Creed', summary: 'What we stand for on and off the trail, and the creed every member lives by.' },
      { slug: 'leadership', label: 'Leadership', summary: 'The officers and board who guide the society.' },
      { slug: 'committees', label: 'Committees', summary: 'The working teams that run our climbs, training, and programs.' },
      { slug: 'history', label: 'History', summary: 'Milestones, firsts, and expeditions from three decades of MMS.' },
    ],
  },
  {
    slug: 'explore',
    label: 'Explore',
    eyebrow: 'Where we climb',
    heading: 'Choose your next horizon.',
    intro: 'Mountains, trails, and destinations across the Philippines and beyond, with notes from the climbs we have logged.',
    image: '/images/section-explore.webp',
    accent: 'var(--green)',
    pages: [
      { slug: 'mountains', label: 'Mountains', summary: 'An information guide to Philippine mountains: elevation, difficulty, and jump-off points.' },
      { slug: 'trails', label: 'Trails', summary: 'Established itineraries for the routes MMS climbs regularly.' },
      { slug: 'climb-log', label: 'MMS Climb/Hike Log', summary: 'A running record of every climb and hike the society has completed.' },
      { slug: 'destinations', label: 'Destinations', summary: 'Regions and international destinations for major and special climbs.' },
    ],
  },
  {
    slug: 'activities',
    label: 'Activities',
    eyebrow: 'Climb with us',
    heading: 'Climb with us.',
    intro: 'Upcoming climbs and hikes, open climbs for guests, and special events on the MMS calendar.',
    image: '/images/section-activities.webp',
    accent: 'var(--green)',
    pages: [
      { slug: 'upcoming', label: 'Upcoming Climbs/Hikes', summary: 'The next climbs and hikes on the schedule.' },
      { slug: 'calendar', label: 'Calendar of Activities', summary: 'The full-year view of climbs, trainings, and club events.' },
      { slug: 'open-climbs', label: 'Open Climbs/Hikes', summary: 'Climbs open to members and guests alike. No membership needed.' },
      { slug: 'special-events', label: 'Special Events', summary: 'Anniversary climbs, expeditions abroad, and signature events.' },
    ],
  },
  {
    slug: 'training',
    label: 'Training',
    eyebrow: 'Learn to climb',
    heading: 'Train with purpose.',
    intro: 'Structured mountaineering education, from the basic course to advanced skills, first aid, and trail leadership.',
    image: '/images/section-training.webp',
    accent: 'var(--navy)',
    pages: [
      { slug: 'bmcm', label: 'BMCM', summary: 'The basic mountaineering course every new member takes, capped by a graduation climb.' },
      { slug: 'amc', label: 'AMC', summary: 'The advanced mountaineering course for members ready for harder objectives.' },
      { slug: 'outdoor-skills', label: 'Outdoor Skills', summary: 'Navigation, camp craft, rope work, and other field skills.' },
      { slug: 'first-aid', label: 'First Aid & BLS', summary: 'Wilderness first aid and basic life support training.' },
      { slug: 'leadership', label: 'Leadership', summary: 'Training for team leaders and assistant team leaders.' },
      { slug: 'safety', label: 'Safety', summary: 'Climb safety standards, risk planning, and Leave No Trace.' },
    ],
  },
  {
    slug: 'community',
    label: 'Community',
    eyebrow: 'Our people',
    heading: 'Stronger together.',
    intro: 'The members, volunteers, and rescue team behind MMS, and the communities and trails we give back to.',
    image: '/images/section-community.webp',
    accent: 'var(--gold)',
    pages: [
      { slug: 'members', label: 'Members', summary: 'Meet the people who make up the society.' },
      { slug: 'outreach', label: 'Outreach', summary: 'School drives, community support, and service in mountain communities.' },
      { slug: 'conservation', label: 'Conservation', summary: 'Tree planting, trail clean-ups, and responsible recreation.' },
      { slug: 'sart', label: 'MMS-SART', summary: 'The MMS Search and Rescue Team, ready to respond to trail emergencies.' },
      { slug: 'volunteer', label: 'Volunteer', summary: 'Ways members and guests can lend a hand.' },
    ],
  },
  {
    slug: 'media',
    label: 'Media',
    eyebrow: 'Stories & updates',
    heading: 'Stories from the trail.',
    intro: 'News, stories, photos, videos, and publications from the MMS community.',
    image: '/images/section-media.webp',
    accent: 'var(--red)',
    pages: [
      { slug: 'news', label: 'News', summary: 'Club announcements and updates on climbs, training, and outreach.' },
      { slug: 'stories', label: 'Stories and Testimonials', summary: 'Climb stories and testimonials from members and guests.' },
      { slug: 'photos', label: 'Photos', summary: 'Moments from our climbs, trainings, and outreach.' },
      { slug: 'videos', label: 'Videos', summary: 'Climb videos, highlights, and event recordings.' },
      { slug: 'publications', label: 'Publications', summary: 'Newsletters, the coffee table book, and annual reports.' },
      { slug: 'archives', label: 'Archives', summary: 'Past announcements, publications, and records.' },
    ],
  },
  {
    slug: 'membership',
    label: 'Membership',
    eyebrow: 'Become an MMS',
    heading: 'Once an MMS, forever an MMS.',
    intro: 'Every member starts as a guest. Find out how to join, what members get, and where to sign in.',
    image: '/images/gallery-batulao-ridge.webp',
    accent: 'var(--red)',
    pages: [
      { slug: 'join', label: 'Join MMS', summary: 'The path from your first open climb to induction.' },
      { slug: 'benefits', label: 'Member Benefits', summary: 'Training, climbs, and the community you get as a member.' },
      { slug: 'login', label: 'Member Login', summary: 'Sign in to your member profile.' },
    ],
  },
];

// Each top-level section lives on the home page; its subpages have their own routes.
export const sectionPath = (section: SiteSection) => `/#${section.slug}`;
export const subpagePath = (section: SiteSection, page: SiteSubpage) => `/${section.slug}/${page.slug}`;

// Old URLs from the first version of the site, kept so shared links still work.
export const legacyRedirects: Record<string, string> = {
  '/bmc': '/training/bmcm',
  '/open-climbs': '/activities/open-climbs',
  '/outreach': '/community/outreach',
  '/sart': '/community/sart',
  '/announcements': '/media/news',
};
