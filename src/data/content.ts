export interface NavLink {
  label: string;
  href: string;
}

export interface Stat {
  value: string;
  label: string;
}

export interface JourneyStep {
  tag: string;
  title: string;
  description: string;
}

export interface Mountain {
  name: string;
  region: string;
  description: string;
  image: string;
  alt: string;
}

export interface OpenClimb {
  day: string;
  month: string;
  dates: string;
  title: string;
  location: string;
  difficulty: string;
  elevation?: string;
  type: 'Major' | 'Minor' | 'Special';
  status: 'Open' | 'Closed';
}

export interface Program {
  tag: string;
  title: string;
  description: string;
  accent: string;
  cta: NavLink;
}

export interface Officer {
  role: string;
  name: string;
}

export interface Faq {
  q: string;
  a: string;
}

export interface Photo {
  src: string;
  alt: string;
}

// Desktop nav is kept short; the footer lists every section.
export const navLinks: NavLink[] = [
  { label: 'About', href: '/#about' },
  { label: 'Programs', href: '/#programs' },
  { label: 'Open Climbs', href: '/open-climbs' },
  { label: 'News', href: '/announcements' },
  { label: 'FAQ', href: '/#faq' },
];

export const footerLinks: NavLink[] = [
  { label: 'About', href: '/#about' },
  { label: 'Our Journey', href: '/#journey' },
  { label: 'Programs', href: '/#programs' },
  { label: 'Mountains', href: '/#mountains' },
  { label: 'Open Climbs', href: '/open-climbs' },
  { label: 'Basic Mountaineering Course', href: '/bmc' },
  { label: 'Outreach Programs', href: '/outreach' },
  { label: 'SART', href: '/sart' },
  { label: 'Announcements', href: '/announcements' },
  { label: 'Surveys', href: '/surveys' },
  { label: 'How to Join', href: '/#membership' },
  { label: 'Gallery', href: '/#gallery' },
  { label: 'FAQ', href: '/#faq' },
];

// Placeholder contact details — replace before launch.
export const socials: NavLink[] = [
  { label: 'Facebook', href: 'https://facebook.com/' },
  { label: 'Instagram', href: 'https://instagram.com/' },
];

export const officers: Officer[] = [
  { role: 'President', name: 'To be announced' },
  { role: 'Vice President', name: 'To be announced' },
  { role: 'Training Director', name: 'To be announced' },
  { role: 'SART Lead', name: 'To be announced' },
];

export const joinSteps: JourneyStep[] = [
  { tag: '01', title: 'Join an open climb', description: 'Climb with us as a guest. No commitment, just the trail and the team.' },
  { tag: '02', title: 'Apply & orientation', description: 'Submit your application and attend the new-member orientation.' },
  { tag: '03', title: 'Basic Mountaineering Course', description: 'Complete BMC lectures and field sessions on safety, navigation, and LNT.' },
  { tag: '04', title: 'Graduation climb', description: 'Finish your graduation climb and get inducted. Once an MMS, forever an MMS.' },
];

export const faqs: Faq[] = [
  { q: 'Do I need to be a member to join an open climb?', a: 'No. Open climbs welcome guests. Register through the Open Climbs schedule and our team leaders will guide you.' },
  { q: 'I have never climbed before. Can I join?', a: 'Yes. Start with a climb marked beginner friendly or minor. Each climb lists its difficulty, distance, and elevation.' },
  { q: 'What do I need to bring?', a: 'Each climb has an itinerary with a gear list. Basics: backpack, water, trail food, rain gear, headlamp, and sturdy footwear.' },
  { q: 'How much does a climb cost?', a: 'Fees vary per climb and cover transport, permits, and guide fees. See each climb’s page for the breakdown.' },
  { q: 'Are there requirements for major climbs?', a: 'Major climbs may require a medical certificate, signed waiver, and permits. Requirements are listed per climb.' },
  { q: 'How do I become a member?', a: 'Join an open climb, apply, complete the Basic Mountaineering Course, and finish your graduation climb.' },
];

