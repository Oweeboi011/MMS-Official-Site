import type { Stat } from './content';

interface BlockHead {
  eyebrow?: string;
  title?: string;
  intro?: string;
}

export type ContentBlock = BlockHead & (
  | { type: 'text'; paragraphs: string[] }
  | { type: 'stats'; items: Stat[] }
  | { type: 'cards'; items: { title: string; description: string; tag?: string; meta?: string }[] }
  | { type: 'steps'; items: { title: string; description: string }[] }
  | { type: 'table'; columns: string[]; rows: string[][] }
  | { type: 'timeline'; items: { year: string; title: string; description: string }[] }
  | { type: 'people'; items: { role: string; name: string; note?: string }[] }
  | { type: 'quotes'; items: { quote: string; name: string; meta: string }[] }
  | { type: 'checklist'; items: string[] }
);

// Sample content for peer review — names, dates, and figures are illustrative, not official MMS records.
export const subpageContent: Record<string, ContentBlock[]> = {
  // ── About MMS ──────────────────────────────────────────────
  '/about/our-story': [
    {
      type: 'text', eyebrow: 'How it started', title: 'Weekend climbers, lifelong friends.',
      paragraphs: [
        'MMS began in 1994 when a handful of young professionals from Metro Manila started organizing weekend climbs to Batangas and Rizal. What started as a barkada with borrowed tents quickly grew into a society with a training course, a safety standard, and a waiting list for every major climb.',
        'Three decades later, the society has trained more than 1,200 mountaineers through its Basic Mountaineering Course, logged climbs on every major island group, and built a Search and Rescue Team that is called on by partner LGUs.',
        'Through all of it, one thing has not changed: we climb together, we look after each other, and we leave every trail better than we found it.',
      ],
    },
    { type: 'stats', items: [{ value: '1,200+', label: 'BMC graduates' }, { value: '31', label: 'BMC batches' }, { value: '480+', label: 'Active members' }, { value: '2,300+', label: 'Climbs logged' }] },
  ],
  '/about/mission': [
    {
      type: 'cards', eyebrow: 'Why we exist', title: 'Mission & vision.',
      items: [
        { tag: 'Mission', title: 'Safe, responsible mountaineering', description: 'To train and develop mountaineers who climb safely, lead responsibly, and protect the natural and cultural heritage of the Philippine mountains.' },
        { tag: 'Vision', title: 'A trail-ready community', description: 'A nationally respected mountaineering society whose members are recognized for skill, service, and stewardship on and off the trail.' },
      ],
    },
    {
      type: 'cards', eyebrow: 'What we value', title: 'Our core values.',
      items: [
        { title: 'Safety first', description: 'No summit is worth a life. Every climb is planned, briefed, and led to standard.' },
        { title: 'Camaraderie', description: 'We start together and we finish together. Nobody is left behind on the trail.' },
        { title: 'Stewardship', description: 'We practice Leave No Trace and give back to host communities.' },
        { title: 'Discipline', description: 'We respect the mountain, the team leader, and the itinerary.' },
        { title: 'Service', description: 'Our skills belong to others too: SART, outreach, and volunteer work.' },
        { title: 'Integrity', description: 'We honor our word to our teammates, guides, and partners.' },
      ],
    },
    {
      type: 'text', eyebrow: 'The MMS Creed', title: 'Once an MMS, forever an MMS.',
      paragraphs: [
        'I climb not to conquer the mountain, but to know myself and my companions.',
        'I will carry my share of the load, follow my leader, and watch over the one behind me.',
        'I will take nothing but pictures, leave nothing but footprints, and kill nothing but time.',
        'I will honor the communities that welcome me and the trails that test me.',
        'Wherever I go, I carry the name of the Society with pride. Once an MMS, forever an MMS.',
      ],
    },
  ],
  '/about/leadership': [
    {
      type: 'people', eyebrow: 'Board of Trustees', title: '2026–2027 officers.',
      intro: 'Elected at the annual general assembly in June 2026.',
      items: [
        { role: 'President', name: 'Ramon “Mon” Villareal', note: 'BMC Batch 14' },
        { role: 'Vice President', name: 'Katrina Dela Paz', note: 'BMC Batch 18' },
        { role: 'Secretary', name: 'Joanna Mercado', note: 'BMC Batch 22' },
        { role: 'Treasurer', name: 'Paolo Sison', note: 'BMC Batch 19' },
        { role: 'Training Director', name: 'Edgar Lualhati', note: 'BMC Batch 9' },
        { role: 'Climbs Director', name: 'Mikee Santos', note: 'BMC Batch 24' },
        { role: 'SART Commander', name: 'Benjie Ocampo', note: 'BMC Batch 16' },
        { role: 'Auditor', name: 'Liza Fernandez', note: 'BMC Batch 20' },
      ],
    },
    {
      type: 'table', eyebrow: 'Past presidents', title: 'Those who led before.',
      columns: ['Term', 'President'],
      rows: [['2024–2026', 'Andrea Lim'], ['2022–2024', 'Carlo Reyes'], ['2020–2022', 'Grace Manalo'], ['2018–2020', 'Dennis Aquino'], ['2016–2018', 'Ramon Villareal']],
    },
  ],
  '/about/committees': [
    {
      type: 'cards', eyebrow: 'Working teams', title: 'Our committees.',
      intro: 'Every member is encouraged to join at least one committee.',
      items: [
        { tag: 'Climbs', title: 'Climbs Committee', meta: 'Head: Mikee Santos', description: 'Plans the climb calendar, assigns team leaders, and coordinates permits and transport.' },
        { tag: 'Training', title: 'Training Committee', meta: 'Head: Edgar Lualhati', description: 'Runs BMCM and AMC, outdoor skills workshops, and instructor development.' },
        { tag: 'Safety', title: 'SART', meta: 'Commander: Benjie Ocampo', description: 'Climb risk reviews, incident response, and first aid drills.' },
        { tag: 'Outreach', title: 'Outreach & Conservation', meta: 'Head: Tess Navarro', description: 'School drives, tree planting, trail clean-ups, and partner LGU programs.' },
        { tag: 'Media', title: 'Media & Publications', meta: 'Head: Ivan Cruz', description: 'Newsletter, social media, photo archives, and the coffee table book.' },
        { tag: 'Membership', title: 'Membership Committee', meta: 'Head: Joanna Mercado', description: 'Applications, member records, dues, and new-member orientation.' },
        { tag: 'Logistics', title: 'Equipment & Logistics', meta: 'Head: Rex Bautista', description: 'Club gear inventory, rentals, and transport coordination.' },
        { tag: 'Finance', title: 'Ways & Means', meta: 'Head: Paolo Sison', description: 'Budgets, fundraising, and sponsorship partnerships.' },
      ],
    },
  ],
  '/about/history': [
    {
      type: 'timeline', eyebrow: 'Milestones', title: 'Three decades on the trail.',
      items: [
        { year: '1994', title: 'MMS is founded', description: 'Eleven founding members hold the first general meeting in Quezon City.' },
        { year: '1995', title: 'First BMC batch', description: 'The Basic Mountaineering Course graduates its first 18 members on Mt. Banahaw.' },
        { year: '1998', title: 'First Mt. Apo expedition', description: 'MMS reaches the country’s highest summit via the Kidapawan trail.' },
        { year: '2003', title: 'SART is formed', description: 'The Search and Rescue Team is organized after a series of trail incidents in Luzon.' },
        { year: '2009', title: 'Typhoon Ondoy relief', description: 'SART and members support rescue and relief operations in Marikina and Rizal.' },
        { year: '2014', title: '20th anniversary', description: 'Twenty teams summit twenty mountains on the same weekend.' },
        { year: '2019', title: 'Kinabalu expedition', description: 'First international special climb to Mt. Kinabalu, Sabah.' },
        { year: '2024', title: '30 years of MMS', description: 'Launch of the coffee table book “Tatlumpung Taon sa Bundok.”' },
        { year: '2026', title: 'New website', description: 'The society launches its new website and member profiles.' },
      ],
    },
  ],

  // ── Explore ────────────────────────────────────────────────
  '/explore/mountains': [
    {
      type: 'table', eyebrow: 'Mountain guide', title: 'Mountains we climb.',
      intro: 'Difficulty uses the 1–9 scale common among Philippine mountaineers. Always confirm conditions before a climb.',
      columns: ['Mountain', 'Province', 'Elevation', 'Difficulty', 'Typical duration'],
      rows: [
        ['Mt. Apo', 'Davao del Sur / Cotabato', '2,954 MASL', '7/9', '3 days'],
        ['Mt. Pulag', 'Benguet', '2,926 MASL', '3/9 (Ambangeg) · 7/9 (Akiki)', '2–3 days'],
        ['Mt. Kitanglad', 'Bukidnon', '2,899 MASL', '6/9', '2 days'],
        ['Mt. Halcon', 'Oriental Mindoro', '2,586 MASL', '9/9', '4 days'],
        ['Mt. Kanlaon', 'Negros', '2,465 MASL', '7/9', '2 days'],
        ['Mt. Guiting-Guiting', 'Romblon', '2,058 MASL', '9/9', '2–3 days'],
        ['Mt. Ulap', 'Benguet', '1,846 MASL', '3/9', 'Day hike'],
        ['Tarak Ridge', 'Bataan', '1,130 MASL', '5/9', 'Overnight'],
        ['Mt. Arayat', 'Pampanga', '1,026 MASL', '4/9', 'Day hike'],
        ['Mt. Batulao', 'Batangas', '811 MASL', '4/9', 'Day hike'],
        ['Mt. Daraitan', 'Rizal', '739 MASL', '4/9', 'Day hike'],
        ['Pico de Loro', 'Cavite / Batangas', '664 MASL', '4/9', 'Day hike'],
      ],
    },
  ],
  '/explore/trails': [
    {
      type: 'table', eyebrow: 'Established itineraries', title: 'MMS standard routes.',
      intro: 'Routes reviewed and approved by the Climbs Committee and SART.',
      columns: ['Trail', 'Mountain', 'Jump-off', 'Distance', 'Duration'],
      rows: [
        ['Akiki–Ambangeg traverse', 'Mt. Pulag', 'Bokod, Benguet', '22 km', '3 days'],
        ['Tawangan–Akiki', 'Mt. Pulag', 'Kabayan, Benguet', '24 km', '3 days'],
        ['Kidapawan–Sta. Cruz traverse', 'Mt. Apo', 'Kidapawan City', '28 km', '3 days'],
        ['Kibungan Cross Country', 'Tagpew–Oten–Tagpaya', 'Kibungan, Benguet', '26 km', '3 days'],
        ['Bakun Trilogy', 'Kabunian–Tagpew–Lobo', 'Bakun, Benguet', '30 km', '3 days'],
        ['Nasugbu Trilogy', 'Batulao–Talamitam–Apayang', 'Nasugbu, Batangas', '18 km', '2 days'],
        ['Tarak Ridge via Alas-asin', 'Mt. Mariveles', 'Mariveles, Bataan', '14 km', 'Overnight'],
      ],
    },
    {
      type: 'steps', eyebrow: 'Sample itinerary', title: 'Mt. Pulag via Akiki.',
      items: [
        { title: 'Day 0 · Travel', description: '22:00 assembly in Quezon City. Overnight bus to Baguio, transfer to Kabayan.' },
        { title: 'Day 1 · Eddet River', description: 'DENR orientation, start trek 08:00. Camp at Eddet River by 15:00.' },
        { title: 'Day 2 · Marlboro Country', description: 'Climb the “killer trail” through mossy forest to Marlboro Country camp.' },
        { title: 'Day 3 · Summit & exit', description: '03:00 summit assault for sunrise. Descend via Ambangeg, back in Manila by night.' },
      ],
    },
  ],
  '/explore/climb-log': [
    { type: 'stats', items: [{ value: '68', label: 'Climbs in 2026' }, { value: '41', label: 'Minor climbs' }, { value: '19', label: 'Major climbs' }, { value: '8', label: 'Special & outreach' }] },
    {
      type: 'table', eyebrow: 'Recent climbs', title: 'Climb log.',
      columns: ['Date', 'Climb', 'Type', 'Team leader', 'Pax', 'Status'],
      rows: [
        ['Sep 19–22, 2026', 'Mt. Apo (Kidapawan)', 'Special', 'Mikee Santos', '24', 'Completed'],
        ['Sep 12–13, 2026', 'Tarak Ridge', 'Minor', 'Joel Ramirez', '18', 'Completed'],
        ['Sep 5–6, 2026', 'Mt. Daraitan', 'Minor', 'Ana Villanueva', '22', 'Completed'],
        ['Aug 28–30, 2026', 'Mt. Kitanglad', 'Major', 'Edgar Lualhati', '14', 'Completed'],
        ['Aug 22, 2026', 'Pico de Loro', 'Minor', 'Rico Tan', '30', 'Completed'],
        ['Aug 15–16, 2026', 'Mt. Ulap', 'Minor', 'Bea Gonzales', '26', 'Completed'],
        ['Aug 8–10, 2026', 'Mt. Guiting-Guiting', 'Major', 'Benjie Ocampo', '10', 'Turned back (weather)'],
        ['Aug 1, 2026', 'Mt. Arayat', 'Minor', 'Carla Medina', '20', 'Completed'],
      ],
    },
  ],
  '/explore/destinations': [
    {
      type: 'cards', eyebrow: 'By region', title: 'Where we go.',
      items: [
        { tag: 'Luzon', title: 'Cordillera', meta: 'Pulag · Ulap · Kibungan · Bakun', description: 'Pine forests, mossy trails, and the highest peaks in Luzon. Home of our major climbs.' },
        { tag: 'Luzon', title: 'Southern Tagalog', meta: 'Batulao · Pico de Loro · Daraitan', description: 'Weekend-friendly trails within a few hours of Metro Manila. Ideal for first climbs.' },
        { tag: 'Luzon', title: 'Central Luzon', meta: 'Tarak · Arayat · Pinatubo', description: 'Volcanic landscapes, ridges, and the famous Pinatubo crater lake.' },
        { tag: 'Islands', title: 'Mindoro & Romblon', meta: 'Halcon · Guiting-Guiting', description: 'The hardest climbs in the country, reserved for experienced members.' },
        { tag: 'Visayas', title: 'Negros', meta: 'Kanlaon · Talinis', description: 'Active volcanoes and rainforest. Climbs depend on PHIVOLCS advisories.' },
        { tag: 'Mindanao', title: 'Mindanao', meta: 'Apo · Kitanglad · Dulang-dulang', description: 'The country’s highest summits and some of its oldest forests.' },
        { tag: 'Abroad', title: 'International', meta: 'Kinabalu · Rinjani · Fuji', description: 'Special climbs abroad, open to members who meet the experience requirements.' },
      ],
    },
  ],

  // ── Activities ─────────────────────────────────────────────
  '/activities/calendar': [
    {
      type: 'table', eyebrow: 'Q4 2026', title: 'Calendar of activities.',
      columns: ['Date', 'Activity', 'Category', 'Open to'],
      rows: [
        ['Oct 10–11', 'Mt. Marami open climb', 'Climb', 'Members & guests'],
        ['Oct 17', 'BMCM 32 orientation', 'Training', 'Applicants'],
        ['Oct 24–26', 'Kibungan Cross Country', 'Climb', 'Members & guests'],
        ['Oct 31', 'Trail clean-up: Mt. Batulao', 'Conservation', 'Everyone'],
        ['Nov 7–8', 'Mt. Timbak – Mt. Tabayoc', 'Climb', 'Members & guests'],
        ['Nov 14', 'Wilderness First Aid (Day 1)', 'Training', 'Members'],
        ['Nov 20–22', 'Mt. Pulag via Tawangan–Akiki', 'Climb', 'Members & guests'],
        ['Nov 28–30', 'Bakun Trilogy', 'Climb', 'Members & guests'],
        ['Nov 29 – Dec 2', 'Mt. Kinabalu', 'Special', 'Members'],
        ['Dec 5', 'School supply drive: Tanay, Rizal', 'Outreach', 'Everyone'],
        ['Dec 12–13', 'Nasugbu Trilogy', 'Climb', 'Members & guests'],
        ['Dec 19', 'MMS Christmas party & awards night', 'Club', 'Members'],
      ],
    },
  ],
  '/activities/special-events': [
    {
      type: 'cards', eyebrow: 'Signature events', title: 'Special events.',
      items: [
        { tag: 'Nov 29 – Dec 2', title: 'Mt. Kinabalu 2026', meta: 'Sabah, Malaysia · 4,095 m', description: 'Our international special climb. Slots are full; waitlist is open for members.' },
        { tag: 'Dec 19', title: 'Christmas party & awards night', meta: 'Quezon City', description: 'Year-end celebration with the Mountaineer of the Year and Team Leader of the Year awards.' },
        { tag: 'Feb 2027', title: '33rd anniversary climb', meta: 'Mt. Banahaw de Lucban', description: 'Our anniversary tradition: a return to the mountain where the first BMC batch graduated.' },
        { tag: 'Apr 2027', title: 'Earth Day tree planting', meta: 'Tanay, Rizal', description: 'Planting 2,000 native seedlings with our partner community and LGU.' },
      ],
    },
  ],

  // ── Training ───────────────────────────────────────────────
  '/training/amc': [
    { type: 'stats', items: [{ value: '8', label: 'Lecture modules' }, { value: '4', label: 'Field sessions' }, { value: '1', label: 'Expedition climb' }, { value: '12', label: 'Slots per batch' }] },
    {
      type: 'cards', eyebrow: 'Curriculum', title: 'Advanced Mountaineering Course.',
      intro: 'For BMC graduates ready for multi-day and technical objectives.',
      items: [
        { title: 'Expedition planning', description: 'Logistics, permits, food planning, and budgeting for multi-day climbs.' },
        { title: 'Advanced navigation', description: 'Off-trail navigation, GPS track planning, and route-finding in poor visibility.' },
        { title: 'Rope work', description: 'Fixed lines, river crossings, and basic rappelling.' },
        { title: 'Weather & terrain', description: 'Reading weather systems, typhoon season planning, and volcanic advisories.' },
        { title: 'Wilderness medicine', description: 'Patient assessment, improvised splints and litters, and evacuation.' },
        { title: 'Expedition climb', description: 'A 3–4 day graduation expedition to Mt. Halcon or Mt. Guiting-Guiting.' },
      ],
    },
    { type: 'checklist', eyebrow: 'Requirements', title: 'Who can enroll.', items: ['BMC graduate in good standing', 'At least 5 major climbs logged', 'Current first aid certification', 'Endorsement from a team leader', 'Medical certificate', 'Course fee: ₱6,500'] },
  ],
  '/training/outdoor-skills': [
    {
      type: 'table', eyebrow: 'Workshops', title: 'Outdoor skills schedule.',
      columns: ['Workshop', 'Date', 'Venue', 'Fee'],
      rows: [
        ['Map & compass navigation', 'Oct 18, 2026', 'UP Diliman', '₱500'],
        ['Knots & basic rope work', 'Oct 25, 2026', 'MMS clubhouse', '₱300'],
        ['Trail cooking & food planning', 'Nov 15, 2026', 'MMS clubhouse', '₱400'],
        ['Ultralight packing', 'Nov 22, 2026', 'Online', 'Free'],
        ['Camp craft & tent pitching', 'Dec 6, 2026', 'Tanay, Rizal', '₱800'],
      ],
    },
    {
      type: 'cards', eyebrow: 'Skills we teach', title: 'Learn by doing.',
      items: [
        { title: 'Navigation', description: 'Topographic maps, compass bearings, and GPS apps like Gaia and OsmAnd.' },
        { title: 'Camp craft', description: 'Site selection, weatherproofing, and Leave No Trace camping.' },
        { title: 'Rope work', description: 'Essential knots, anchors, and handlines for steep sections.' },
        { title: 'Trail cooking', description: 'Meal planning, stove safety, and packing food for multi-day climbs.' },
      ],
    },
  ],
  '/training/first-aid': [
    {
      type: 'cards', eyebrow: 'Courses', title: 'First Aid & BLS.',
      intro: 'Delivered with accredited partner trainers. Certificates are valid for two years.',
      items: [
        { tag: '2 days', title: 'Wilderness First Aid', meta: 'Nov 14–15, 2026', description: 'Patient assessment, wound care, fractures, heat and cold injuries, and evacuation decisions far from help.' },
        { tag: '1 day', title: 'Basic Life Support (BLS)', meta: 'Dec 6, 2026', description: 'CPR, AED use, and choking response for adults and children.' },
        { tag: 'Half day', title: 'First aid refresher', meta: 'Quarterly', description: 'Hands-on scenario drills for certified members and team leaders.' },
      ],
    },
    { type: 'checklist', eyebrow: 'Kit', title: 'Personal first aid kit.', items: ['Elastic bandage and triangular bandage', 'Gauze pads, tape, and adhesive bandages', 'Blister care (moleskin or hydrocolloid)', 'Antiseptic wipes and povidone-iodine', 'Oral rehydration salts', 'Personal medicines and paracetamol', 'Emergency blanket and whistle', 'Gloves and a CPR face shield'] },
  ],
  '/training/leadership': [
    {
      type: 'steps', eyebrow: 'Leadership pathway', title: 'From member to team leader.',
      items: [
        { title: 'Sweeper', description: 'Bring up the rear on at least 5 climbs and keep the group together.' },
        { title: 'Assistant team leader', description: 'Co-lead 5 climbs under a senior TL. Complete the TL seminar.' },
        { title: 'Team leader (minor)', description: 'Lead day hikes and overnight climbs after board approval.' },
        { title: 'Team leader (major)', description: 'Lead multi-day climbs after AMC and a SART risk review.' },
      ],
    },
    { type: 'checklist', eyebrow: 'TL seminar', title: 'What the seminar covers.', items: ['Pre-climb planning and briefings', 'Group management and pacing', 'Decision-making and turn-around times', 'Incident reporting and SART coordination', 'Working with local guides and LGUs', 'Post-climb reports'] },
  ],
  '/training/safety': [
    {
      type: 'cards', eyebrow: 'Safety standards', title: 'How we keep climbs safe.',
      items: [
        { title: 'Climb risk review', description: 'Every major climb is reviewed by SART for route, weather, and evacuation options.' },
        { title: 'Turn-around times', description: 'Team leaders set a hard turn-around time. The summit can wait.' },
        { title: 'Buddy system', description: 'Every participant has a buddy. Headcounts at every rest stop.' },
        { title: 'Weather watch', description: 'Climbs are cancelled under PAGASA signal no. 1 or higher on the route.' },
        { title: 'Communications', description: 'Radios on all major climbs; check-ins with base at set times.' },
        { title: 'Leave No Trace', description: 'All seven LNT principles, briefed before every climb.' },
      ],
    },
    { type: 'checklist', eyebrow: 'Before every climb', title: 'Pre-climb checklist.', items: ['Itinerary filed with the Climbs Committee', 'Weather and volcano advisories checked', 'Medical certificates on file (major climbs)', 'Signed waivers for all participants', 'First aid kit and radios packed', 'Emergency contacts shared with base'] },
  ],

  // ── Community ──────────────────────────────────────────────
  '/community/members': [
    { type: 'stats', items: [{ value: '480+', label: 'Active members' }, { value: '62', label: 'Team leaders' }, { value: '38', label: 'SART members' }, { value: '31', label: 'BMC batches' }] },
    {
      type: 'people', eyebrow: 'Member spotlight', title: 'Meet our members.',
      items: [
        { role: 'Mountaineer of the Year 2025', name: 'Ana Villanueva', note: '42 climbs logged in one year' },
        { role: 'Team Leader of the Year 2025', name: 'Joel Ramirez', note: '18 climbs led, zero incidents' },
        { role: 'Volunteer of the Year 2025', name: 'Tess Navarro', note: '120 outreach hours' },
        { role: 'Newest batch', name: 'BMC Batch 31', note: '36 graduates, July 2026' },
      ],
    },
  ],
  '/community/conservation': [
    { type: 'stats', items: [{ value: '12,400', label: 'Trees planted' }, { value: '3.2 t', label: 'Trash hauled out' }, { value: '27', label: 'Clean-up climbs' }, { value: '4', label: 'Partner LGUs' }] },
    {
      type: 'cards', eyebrow: 'Programs', title: 'Protecting the trails.',
      items: [
        { title: 'Adopt-a-Mountain: Batulao', description: 'Quarterly clean-ups and trail maintenance with the Nasugbu tourism office.' },
        { title: 'Native tree planting', description: 'Reforestation with native species in Tanay, Rizal, with our partner Dumagat community.' },
        { title: 'Carry-in, carry-out', description: 'Every participant brings home their own trash and one extra bag from the trail.' },
        { title: 'LNT trainer program', description: 'Members certified to teach Leave No Trace to guests, schools, and other groups.' },
      ],
    },
  ],
  '/community/volunteer': [
    {
      type: 'cards', eyebrow: 'Open roles', title: 'Volunteer with MMS.',
      items: [
        { tag: 'Outreach', title: 'School drive packers', meta: 'Nov 28 · 4 hours', description: 'Sort and pack school supplies for the December drive in Tanay.' },
        { tag: 'Conservation', title: 'Trail clean-up crew', meta: 'Oct 31 · Day hike', description: 'Join the Batulao clean-up climb. Gloves and sacks provided.' },
        { tag: 'Media', title: 'Climb photographers', meta: 'Ongoing', description: 'Document climbs and events for the newsletter and archive.' },
        { tag: 'Training', title: 'BMC facilitators', meta: 'Oct–Dec · Weekends', description: 'Assist instructors during BMCM 32 lectures and field sessions.' },
      ],
    },
    {
      type: 'steps', eyebrow: 'How to sign up', title: 'Three easy steps.',
      items: [
        { title: 'Pick a role', description: 'Choose an opening above that fits your schedule.' },
        { title: 'Message us', description: 'Send your name and the role to the committee head.' },
        { title: 'Show up', description: 'Attend the short briefing before the activity.' },
      ],
    },
  ],

  // ── Media ──────────────────────────────────────────────────
  '/media/stories': [
    {
      type: 'quotes', eyebrow: 'Testimonials', title: 'In their words.',
      items: [
        { quote: 'I joined an open climb not knowing anyone. Two years later, these are the people I trust with my life on the trail.', name: 'Bea Gonzales', meta: 'BMC Batch 28' },
        { quote: 'BMC taught me more than mountaineering. It taught me patience, preparation, and how to look after a team.', name: 'Rico Tan', meta: 'BMC Batch 25' },
        { quote: 'The team leaders checked on me every rest stop. As a first-timer on Pulag, I never felt left behind.', name: 'Maan Robles', meta: 'Guest, Mt. Pulag 2026' },
      ],
    },
    {
      type: 'cards', eyebrow: 'Climb stories', title: 'From the trail.',
      items: [
        { tag: 'Sep 2026', title: 'Twenty-four on Apo', meta: 'by Mikee Santos', description: 'How our biggest special climb of the year came together, from permits to the summit at dawn.' },
        { tag: 'Aug 2026', title: 'Turning back on Guiting-Guiting', meta: 'by Benjie Ocampo', description: 'Why the hardest decision on the knife-edge was also the right one.' },
        { tag: 'Jul 2026', title: 'Batch 31 graduates on Tarak', meta: 'by Joanna Mercado', description: 'Thirty-six new members, one long ridge, and a very wet graduation climb.' },
      ],
    },
  ],
  '/media/publications': [
    {
      type: 'cards', eyebrow: 'Publications', title: 'Read MMS.',
      items: [
        { tag: 'Newsletter', title: 'Bundok Balita · Q3 2026', meta: 'Released Oct 1, 2026', description: 'Apo special climb, BMC Batch 31 graduation, and the new SART roster.' },
        { tag: 'Newsletter', title: 'Bundok Balita · Q2 2026', meta: 'Released Jul 1, 2026', description: 'General assembly results, Kitanglad climb report, and a Leave No Trace primer.' },
        { tag: 'Book', title: 'Tatlumpung Taon sa Bundok', meta: 'Coffee table book · 2024', description: 'Thirty years of MMS in photos and stories. Copies available for members and partners.' },
        { tag: 'Report', title: 'Annual Report 2025', meta: 'Released Jun 2026', description: 'Climbs, training, outreach, and financial highlights for the year.' },
      ],
    },
  ],
  '/media/archives': [
    {
      type: 'table', eyebrow: 'Archives', title: 'From the vault.',
      columns: ['Year', 'Item', 'Type'],
      rows: [
        ['2025', 'Annual Report 2025', 'Report'],
        ['2024', 'Tatlumpung Taon sa Bundok', 'Book'],
        ['2024', '30th anniversary climb photos', 'Album'],
        ['2019', 'Kinabalu expedition report', 'Report'],
        ['2014', '20 Peaks, 20 Teams', 'Album'],
        ['2009', 'Ondoy relief operations log', 'Report'],
        ['1995', 'BMC Batch 1 graduation program', 'Document'],
      ],
    },
  ],
  '/media/photos': [
    {
      type: 'cards', eyebrow: 'Albums', title: 'Recent albums.',
      items: [
        { tag: '86 photos', title: 'Mt. Apo special climb', meta: 'Sep 2026', description: 'Lake Venado, the boulder face, and sunrise on the summit.' },
        { tag: '120 photos', title: 'BMC Batch 31 graduation', meta: 'Jul 2026', description: 'Tarak Ridge in the rain, and the induction that followed.' },
        { tag: '54 photos', title: 'Tanay tree planting', meta: 'Jun 2026', description: '1,500 native seedlings planted with our partner community.' },
      ],
    },
  ],

  // ── Membership ─────────────────────────────────────────────
  '/membership/benefits': [
    {
      type: 'cards', eyebrow: 'Why join', title: 'Member benefits.',
      items: [
        { title: 'Priority slots', description: 'First access to major and special climbs before they open to guests.' },
        { title: 'Member rates', description: 'Discounted climb fees, training fees, and club gear rentals.' },
        { title: 'Advanced training', description: 'Access to AMC, TL seminars, and SART training.' },
        { title: 'Member profile', description: 'Your climbs, certificates, and volunteer hours logged in one place.' },
        { title: 'Partner discounts', description: '10–15% off at partner outdoor stores.' },
        { title: 'A lifelong community', description: 'Once an MMS, forever an MMS.' },
      ],
    },
    {
      type: 'table', eyebrow: 'Dues', title: 'Membership fees.',
      columns: ['Item', 'Amount', 'Notes'],
      rows: [
        ['BMCM course fee', '₱4,500', 'One-time; includes manual and graduation climb permit'],
        ['Annual dues', '₱1,200', 'Due every June'],
        ['Lifetime membership', '₱15,000', 'For members with 10+ years in good standing'],
      ],
    },
  ],
  '/membership/login': [
    {
      type: 'text', eyebrow: 'Member portal', title: 'Coming in 2027.',
      paragraphs: [
        'The member portal will let you view your climb history, download certificates, pay dues, and register for climbs in one place.',
        'Until then, contact the Membership Committee for your records.',
      ],
    },
  ],
};
