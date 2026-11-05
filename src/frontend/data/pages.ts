import type { Stat } from './content';
import type { ContentBlock } from './subpages';

interface PageItem {
  title: string;
  description: string;
}

interface PageSection {
  eyebrow: string;
  title: string;
  intro?: string;
  variant: 'cards' | 'steps';
  items: PageItem[];
}

export interface ProgramPageData {
  path: string;
  eyebrow: string;
  title: string;
  intro: string;
  image: string;
  accent: string;
  facts: Stat[];
  sections: PageSection[];
  checklist?: { title: string; items: string[] };
  // Extra content blocks shown after the sections.
  blocks?: ContentBlock[];
  cta: { title: string; text: string; label: string; href: string; external?: boolean };
}

// Placeholder program content — replace with official MMS details.
export const bmcPage: ProgramPageData = {
  path: '/training/bmcm',
  eyebrow: 'For new members',
  title: 'Basic Mountaineering Course',
  intro: 'A 6-month training period of lectures, demos, hands-on exercises, and workshops that gives every new member the knowledge and skills for a safe and fun climbing experience.',
  image: '/images/page-bmc.webp',
  accent: 'var(--navy)',
  facts: [
    { value: '6', label: 'Months of training' },
    { value: '9', label: 'Core modules' },
    { value: '4', label: 'Field climbs' },
    { value: 'LNT', label: 'Trail ethics' },
  ],
  sections: [
    {
      eyebrow: 'Curriculum',
      title: 'What you will learn.',
      variant: 'cards',
      items: [
        { title: 'Physical assessment', description: 'A baseline fitness check at the start of the course.' },
        { title: 'First Aid & Basic Life Support', description: 'Wilderness first aid and BLS for emergencies on the trail.' },
        { title: 'Camp management', description: 'Setting up, running, and breaking camp as a team.' },
        { title: 'Orienteering', description: 'Map reading, compass work, and staying oriented on the trail.' },
        { title: 'Cookfest', description: 'Outdoor cooking and meal planning, tested on the first minor climb.' },
        { title: 'Team building', description: 'Working as one batch, on and off the mountain.' },
        { title: 'Indoor wall climb', description: 'Climbing basics on an indoor wall.' },
        { title: 'Rappelling', description: 'Outdoor rappelling sessions, run in two batches.' },
        { title: 'Outdoor rock climb', description: 'Putting wall and rope skills to work on real rock.' },
      ],
    },
    {
      eyebrow: 'Built with experts',
      title: 'Where the curriculum comes from.',
      variant: 'cards',
      items: [
        { title: 'Philippine Air Force SAR Group', description: 'Rappelling and search and rescue.' },
        { title: 'Philippine National Red Cross', description: 'Wilderness First Aid.' },
        { title: 'DENR', description: 'NIPAS and environmental protection.' },
        { title: 'Leave No Trace', description: 'Outdoor ethics on every climb.' },
      ],
    },
    {
      eyebrow: 'Course flow',
      title: 'From lecture to summit.',
      variant: 'steps',
      items: [
        { title: 'Enroll', description: 'Submit your application and attend the BMC orientation.' },
        { title: 'Lectures', description: 'Attend the lecture modules with MMS instructors.' },
        { title: 'Field climbs', description: 'Two minor climbs (one with a night trek) and two major climbs.' },
        { title: 'Graduation & oath', description: 'Graduate in June, then take your oath at the MMS Christmas party.' },
      ],
    },
  ],
  checklist: {
    title: 'Requirements',
    items: ['At least 18 years old (or with guardian consent)', 'Completed application form', 'Medical certificate', 'Signed waiver', 'Course fee (announced per batch)'],
  },
  // BMC season calendar from the 2024 training season (metropolitanms.org).
  blocks: [
    {
      type: 'table', eyebrow: 'Season calendar', title: 'A BMC season, week by week.',
      intro: 'The 2024 season, as a guide to how each batch runs. Dates change every year.',
      columns: ['Date', 'Activity'],
      rows: [
        ['Jan 20', 'Orientation'],
        ['Jan 27–28', 'Basic Mountaineering Course for Members (BMCM)'],
        ['Feb 3–4', 'First Aid & Basic Life Support · Indoor wall climb · Outdoor rappelling (batch 1) · MMS Kiddie Camp'],
        ['Feb 17–18', 'Map reading, orienteering & team building'],
        ['Mar 2–3', 'First minor climb & cookfest'],
        ['Mar 16', 'MMS anniversary celebration'],
        ['Mar 30–31', 'Second minor climb with night trek'],
        ['Apr 13–14', 'First major climb'],
        ['Apr 27–28', 'Outdoor rappelling (batch 2) · Rock climb'],
        ['May 11–12', 'Second major climb'],
        ['May 25–26', 'Sportsfest'],
        ['Jun 8–9', 'Beachineering'],
        ['Jun 22–23', 'Graduation'],
        ['Jul–Dec', 'Open climb season'],
        ['Dec 7', 'MMS Christmas party & oath taking'],
      ],
    },
  ],
  cta: { title: 'Ready to start?', text: 'BMC batches open each season. Send us a message to reserve a slot in the next batch.', label: 'Ask about the next batch', href: '/#join' },
};

