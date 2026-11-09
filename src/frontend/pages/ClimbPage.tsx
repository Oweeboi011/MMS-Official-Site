import { Suspense, lazy } from 'react';
import { Link, useParams } from 'react-router-dom';
import ClimbItinerary from '../components/ClimbItinerary';
import ClimbPhotos from '../components/ClimbPhotos';
import ClimbWeather from '../components/ClimbWeather';
import ContentBlocks from '../components/ContentBlocks';
import PageHero from '../components/PageHero';
import ShareClimb from '../components/ShareClimb';
import TrailMaps from '../components/TrailMaps';
import { defaultPacking, type ClimbDetail } from '../data/climbDetail';
import { leaveNoTrace, type ContentBlock } from '../data/subpages';
import { registrationEnabled } from '../services/firebaseEnv';
import { useClimb } from '../services/useClimb';

// Registrants-only section needs the Firebase SDK: its own chunk, only when registration is on.
const RegistrantArea = lazy(() => import('../components/RegistrantArea'));

const SCHEDULE = '/activities/open-climbs';
const HERO_IMAGE = '/images/page-open-climbs.webp';

const active = (climb: ClimbDetail) => !climb.over && !climb.cancelled;

function notice(climb: ClimbDetail): string {
  if (climb.cancelled) return 'This climb was cancelled.';
  if (climb.postponed) return 'This climb is postponed. New dates will be posted here.';
  if (climb.over) return 'This climb is completed.';
  if (climb.status === 'Closed') return 'Registration for this climb is closed.';
  return climb.slotsLeft === 0 ? 'This climb is full. New registrations join the waitlist and move up if a slot opens.' : '';
}

function profile(climb: ClimbDetail): ContentBlock[] {
  const about = [climb.description, climb.features && `Features: ${climb.features}`].filter(Boolean).join('\n\n');
  return [
    ...(climb.stats.length ? [{ type: 'stats' as const, items: climb.stats }] : []),
    ...(about ? [{ type: 'text' as const, eyebrow: 'About the climb', paragraphs: about.split(/\n{2,}/) }] : []),
    ...(climb.fees.length && active(climb) ? [{ type: 'table' as const, eyebrow: 'Fees', title: 'What it costs.', columns: ['Fee', 'Amount', 'Who pays'], rows: climb.fees }] : []),
    ...(climb.drive && active(climb) ? [{ type: 'text' as const, eyebrow: 'Outreach', title: climb.drive.beneficiary ? `Donation drive for ${climb.drive.beneficiary}.` : 'Donation drive.', paragraphs: [climb.drive.description || 'This climb collects donations for a community on the trail. Registrants can pledge cash or items on My Climbs.', ...(climb.drive.items.length ? [`Needed: ${climb.drive.items.join(', ')}.`] : [])] }] : []),
    ...(climb.officers.length ? [{ type: 'people' as const, eyebrow: 'Climb officers', title: 'Your team leaders.', items: climb.officers }] : []),
  ];
}

function prep(climb: ClimbDetail): ContentBlock[] {
  if (!active(climb)) return [];
  return [
    { type: 'checklist', eyebrow: 'Pack', title: 'Things to bring.', items: climb.thingsToBring.length ? climb.thingsToBring : defaultPacking },
    { type: 'checklist', eyebrow: 'Leave No Trace', title: 'The 7 LNT principles.', items: leaveNoTrace },
  ];
}

function Missing({ loading }: { loading: boolean }) {
  return (
    <>
      <PageHero eyebrow="Open climbs" title={loading ? 'Loading climb…' : 'Climb not found'} intro={loading ? '' : 'This climb isn’t on the schedule. It may have been removed or the link is wrong.'} image={HERO_IMAGE} />
      <main><section className="section"><div className="shell">{!loading && <Link className="btn btn-primary" to={SCHEDULE}>See all open climbs</Link>}</div></section></main>
    </>
  );
}

// Only for climbs still ahead: itinerary, forecast, water warning.
function Upcoming({ climb }: { climb: ClimbDetail }) {
  return (
    <>
      <ClimbItinerary days={climb.itinerary} />
      <ClimbWeather climb={climb} />
      {climb.waterNote && <p className="climb-notice" role="note"><strong>Water source:</strong> {climb.waterNote}</p>}
    </>
  );
}

function Cta({ climb, id }: { climb: ClimbDetail; id: string }) {
  const open = active(climb) && climb.status === 'Open';
  return (
    <div className="event-cta">
      {open && registrationEnabled && <Link className="btn btn-primary" to={`/climbs/${id}/register`}>Register <span aria-hidden="true">→</span></Link>}
      {open && !registrationEnabled && <Link className="btn btn-primary" to="/#join">Ask to join this climb <span aria-hidden="true">→</span></Link>}
      {' '}<Link className="btn" to={SCHEDULE}>All open climbs</Link>
    </div>
  );
}

export default function ClimbPage() {
  const { id = '' } = useParams();
  const climb = useClimb(id);
  if (!climb) return <Missing loading={climb === undefined} />;
  const note = notice(climb);
  return (
    <>
      <PageHero eyebrow={`${climb.type} climb · Guests welcome`} title={climb.title} intro={[climb.dates, climb.location].filter(Boolean).join(' · ')} image={HERO_IMAGE} />
      <main>
        <section className="section page-section">
          <div className="shell">
            {note && <p className="climb-notice" role="note">{note}</p>}
            {!climb.cancelled && <ShareClimb climb={climb} />}
            <ContentBlocks blocks={profile(climb)} />
            <ClimbPhotos photos={climb.photos} title={climb.title} />
            {registrationEnabled && !climb.cancelled && <Suspense fallback={null}><RegistrantArea climb={climb} /></Suspense>}
            {active(climb) && <Upcoming climb={climb} />}
            <TrailMaps maps={climb.trailMaps} title={climb.title} />
            <ContentBlocks blocks={prep(climb)} />
            <Cta climb={climb} id={id} />
          </div>
        </section>
      </main>
    </>
  );
}
