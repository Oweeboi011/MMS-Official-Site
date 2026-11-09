// #170 "New to mountaineering?" guide: the old Open Climbs app's text (data/mountaineeringGuide.js), adapted to this
// site; difficulty bands per owner decision 2026-11-09. **bold** is rendered by components/RichText.
export interface GuideSection { id: string; title: string; paragraphs?: string[]; bullets?: string[]; footnote?: string }

export const firstClimbChecklist = [
  'Create your free site account (no MMS membership needed).',
  'Browse the open climbs and pick one that matches your experience: check its Difficulty and Trail class first.',
  'Register, and upload the registration form or medical certificate if the climb asks for one.',
  'Pay your climb fee by GCash and upload your receipt on My Climbs.',
  'Prepare your gear: check the climb’s “Things to bring” list on its page.',
  'Attend the pre-climb meeting: it’s mandatory, no exceptions.',
  'Print and bring your signed waiver on climb day.',
  'Skim Leave No Trace below so you know the trail etiquette before you go.',
];

export const guideSections: GuideSection[] = [
  {
    id: 'difficulty', title: 'Difficulty levels',
    paragraphs: ['MMS climbs use the standard **Philippine mountaineering difficulty scale**: one score from **1/9** (easiest) to **9/9** (most difficult), combining trail condition, elevation gain, distance, water source availability and terrain. Climb pages show it as e.g. “5/9”.'],
    bullets: [
      '**1/9: Very easy** (Easy): resembles a hill more than a mountain; climbable by first-timers, even children, with basic guidance.',
      '**2/9: Easy** (Easy): minor elevation gain on generally clear, well-established trails.',
      '**3/9: Beginner-friendly** (Moderate): trail and forest cover conditions may vary but nothing technical.',
      '**4/9: Moderate** (Moderate): some steep sections and longer distance; may take a full day.',
      '**5/9: Moderately difficult** (Advanced): recommended for hikers with some prior experience; may involve a multi-day itinerary.',
      '**6/9: Fairly difficult** (Advanced): requires good physical fitness; longer trails with significant elevation gain.',
      '**7/9: Difficult** (Advanced): long distances combined with steep, sustained ascents; only for experienced hikers.',
      '**8/9: Very difficult** (Advanced): extremely technical or remote terrain requiring advanced skill and endurance.',
      '**9/9: Most difficult** (Advanced): expedition-level climbs under extreme conditions; only for veteran mountaineers.',
    ],
    footnote: 'The Easy / Moderate / Advanced tag is the one shown on climb listings: 1–2 Easy, 3–4 Moderate, 5–9 Advanced. Trail class (below) is a separate 1–6 scale for technical terrain; check both before you register.',
  },
  {
    id: 'commitment', title: 'Commitment',
    paragraphs: ['Commitment is how much time, logistics and exposure to risk a climb demands, separate from how physically hard it is. A short scramble can be low-difficulty but high-commitment if retreat is hard once you’re on it.'],
    bullets: [
      '**Low commitment**: a few hours, easy to turn back at any point, close to civilization.',
      '**Moderate commitment**: a full day or overnight, defined jump-off and exit points.',
      '**High commitment**: multi-day expedition, remote jump-off, limited bailout options once underway.',
    ],
    footnote: 'Higher-commitment climbs need more preparation: extra food and water, backup gear, and an itinerary your emergency contact actually has a copy of.',
  },
  {
    id: 'climb-type', title: 'Climb type',
    paragraphs: ['MMS classifies each climb as Minor, Major or Special: this tells you who it suits and what to prepare.'],
    bullets: [
      '**Minor climb**: beginner-friendly, usually a day hike or overnight; a good first climb.',
      '**Major climb**: longer, more demanding climbs for those with prior hiking experience.',
      '**Special climb**: one-off or expedition-style events: traverses, technical routes or out-of-the-ordinary destinations.',
    ],
  },
  {
    id: 'trail-class', title: 'Trail class',
    paragraphs: ['Trail class is a 1–6 scale for the technical terrain you’ll actually move through, whatever the distance or elevation:'],
    bullets: [
      '**Class 1**: easy walking, flat paths or smooth strolls with minimal risk.',
      '**Class 2**: simple hiking on rugged terrain, dirt paths or occasional loose rocks where you might use a hand for balance.',
      '**Class 3**: scrambling; hands are often needed for balance on steep rock or uneven ground.',
      '**Class 4**: climbing easy cliffs or steep slopes with significant drop-offs; ropes are recommended for beginners.',
      '**Class 5**: free-hand technical climbing or vertical scaling that needs specific holds and moves.',
      '**Class 6**: extremely difficult terrain needing artificial climbing gear, tools (like ice axes) or specialised equipment.',
    ],
  },
  {
    id: 'foreign', title: 'Climbing abroad',
    paragraphs: [
      'These ratings are the convention MMS and most Philippine mountaineering clubs use. Abroad you’ll meet other systems: the Yosemite Decimal System (YDS) in the US, the UIAA scale in Europe, French / Alpine grades for multi-day routes. They don’t convert directly to local trail class numbers.',
      'Planning a climb outside the Philippines? Don’t assume local experience translates one-to-one. Research the local rating system, permits, and whether a certified local guide is required: many foreign peaks require one regardless of your experience.',
    ],
  },
  {
    id: 'itinerary', title: 'Why a solid itinerary matters',
    paragraphs: [
      'An itinerary isn’t paperwork: it’s **your team’s safety net**. It tells rescuers where to look if something goes wrong, gives your emergency contact a timeline, and makes the team think through water sources, campsites and cut-off times before you’re on the mountain.',
      'A vague plan (“we’ll figure it out on the trail”) is how search-and-rescue timelines slip from hours to days. Every MMS climb publishes a detailed itinerary for this reason: **read it, and make sure someone off the mountain has a copy too.**',
    ],
  },
  {
    id: 'pre-climb', title: 'Pre-climb meetings are mandatory',
    paragraphs: [
      'MMS holds a pre-climb meeting before every scheduled climb, and **every registered participant must attend: no exceptions.** The team reviews the itinerary, safety protocols, gear checklist, group assignments and the latest weather together.',
      'Can’t make it? **Message your climb officer before the meeting**: missing it without coordinating first can affect your slot.',
    ],
  },
  {
    id: 'member-or-guest', title: 'Member or guest?',
    paragraphs: [
      'Open climbs are open to everyone. You don’t need to be an MMS member to join.',
      '**MMS members** have completed the club’s membership process (application, induction, dues). **Guests** are non-members who register for a specific climb; most first-timers start here.',
    ],
    bullets: [
      'Guests pay a small **guest fee** per climb (shown in the climb’s fees); members don’t.',
      'Everything else is the same: same registration form, required documents, waiver and pre-climb meeting.',
      'Enjoying the climbs? Ask any climb officer about becoming a member.',
    ],
  },
];
