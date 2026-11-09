// #173 admin manual (/admin/help): what officers do on this site, in order of a climb's life. **bold** via RichText.
import type { HelpTopic } from './helpGuide';

export const adminHelpTopics: HelpTopic[] = [
  {
    id: 'access', title: 'Getting admin access',
    steps: [
      'Sign in on `/admin`. Admin rights are given in the Firebase console by the site owner; ask them if you see “not an admin”.',
      'Edit on **www.metropolitanms.org**: the preview site is read-only.',
    ],
  },
  {
    id: 'set-up', title: 'Setting up a climb',
    steps: [
      'Open **Climbs** and tap **New**. Start as **draft** (hidden from the public).',
      'Fill name, location (town, province), type, start and end dates, slots, difficulty (N/9) and trail class, and what you know of the profile.',
      { text: 'Use the small tables for:', details: ['**Fees**: amount in pesos or TBA; tick **Optional** for extras, **Guest fee** for the fee only guests pay', '**Climb officers**: role and name', '**Itinerary**: one row per activity; same day name in a row = one day', '**Trail routes**: AllTrails / Komoot / Google Maps links per route'] },
      'Add the **MMS** GCash name, number and QR link (never a personal wallet), tick the **required documents** with their template links, and switch on an **outreach donation drive** if there is one.',
      'The **Before opening this climb** box lists anything still missing. When it’s empty, set the status to **open**.',
    ],
  },
  {
    id: 'running', title: 'Running registrations',
    steps: [
      '**Upcoming climbs** at the top of `/admin` shows slots left, confirmed, pending, waitlist and **payments to review**. Click a climb to open its registrations.',
      'Change each registrant’s status (pending → confirmed, waitlisted, cancelled, rejected). A full climb waitlists new registrations automatically.',
      'Open each receipt and **Verify** or **Reject** the payment. Your email and the time are recorded; paid totals update by themselves.',
      'Add **notes**, **Add walk-in** for someone who joined offline (cash received is recorded as paid), and set **Pre-climb meetings and resources** (registrants see them).',
      '**All registrations** finds anyone across climbs by name, email, mobile or climb.',
    ],
  },
  {
    id: 'climb-day', title: 'Climb day and after',
    steps: [
      '**Download CSV** gives the LGU / jump-off list with emergency contacts and health notes. Keep it private and delete it after the climb (Data Privacy Act).',
      'After the climb set the status to **completed**. Confirmed participants can then rate it; quote good ones under **Reviews** (with their consent).',
      'Postponed? Pick **postponed** and update the dates. Cancelled? Set **cancelled**: it leaves the lists and its link explains.',
    ],
  },
  {
    id: 'content', title: 'Site content',
    steps: [
      'Announcements, Leadership, Committees, Surveys, FAQs, Glossary, Media, Reviews and Site settings each have a tab in `/admin`. Changes show on the public pages right away.',
      '**Release notes** tell members what changed on the site: publish one and members see it under **What’s new**.',
      'Only enter facts the officers have confirmed: names, fees, dates and trail classes.',
    ],
  },
];