export const openClimbsPage: ProgramPageData = {
  path: '/activities/open-climbs',
  eyebrow: 'Guests welcome',
  title: 'Open Climbs',
  intro: 'Climbs open to members and non-members alike. No membership needed: join a climb, meet the community, and experience the MMS adventure firsthand.',
  image: '/images/page-open-climbs.webp',
  accent: 'var(--green)',
  facts: [
    { value: 'Minor', label: 'Day & overnight hikes' },
    { value: 'Major', label: 'Multi-day climbs' },
    { value: 'Special', label: 'Abroad & signature' },
    { value: 'All', label: 'Guests welcome' },
  ],
  sections: [
    {
      eyebrow: 'As a guest',
      title: 'What to expect.',
      variant: 'steps',
      items: [
        { title: 'Reserve a slot', description: 'Pick a climb below and message us to reserve your slot.' },
        { title: 'Pre-climb briefing', description: 'Get the itinerary, gear list, and requirements from your team leader.' },
        { title: 'Climb day', description: 'Hike with an MMS team leader, assistant team leader, and the group.' },
        { title: 'Stay connected', description: 'Enjoyed it? Join more climbs or start your path to membership.' },
      ],
    },
  ],
  checklist: {
    title: 'Before you register',
    items: ['Check the climb difficulty and distance', 'Read the itinerary and gear list', 'Prepare requirements (waiver, med cert for major climbs)', 'Settle the climb fee before the cut-off'],
  },
  cta: { title: 'Find your climb.', text: 'Message us to reserve a slot, ask about fees, or get the itinerary for any climb.', label: 'Ask to join a climb', href: '/#join' },
};

export const outreachPage: ProgramPageData = {
  path: '/community/outreach',
  eyebrow: 'Give back',
  title: 'Outreach Programs',
  intro: 'The trails we climb pass through communities that welcome us. Our outreach programs give back to the people and places that make every climb possible.',
  image: '/images/page-outreach.webp',
  accent: 'var(--gold)',
  facts: [
    { value: '01', label: 'School drives' },
    { value: '02', label: 'Tree planting' },
    { value: '03', label: 'Trail clean-ups' },
    { value: '04', label: 'Community support' },
  ],
  sections: [
    {
      eyebrow: 'Focus areas',
      title: 'How we give back.',
      variant: 'cards',
      items: [
        { title: 'School supply drives', description: 'Bringing school supplies to children in mountain communities.' },
        { title: 'Tree planting', description: 'Reforestation activities with local partners and LGUs.' },
        { title: 'Trail clean-ups', description: 'Clearing litter and maintaining the trails we love.' },
        { title: 'Community support', description: 'Relief and support for host communities when they need it most.' },
      ],
    },
  ],
  cta: { title: 'Volunteer with us.', text: 'Members and guests can join outreach activities. Send us a message to get involved or donate.', label: 'Get involved', href: '/#join' },
};

export const sartPage: ProgramPageData = {
  path: '/community/sart',
  eyebrow: 'Safety',
  title: 'Search and Rescue Team',
  intro: 'SART is the MMS Search and Rescue Team: trained members who keep our climbs safe and stand ready to respond to trail emergencies.',
  image: '/images/page-sart.webp',
  accent: 'var(--red)',
  facts: [
    { value: '24/7', label: 'Readiness' },
    { value: 'WFA', label: 'First aid trained' },
    { value: 'SAR', label: 'Search & rescue' },
    { value: '01', label: 'Shared mission' },
  ],
  sections: [
    {
      eyebrow: 'What SART does',
      title: 'Ready when it counts.',
      variant: 'cards',
      items: [
        { title: 'Emergency response', description: 'Responds to incidents on MMS climbs and supports search and rescue operations.' },
        { title: 'Climb safety', description: 'Reviews routes, weather, and risk plans for club climbs.' },
        { title: 'Training', description: 'Runs first aid, rope work, and rescue drills for members.' },
        { title: 'Coordination', description: 'Works with local guides, LGUs, and rescue units on the ground.' },
      ],
    },
  ],
  checklist: {
    title: 'Joining SART',
    items: ['Active MMS member', 'Completed the Basic Mountaineering Course', 'Wilderness first aid training', 'Commitment to regular drills'],
  },
  cta: { title: 'Serve on SART.', text: 'SART is open to trained MMS members. Send us a message to learn about the next training cycle.', label: 'Ask about SART', href: '/#join' },
};
