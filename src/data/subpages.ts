import type { Stat } from './content';
import { topMountainColumns, topMountains } from './topMountains';

interface BlockHead {
  eyebrow?: string;
  title?: string;
  intro?: string;
}

// href: external link (e.g. a Google Drive / Photos album), opened in a new tab.
interface CardItem { title: string; description: string; tag?: string; meta?: string; href?: string; linkLabel?: string }

export type ContentBlock = BlockHead & (
  | { type: 'text'; paragraphs: string[] }
  | { type: 'stats'; items: Stat[] }
  | { type: 'cards'; items: CardItem[] }
  | { type: 'steps'; items: { title: string; description: string }[] }
  | { type: 'table'; columns: string[]; rows: string[][]; pageSize?: number }
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
      type: 'text', eyebrow: 'Who we are', title: 'Founded on the summit of Mt. Makiling.',
      paragraphs: [
        'The Metropolitan Mountaineering Society, also known as MMS or MetropolitanMS, is a Manila-based outdoor organization registered with the Philippine Securities and Exchange Commission as a non-stock, non-profit organization.',
        'MMS was founded in March 1994 at the summit of Mt. Makiling in Laguna by eight founding members: Dennis Sacro, Ed Ocampo, Long Henson, Anne De Leon-Sacro, Jeric Yaya, Joey Avila, Richard Kahulugan, and Boying Amio.',
        'Most members still come from Metro Manila, but the society now has members across the country and abroad. Wherever enough members live close together, an informal chapter forms, like the MMS-US chapter, to celebrate the bond that ties every member.',
      ],
    },
    { type: 'stats', items: [{ value: '1994', label: 'Founded on Mt. Makiling' }, { value: '8', label: 'Founding members' }, { value: '30+', label: 'Years on the trail' }, { value: 'MMS-US', label: 'Overseas chapter' }] },
    {
      type: 'cards', eyebrow: 'Traditions', title: 'How we do things.',
      items: [
        { title: 'Batches named after mountains', description: 'Since 1996, every BMC batch carries the name of a mountain, and the first two batches were named too: Halcon (1994), Pulag (1995), Guiting-guiting (1996).' },
        { title: 'Hardcore', description: 'Since 1998, members who summit Mt. Halcon earn the title “Hardcore.”' },
        { title: 'Sportsfest & the Four Tribes', description: 'An annual games weekend where the Aeta, Badjao, Mangyan, and Tasaday tribes compete for the championship.' },
        { title: 'Beachineering', description: 'The annual beach outing that closes the training season before graduation.' },
        { title: 'MMS Kiddie Camp', description: 'First held at Mt. Makiling in 2000 for the Don Bosco Youth Group, and still part of the BMC season.' },
        { title: 'Awards Night & oath taking', description: 'Members are recognized at the year-end Christmas party, where new members take their oath.' },
      ],
    },
  ],
  '/about/mission': [
    {
      type: 'cards', eyebrow: 'Why we exist', title: 'Mission & vision.',
      items: [
        { tag: 'Mission', title: 'Our mission', description: 'We commit to develop ourselves in protecting the environment by promoting responsible mountaineering and other outdoor related activities.' },
        { tag: 'Vision', title: 'Our vision', description: 'Shaping people for nature.' },
      ],
    },
    {
      type: 'checklist', eyebrow: 'What we work toward', title: 'Our objectives.',
      items: [
        'Educate people by conducting trainings, seminars, forums, and conferences related to outdoor activities.',
        'Undertake social, civic, and environmental projects.',
        'Advocate and be a role model of values and wilderness ethics.',
        'Foster friendship and camaraderie.',
        'Establish national and global presence through networking and coordination with other organizations.',
        'Generate funds and resources and acquire and sell properties.',
      ],
    },
    {
      type: 'cards', eyebrow: 'What we stand on', title: 'The 4 pillars.',
      items: [
        { title: 'Loyalty', description: 'We uphold the MMS Constitution, follow our leaders, and commit ourselves to the organization.' },
        { title: 'Camaraderie', description: 'We respect each other, complement our differences, and are responsible for each other at all times.' },
        { title: 'Love of Nature', description: 'We protect and preserve nature and live an environment-friendly lifestyle.' },
        { title: 'Trust', description: 'We rely on each other on and off the trail, and we keep our word to our teammates.' },
      ],
    },
    {
      type: 'text', eyebrow: 'The MMS Creed', title: 'Once an MMS, forever an MMS.',
      paragraphs: [
        'We the members of the Metropolitan Mountaineering Society protect and preserve nature. We share in that responsibility by engaging and promoting outdoor related activities by actively practicing an environment friendly lifestyle.',
        'We the members of the Metropolitan Mountaineering Society abide by and uphold the MMS Constitution. We respect and follow our leaders, our culture and our traditions. We commit ourselves to the organization. We support its projects and activities.',
        'We the members of the Metropolitan Mountaineering Society value camaraderie. We respect each other and we complement our differences. We will always be responsible for each other at all times.',
        'We the members of the Metropolitan Mountaineering Society believe that we have a responsibility to ourselves. We practice and cultivate a healthy physical, mental and spiritual way of life. We continuously enrich ourselves with the skills related to our sports and the environment.',
        'And in all of these, we shall always remember, that “Once an MMS! Forever an MMS!”',
      ],
    },
    {
      type: 'text', eyebrow: 'Preamble of the Philippine Constitution', title: 'We, the sovereign Filipino people.',
      paragraphs: [
        'We, the sovereign Filipino people, imploring the aid of Almighty God, in order to build a just and humane society, and establish a Government that shall embody our ideals and aspirations, promote the common good, conserve and develop our patrimony, and secure to ourselves and our posterity, the blessings of independence and democracy under the rule of law and a regime of truth, justice, freedom, love, equality, and peace, do ordain and promulgate this Constitution.',
      ],
    },
  ],
  '/about/leadership': [
    {
      type: 'people', eyebrow: 'Executive Committee', title: 'Execom.',
      items: [
        { role: 'President', name: 'Admer Dablio' },
        { role: 'Vice President', name: 'Kenneth Esguerra' },
        { role: 'Secretary', name: 'Daniella Ruanes' },
        { role: 'Treasurer', name: 'Elizabeth Villacino' },
        { role: 'PRO', name: 'Raven Arguelles' },
      ],
    },
    {
      type: 'people', eyebrow: 'Training Committee', title: 'TComm.',
      items: [
        { role: 'Chairman', name: 'Faye Roderos' },
        { role: 'Assistant Chairman', name: 'Anna Labao' },
        { role: 'Secretary', name: 'Jean La Valle' },
      ],
    },
    {
      type: 'people', eyebrow: 'Board of Trustees', title: 'BOT.',
      items: [
        { role: 'Trustee', name: 'Enzo Nacino' },
        { role: 'Trustee', name: 'Mau Romarate' },
        { role: 'Trustee', name: 'Herbert Ymata' },
        { role: 'Trustee', name: 'Emoi Dedicatoria' },
        { role: 'Trustee', name: 'Apolinario Nacino' },
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
        { year: '1994', title: 'MMS is founded', description: 'Founded on March 13 at Mt. Makiling, Laguna, by Dennis Sacro, Long Henson, Ed Ocampo, Jeric Yaya, Boying Amio, Richard Kahulugan, Joey Avila, and Anne De Leon-Sacro. First known as Nature’s Camp, then renamed at Jeric Yaya’s suggestion. Registered with the SEC as a non-stock, non-profit organization.' },
        { year: '1994', title: 'First BMC', description: 'The first Basic Mountaineering Course runs at Maculot, Romelo, Lukban, and Banahaw. Batch 94 (Halcon) graduates 17 members.' },
        { year: '1995', title: 'The MMS Explorer', description: 'The MMS Explorer newsletter debuts, and the society climbs Mt. Pulag twice.' },
        { year: '1996', title: 'MMS goes online', description: 'Long Henson launches the MMS website, the second website of a local mountaineering group. Boying Amio summits Mt. Fuji, the first member to climb abroad.' },
        { year: '1997', title: 'First Mt. Apo summit', description: 'Edwin Serapio and Long Henson become the first MMS members to reach the summit of Mt. Apo. Bobby Gamboa designs a new logo.' },
        { year: '1998', title: 'First MMS Olympics', description: 'The first MMS Olympics are held in Puerto Galera. A Search and Rescue Group forms after members complete PAF 505 training.' },
        { year: '1999', title: 'The MMS Book', description: 'The MMS Book, the first local mountaineering book in the Philippines, is launched.' },
        { year: '2000', title: 'Team MMS', description: 'Team MMS is established and places 10th of 44 teams at the Mt. Pinatubo PRO-AM Challenge. The first MMS Kiddie Camp is held at Mt. Makiling.' },
        { year: '2001', title: 'Open Climb season', description: 'The annual Open Climb season becomes an official program.' },
        { year: '2002', title: 'First woman president', description: 'Anne Castro becomes the first woman to serve as MMS president.' },
        { year: '2003', title: 'Leave No Trace', description: 'MMS trains Leave No Trace trainers and leads LNT workshops.' },
        { year: '2024', title: '30 years of MMS', description: 'The society celebrates its 30th anniversary on March 16.' },
      ],
    },
  ],

  // ── Explore ────────────────────────────────────────────────
  '/explore/mountains': [
    {
      type: 'table', eyebrow: 'Mountain guide', title: 'Mountains we climb.',
      intro: 'Trail class uses the 1–9 scale common among Philippine mountaineers. Major climbs are typically multi-day or high-altitude; minor climbs are day hikes or easy overnights. Always confirm conditions before a climb.',
      columns: ['Mountain', 'Province', 'Elevation', 'Type', 'Trail class', 'Typical duration'],
      rows: [
        ['Mt. Apo', 'Davao del Sur / Cotabato', '2,954 MASL', 'Major', '7/9', '3 days'],
        ['Mt. Pulag', 'Benguet', '2,922 MASL', 'Major', '3/9 (Ambangeg) · 7/9 (Akiki)', '2–3 days'],
        ['Mt. Kitanglad', 'Bukidnon', '2,899 MASL', 'Major', '6/9', '2 days'],
        ['Mt. Halcon', 'Oriental Mindoro', '2,582 MASL', 'Major', '9/9', '4 days'],
        ['Mt. Kanlaon', 'Negros', '2,465 MASL', 'Major', '7/9', '2 days'],
        ['Mt. Guiting-Guiting', 'Romblon', '2,051 MASL', 'Major', '9/9', '2–3 days'],
        ['Mt. Ulap', 'Benguet', '1,846 MASL', 'Minor', '3/9', 'Day hike'],
        ['Tarak Ridge', 'Bataan', '1,130 MASL', 'Minor', '5/9', 'Overnight'],
        ['Mt. Arayat', 'Pampanga', '1,026 MASL', 'Minor', '4/9', 'Day hike'],
        ['Mt. Batulao', 'Batangas', '811 MASL', 'Minor', '4/9', 'Day hike'],
        ['Mt. Daraitan', 'Rizal', '739 MASL', 'Minor', '4/9', 'Day hike'],
        ['Pico de Loro', 'Cavite / Batangas', '664 MASL', 'Minor', '4/9', 'Day hike'],
      ],
    },
    {
      type: 'table', eyebrow: 'Top 100', title: 'Highest peaks in the Philippines.',
      intro: 'Ranked by elevation from Wikipedia’s list, which is incomplete (e.g. Mt. Kitanglad’s main peak is missing). Trail classes and types are estimates on the 1–9 Pinoy Mountaineer scale, pending Climbs Committee review; “—” means not yet rated. Confirm conditions and permits with the Climbs Committee before any climb.',
      columns: topMountainColumns, rows: topMountains, pageSize: 20,
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
      type: 'cards', eyebrow: 'Signature events', title: 'Our yearly traditions.',
      items: [
        { tag: 'March', title: 'Anniversary celebration', description: 'MMS celebrates its founding every March. The 30th anniversary was held on March 16, 2024.' },
        { tag: 'May', title: 'Sportsfest', description: 'A weekend of traditional games where the Four Tribes compete for the championship.' },
        { tag: 'June', title: 'Beachineering', description: 'The annual beach outing that closes the training season, just before BMC graduation.' },
        { tag: 'BMC season', title: 'MMS Kiddie Camp', description: 'An outdoor camp for kids, first held at Mt. Makiling in 2000 for the Don Bosco Youth Group.' },
        { tag: 'December', title: 'Christmas party & oath taking', description: 'The year-end gathering with Awards Night and the oath taking of new members.' },
      ],
    },
    {
      type: 'text', eyebrow: 'Sportsfest', title: 'The Four Tribes.',
      paragraphs: [
        'Sportsfest is held every year to promote camaraderie among members. It gives members a chance to try traditional sports and helps spot athletic talent that could lead to a slot on Team MMS or other sporting pursuits.',
        'It began in 1998 as the first MMS Summer Games in Puerto Galera, Mindoro, where newcomers took on veterans. The veterans won that first MMS Olympics. Later games used color-coded teams until 2001, when the permanent Official Tribes were established. Every member belongs to a tribe for life.',
      ],
    },
    {
      type: 'table', eyebrow: 'Sportsfest champions', title: 'Championship years.',
      intro: 'Latest standings: 1. Tasaday · 2. Aeta · 3. Badjao · 4. Mangyan.',
      columns: ['Tribe', 'Titles', 'Championship years'],
      rows: [
        ['Aeta', '11', '2003, 2004, 2005, 2006, 2007, 2009, 2012, 2013, 2014, 2016, 2018'],
        ['Tasaday', '4', '2008, 2019, 2022, 2023'],
        ['Badjao', '1', '2011'],
        ['Mangyan', '1', '2010'],
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
    {
      type: 'cards', eyebrow: 'Climb officer guidelines', title: 'Organizing an open climb.',
      intro: 'Standards every climb officer follows when planning and running an MMS open climb.',
      items: [
        { tag: '01', title: 'LGU coordination', description: 'Coordinate with the LGU at least 3–4 weeks before the climb. Follow up regularly on the ITI so schedule, logistics, and arrangements stay aligned. All arrangements must be confirmed and agreed upon before the climb, not assumed.' },
        { tag: '02', title: 'Guide and porter assignments', description: 'Arrange a clear 1:1 guide and porter assignment and communicate it to the LGU as early as possible. Porters are not expected to perform guide duties when the roles are assigned separately. Roles and responsibilities are confirmed before the climb.' },
        { tag: '03', title: 'Transparent fees', description: 'Communicate all logistics and fees before the climb: transportation, LGU fees, guide and porter fees, and any additional charges. Confirm excess baggage rates and computation with the LGU in advance. Participants must know exactly what they are paying for and how much to prepare. No surprise charges.' },
        { tag: '04', title: 'Guide and porter payments', description: 'Guide and porter fees are settled after the climb, once services are completed. Funds and arrangements must be ready before the group descends.' },
        { tag: '05', title: 'Traverse climbs', description: 'Coordinate with both the entry and exit LGUs. Some LGUs do not provide assistance outside their jurisdiction, so arrangements at the exit point are confirmed separately.' },
        { tag: '06', title: 'Payment collection', description: 'Collect all participant fees before the climb so transportation and LGU fees are covered up front. The climb budget must be complete before departure so officers can focus on running the event.' },
        { tag: '07', title: 'Pre-climb meeting', description: 'All climb officers must know the ITI, logistics, fees, and safety reminders, and be able to facilitate the pre-climb meeting if the assigned presenter is late or unavailable.' },
        { tag: '08', title: 'Go / no-go check', description: 'Check PAGASA, PHIVOLCS, and LGU advisories 48 hours before and again on the morning of departure. The person who decides to postpone, and how participants are notified, is agreed in advance.' },
        { tag: '09', title: 'Participant screening', description: 'Match participants to the trail class. Waivers, emergency contacts, and medical certificates for major climbs are collected before slots are confirmed, not at the jump-off.' },
        { tag: '10', title: 'Single source of truth', description: 'Share one final ITI, gear list, and fee breakdown in the climb group chat. Changes are updated there and announced so no one works from an outdated version.' },
        { tag: '11', title: 'Emergency plan', description: 'Identify the nearest exit points, hospital, and LGU rescue contacts. Brief SART and leave the ITI with a base contact who has set check-in times.' },
        { tag: '12', title: 'Contingency and wrap-up', description: 'Keep a small buffer in the budget for delays, extra transport, or an added porter. Within a week of the climb, post a short report with the final expense breakdown and lessons learned.' },
      ],
    },
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
    {
      type: 'checklist', eyebrow: 'Leave No Trace', title: 'The 7 LNT principles.',
      items: [
        'Plan ahead and prepare.',
        'Travel and camp on durable surfaces.',
        'Dispose of waste properly.',
        'Leave what you find.',
        'Minimize campfire impacts.',
        'Respect wildlife.',
        'Be considerate of other visitors.',
      ],
    },
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
    {
      type: 'text', eyebrow: 'Team MMS', title: 'Our competitive arm.',
      paragraphs: [
        'Team MMS grew out of the first MMS Olympics in 1998, which showed how competitive MMS members can be. The first Team MMS formed in 2000 for the Mt. Pinatubo PRO-AM Challenge and finished 10th of 44 teams.',
        'From 2000 to 2011 the team raced the Guimaras Survival Challenge, San Miguel UJAR, the AXN Challenge, Carrera Habagat, San Miguel Enduro, TNF 100, the LLDA 200 km ultramarathon, and the NOMADs Bike Challenge.',
        'As adventure racing has declined, members now focus on road and mountain biking, multisport, and marathons, giving the society a healthy outlet beyond mountaineering.',
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
        { tag: 'Newsletter', title: 'The MMS Explorer', meta: 'Since 1995', description: 'The society’s newsletter, first published in 1995 and later edited by Mark Salcedo and Edwin Esguerra.' },
        { tag: 'Book', title: 'The MMS Book', meta: '1999', description: 'The first local mountaineering book in the Philippines.' },
        { tag: 'Yearbook', title: 'MMS Year Book', meta: 'First edition 1998', description: 'A record of the year’s batch, climbs, and members.' },
        { tag: 'Email', title: 'E-Flash', meta: 'Since 1998', description: 'A weekly email update to members, started by Long Henson.' },
      ],
    },
  ],
  '/media/archives': [
    {
      type: 'table', eyebrow: 'Archives', title: 'From the vault.',
      columns: ['Year', 'Item', 'Type'],
      rows: [
        ['2024', '30th Anniversary Celebration recap', 'Video'],
        ['2004', 'MMS Constitution (2004 revision)', 'Document'],
        ['2002', 'MMS Constitution (2002)', 'Document'],
        ['1999', 'The MMS Book', 'Book'],
        ['1998', 'MMS Constitution (1998)', 'Document'],
        ['1998', 'First MMS Year Book', 'Yearbook'],
        ['1996', 'First MMS website', 'Web'],
        ['1995', 'First issue of the MMS Explorer', 'Newsletter'],
        ['1994', 'MMS Constitution (1994)', 'Document'],
      ],
    },
  ],
  '/media/photos': [
    {
      // Sample albums. Media Committee: add `href` = MMS-owned Drive/Photos folder link (see docs/solution-plan/media.md).
      type: 'cards', eyebrow: 'Albums', title: 'Recent albums.',
      intro: 'Full albums will be linked here once the MMS photo Drive is set up.',
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
