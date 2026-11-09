// Member help (/help), adapted from the old Open Climbs app's guide to what this site does. **bold** via RichText.
// `registration: true` topics only show while climb registration is switched on here.
export interface HelpStep { text: string; details?: string[] }
export interface HelpTopic { id: string; title: string; intro?: string; steps: (string | HelpStep)[]; registration?: boolean }

export const helpTopics: HelpTopic[] = [
  {
    id: 'browsing', title: 'Finding a climb',
    intro: 'No account needed to browse.',
    steps: [
      'Open **Activities → Open Climbs**. Upcoming climbs are listed soonest first, with this year’s completed climbs below; **Past years** shows earlier ones.',
      { text: 'Each climb shows:', details: ['Its date and type: **Minor**, **Major** or **Special**', 'Location, difficulty (e.g. Moderate (4/9)) and elevation', 'Slots left, or **Full · waitlist**', '**Postponed** or **Closed** when that applies'] },
      'Not sure where to start? **Which climb fits you?** suggests climbs for your experience, and the **beginner guide** explains the ratings.',
      'Tap a climb’s name to open its page.',
    ],
  },
  {
    id: 'climb-page', title: 'Reading a climb’s page',
    steps: [
      { text: 'Everyone can see:', details: ['Stats: elevation, difficulty, trail class, jump-off, distances, elevation gain', '**Fees**, including optional extras and the guest fee', '**Photos** (tap for full screen; ← → to browse), **Trail map**, **Itinerary**', '**Weather** from 16 days before the climb, plus PAGASA and Windy links', '**Things to bring**, **Leave No Trace**, and any water-source warning'] },
      '**Share this climb**: on a phone, **Share…** opens Messenger, Viber and others, and **Instagram story** makes a story image; anywhere, **Facebook** or **Copy link**.',
    ],
  },
  {
    id: 'account', title: 'Creating an account and signing in',
    intro: 'A free account, not MMS membership: guests and members alike.',
    steps: [
      'Use a real browser. Inside Facebook, Messenger or Instagram, tap **Open in browser** first: Google sign-in doesn’t work in those apps.',
      'Sign up with email and a password, or **Continue with Google**.',
      'Signed up with email? Open the verification email and tap its link. Until you do, a banner offers **Resend the link**. Check spam if it isn’t in your inbox.',
      'Forgot your password (email accounts)? Use **Forgot password?** on the sign-in form and follow the email. Google accounts use your Google password.',
    ],
  },
  {
    id: 'registering', title: 'Registering for a climb', registration: true,
    intro: 'One registration per climb.',
    steps: [
      'On the climb’s page tap **Register**, and sign in if asked.',
      { text: 'Fill in:', details: ['**About you**: full name and mobile (required), date of birth and address (optional), guest or MMS member, experience', '**Emergency contact** (required): name, mobile, relationship', '**Health** (optional): conditions, allergies or medicines; only officers and admins see it, for emergencies'] },
      '**Fees**: required fees are included; guests also pay the guest fee; tick optional extras you’ll avail. The total updates as you go.',
      'Read the **Waiver**, tick to agree, and type your full name to sign (at least 3 characters). Agree to the **Privacy Notice**.',
      'Tap **Register**. Your registration is **Pending** until officers confirm it. A full climb puts you on the waitlist.',
    ],
  },
  {
    id: 'paying', title: 'Paying with GCash', registration: true,
    intro: 'Pay all, part or nothing at first; settle the rest from My Climbs.',
    steps: [
      'On **My Climbs**, the climb’s card shows the MMS GCash account and QR code. Scan it with GCash, Maya or any bank app (QR Ph).',
      'Enter the **exact amount** you sent and attach the receipt (screenshot, photo or PDF); add a note if needed. Tap **Send payment**.',
      'Officers check each payment and mark it verified or rejected. Your card shows what you’ve paid and your balance; your receipts are listed there too.',
    ],
  },
  {
    id: 'my-climbs', title: 'Using My Climbs', registration: true,
    steps: [
      'Open **My Climbs** to see every climb you registered for, newest first, with its status, payment status, total, paid and balance.',
      { text: 'On a card (each shows only when it applies):', details: ['**Send payment**', '**Required documents**: upload a form, medical certificate, permit or signed waiver (once each)', '**Edit my details**: mobile, emergency contact, health', '**Signed waiver (print)**: print or save as PDF for the jump-off', '**Cancel registration**: before the climb is over'] },
      'On the climb’s own page, registrants also see **For registrants**: pre-climb meetings, resources and who’s joining.',
    ],
  },
  {
    id: 'cancelling', title: 'Waitlists, cancelling and refunds', registration: true,
    steps: [
      'When a waitlisted climb gets a free slot, the earliest waitlisted registration moves up.',
      'Can’t go? **Cancel registration** on My Climbs, any time before the climb ends. Only an officer can undo it.',
      'Paid already? Officers contact you about a refund under the club’s refund policy.',
    ],
  },
  {
    id: 'faq', title: 'Frequently asked questions',
    steps: [
      '**Do I need to be an MMS member to join?** No. Guests are welcome; they pay a small guest fee per climb.',
      '**Do I need an account to see climbs?** No. Climb pages are open to everyone.',
      '**What do the difficulty and trail class mean?** See the beginner guide: difficulty is 1–9 (shown as Easy, Moderate or Advanced), trail class is 1–6 for technical terrain.',
      '**Who sees my health information?** Only the climb’s officers and admins, for emergencies.',
    ],
  },
  {
    id: 'troubleshooting', title: 'Troubleshooting',
    steps: [
      '**Google sign-in does nothing:** you’re in an app’s built-in browser. Open the page in Chrome, Safari or Edge.',
      '**No verification or reset email:** check spam, wait a few minutes, and check the address.',
      '**Upload refused:** use a photo or PDF (Word also works for documents). Big phone photos are shrunk automatically.',
      '**Weather says it couldn’t load:** the climb’s location couldn’t be matched to a place; officers can add the town, e.g. “Kabayan, Benguet”.',
    ],
  },
];