// Philippine mountain photos from Wikimedia Commons (see /credits) — swap in MMS climb photos later.
export const gallery: Photo[] = [
  { src: '/images/gallery-pulag-sunrise.webp', alt: 'Hikers watching the sunrise from the summit of Mt. Pulag, Benguet' },
  { src: '/images/gallery-lake-venado.webp', alt: 'Lake Venado on the slopes of Mt. Apo' },
  { src: '/images/gallery-batulao-ridge.webp', alt: 'Ridgeline of Mt. Batulao, Batangas' },
  { src: '/images/gallery-kibungan.webp', alt: 'Peaks above the pasture in Kibungan, Benguet' },
  { src: '/images/gallery-marami.webp', alt: 'Rock formation of Mt. Marami, Cavite' },
  { src: '/images/gallery-tarak.webp', alt: 'Campsite on Tarak Ridge, Mt. Mariveles, Bataan' },
];

export const heroMeta: Stat[] = [
  { value: '1994', label: 'Established' },
  { value: 'PH', label: 'Home trails' },
  { value: 'LNT', label: 'Trail ethics' },
];

export const motto = 'Once an MMS, forever an MMS.';

export const tickerItems = ['Train with purpose', 'Climb responsibly', 'Lead with courage', 'Protect every trail', motto];

export const stats: Stat[] = [
  { value: '30+', label: 'Years of heritage' },
  { value: '04', label: 'Core pathways' },
  { value: '03', label: 'Island groups' },
  { value: '01', label: 'Shared mission' },
];

export const journey: JourneyStep[] = [
  { tag: '01 / TRAIN', title: 'Training', description: 'Build field-ready skills through structured mountaineering education.' },
  { tag: '02 / EXPLORE', title: 'Open Climbs', description: 'Discover Philippine landscapes on community climbs open to members and guests.' },
  { tag: '03 / LEAD', title: 'Leadership', description: 'Develop sound judgment, teamwork, and responsibility on the trail.' },
  { tag: '04 / PROTECT', title: 'Conservation', description: 'Support trail care and responsible recreation in natural spaces.' },
];

export const programs: Program[] = [
  {
    tag: 'For new members',
    title: 'Basic Mountaineering Course',
    description: 'Our entry course: trail safety, navigation, gear, camp craft, Leave No Trace, and first aid, capped by a graduation climb.',
    accent: 'var(--navy)',
    cta: { label: 'Learn more', href: '/bmc' },
  },
  {
    tag: 'Open to all',
    title: 'Open Climbs',
    description: 'Member-led climbs open to guests. A low-commitment way to hike with MMS before you join.',
    accent: 'var(--green)',
    cta: { label: 'See climbs', href: '/open-climbs' },
  },
  {
    tag: 'Give back',
    title: 'Outreach Programs',
    description: 'Service in mountain communities: school supply drives, tree planting, and trail clean-ups.',
    accent: 'var(--gold)',
    cta: { label: 'Learn more', href: '/outreach' },
  },
  {
    tag: 'Safety',
    title: 'SART',
    description: 'Search and Rescue Team: trained members ready to respond to trail emergencies and keep every MMS climb safe.',
    accent: 'var(--red)',
    cta: { label: 'Learn more', href: '/sart' },
  },
];

export const mountains: Mountain[] = [
  {
    name: 'Mt. Pulag',
    region: 'Benguet · 2,926m',
    description: 'Luzon’s highest peak: grasslands, cold nights, and a sea of clouds at sunrise.',
    image: '/images/pulag-sea-of-clouds.webp',
    alt: 'Hikers on the grassland ridges of Mt. Pulag above a sea of clouds',
  },
  {
    name: 'Mt. Apo',
    region: 'Mindanao · 2,954m',
    description: 'The country’s highest summit. A demanding multi-day objective for prepared climbers.',
    image: '/images/apo.webp',
    alt: 'Mt. Apo rising above forested ridges and clouds',
  },
  {
    name: 'Mt. Batulao',
    region: 'Batangas · Weekend trail',
    description: 'Rolling green ridges a short drive from Manila. A favorite first climb.',
    image: '/images/batulao.webp',
    alt: 'The green ridges of Mt. Batulao under a cloudy sky',
  },
];

