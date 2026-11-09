import { Link, useParams } from 'react-router-dom';
import ClimbPhotos from '../components/ClimbPhotos';
import ClimbWeather from '../components/ClimbWeather';
import ContentBlocks from '../components/ContentBlocks';
import PageHero from '../components/PageHero';
import ShareClimb from '../components/ShareClimb';
import TrailMaps from '../components/TrailMaps';
import { defaultPacking, type ClimbDetail } from '../data/climbs';
import { leaveNoTrace, type ContentBlock } from '../data/subpages';
import { useClimb } from '../services/useSiteData';

const SCHEDULE = '/activities/open-climbs';
const HERO_IMAGE = '/images/page-open-climbs.webp';

const active = (climb: ClimbDetail) => !climb.over && !climb.cancelled;

function notice(climb: ClimbDetail): string {
  if (climb.cancelled) return 'This climb was cancelled.';
  if (climb.postponed) return 'This climb is postponed. New dates will be posted here.';
  if (climb.over) return 'This climb is completed.';
  return climb.status === 'Closed' ? 'Registration for this climb is closed.' : '';
}

function profile(climb: ClimbDetail): ContentBlock[] {
  const about = [climb.description, climb.features && `Features: ${climb.features}`].filter(Boolean).join('\n\n');
  return [
    ...(climb.stats.length ? [{ type: 'stats' as const, items: climb.stats }] : []),
    ...(about ? [{ type: 'text' as const, eyebrow: 'About the climb', paragraphs: about.split(/\n{2,}/) }] : []),
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
            {active(climb) && <ClimbWeather climb={climb} />}
            <TrailMaps maps={climb.trailMaps} title={climb.title} />
            {climb.waterNote && active(climb) && <p className="climb-notice" role="note"><strong>Water source:</strong> {climb.waterNote}</p>}
            <ContentBlocks blocks={prep(climb)} />
            <div className="event-cta">
              {active(climb) && climb.status === 'Open' && <Link className="btn btn-primary" to="/#join">Ask to join this climb <span aria-hidden="true">→</span></Link>}
              {' '}<Link className="btn" to={SCHEDULE}>All open climbs</Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