// Upcoming open climbs (as of Oct 6, 2026).
export const openClimbs: OpenClimb[] = [
  { day: '10', month: 'Oct', dates: 'Oct 10–11', title: 'Mt. Marami', location: 'Maragondon, Cavite', difficulty: 'Moderate', elevation: '633m', type: 'Minor', status: 'Open' },
  { day: '24', month: 'Oct', dates: 'Oct 24–26', title: 'Kibungan Cross Country', location: 'Kibungan, Benguet', difficulty: 'Advanced', elevation: '2,110m', type: 'Major', status: 'Open' },
  { day: '07', month: 'Nov', dates: 'Nov 7–8', title: 'Mt. Timbak – Mt. Tabayoc', location: 'Twin hike · Kabayan, Benguet', difficulty: 'Not yet rated', type: 'Minor', status: 'Open' },
  { day: '20', month: 'Nov', dates: 'Nov 20–22', title: 'Mt. Pulag', location: 'Tawangan–Akiki Trail · Benguet', difficulty: 'Advanced', elevation: '2,926m', type: 'Major', status: 'Open' },
  { day: '28', month: 'Nov', dates: 'Nov 28–30', title: 'Bakun Trilogy', location: 'Bakun, Benguet', difficulty: 'Advanced', elevation: '2,087m', type: 'Major', status: 'Open' },
  { day: '29', month: 'Nov', dates: 'Nov 29 – Dec 2', title: 'Mt. Kinabalu', location: 'Kota Kinabalu, Sabah, Malaysia', difficulty: 'Not yet rated', type: 'Special', status: 'Closed' },
  { day: '12', month: 'Dec', dates: 'Dec 12–13', title: 'Nasugbu Trilogy', location: 'Nasugbu, Batangas', difficulty: 'Not yet rated', type: 'Minor', status: 'Open' },
];

export const passportStats: Stat[] = [
  { value: '18', label: 'Climbs logged' },
  { value: '12', label: 'Summits' },
  { value: '05', label: 'Certificates' },
  { value: '62', label: 'Volunteer hours' },
];

export const membershipEmail = 'membership@example.com';

export interface Announcement {
  date: string;
  category: 'Climbs' | 'Training' | 'Outreach' | 'Club' | 'SART';
  title: string;
  summary: string;
}

export interface Survey {
  title: string;
  description: string;
  audience: 'Members' | 'Guests' | 'Everyone';
  closes: string;
  status: 'Open' | 'Closed';
  formUrl: string;
}

// Placeholder announcements — newest first.
export const announcements: Announcement[] = [
  { date: 'Oct 6, 2026', category: 'Climbs', title: 'Mt. Marami open climb this weekend', summary: 'Final briefing on Thursday night. Guests, bring your signed waiver and settle fees before the cut-off.' },
  { date: 'Oct 1, 2026', category: 'Training', title: 'BMC batch registration now open', summary: 'Slots for the next Basic Mountaineering Course batch are open. Lectures start in November.' },
  { date: 'Sep 28, 2026', category: 'Climbs', title: 'Medical certificates due for Pulag and Kibungan', summary: 'Major climb participants must submit a medical certificate before the deadline to keep their slot.' },
  { date: 'Sep 23, 2026', category: 'Club', title: 'Congratulations, Mt. Apo team!', summary: 'Our special climb to Mt. Apo is complete. Thank you to the team leaders and everyone who joined.' },
  { date: 'Sep 15, 2026', category: 'SART', title: 'SART first aid refresher', summary: 'Wilderness first aid and rope work drills for SART members and BMC graduates.' },
  { date: 'Sep 5, 2026', category: 'Outreach', title: 'School supply drive: call for donations', summary: 'Help us bring school supplies to a partner mountain community. Drop-off details to follow.' },
];

// Placeholder surveys — formUrl should point to the actual form (e.g. Google Forms).
export const surveys: Survey[] = [
  { title: 'Post-climb feedback: Mt. Apo', description: 'Tell us how the climb went: logistics, team leaders, and what we can improve.', audience: 'Everyone', closes: 'Oct 15, 2026', status: 'Open', formUrl: '#' },
  { title: '2027 climb wishlist', description: 'Which mountains should be on next year’s open climb calendar?', audience: 'Everyone', closes: 'Oct 31, 2026', status: 'Open', formUrl: '#' },
  { title: 'BMC interest check', description: 'Planning to take the Basic Mountaineering Course? Help us schedule the next batch.', audience: 'Guests', closes: 'Nov 7, 2026', status: 'Open', formUrl: '#' },
  { title: 'Member satisfaction survey', description: 'Annual survey on club activities, programs, and member experience.', audience: 'Members', closes: 'Sep 30, 2026', status: 'Closed', formUrl: '#' },
];
