import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';
import PageHero from '../components/PageHero';
import SignInForm from '../components/SignInForm';
import FeeBreakdown from '../components/register/FeeBreakdown';
import RegisterFields from '../components/register/RegisterFields';
import WaiverConsent from '../components/register/WaiverConsent';
import type { ClimbDetail } from '../data/climbDetail';
import { initialForm, validateRegistration, type FormErrors, type RegistrationForm } from '../data/registration';
import type { Account } from '../services/auth';
import { registrationEnabled } from '../services/firebaseEnv';
import { hasRegistered, register } from '../services/registrations';
import { useAccount } from '../services/useAccount';
import { useClimb } from '../services/useClimb';

const HERO_IMAGE = '/images/page-open-climbs.webp';

function Shell({ climb, children }: { climb?: ClimbDetail; children: ReactNode }) {
  return (
    <>
      <PageHero eyebrow="Register" title={climb?.title ?? 'Climb registration'} intro={climb ? [climb.dates, climb.location].filter(Boolean).join(' · ') : ''} image={HERO_IMAGE} />
      <main><section className="section page-section"><div className="shell register-shell">{children}</div></section></main>
    </>
  );
}

const climbLink = (id: string) => <Link className="btn" to={`/climbs/${id}`}>Back to the climb</Link>;

// undefined = checking; true / false = already registered or not.
function useAlreadyRegistered(climbId: string, uid: string | null) {
  const [state, setState] = useState<{ key: string; value: boolean } | null>(null);
  const key = `${climbId}|${uid}`;
  useEffect(() => {
    if (!uid) return undefined;
    let live = true;
    hasRegistered(climbId, uid).then((value) => { if (live) setState({ key, value }); }, () => { if (live) setState({ key, value: false }); });
    return () => { live = false; };
  }, [climbId, uid, key]);
  return state?.key === key ? state.value : undefined;
}

function Form({ climb, account }: { climb: ClimbDetail; account: Account }) {
  const [form, setForm] = useState<RegistrationForm>(initialForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<'idle' | 'saving' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const set = <K extends keyof RegistrationForm>(key: K, value: RegistrationForm[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const found = validateRegistration(form);
    setErrors(found);
    if (Object.keys(found).length) return setMessage(`Please fix ${Object.keys(found).length} item(s) below.`);
    setStatus('saving');
    try {
      await register({ id: climb.id ?? '', title: climb.title, dateLabel: climb.dates, location: climb.location }, account, form, climb.feeItems);
      setStatus('done');
    } catch (err) {
      setStatus('error');
      setMessage(`Not registered: ${(err as Error).message}`);
    }
  };
  if (status === 'done') {
    return (
      <div role="status">
        <h2>You’re registered.</h2>
        <p>Your slot is pending until the climb officers confirm it and your payment. A confirmation email is on its way to {account.email}.</p>
        {climbLink(climb.id ?? '')}
      </div>
    );
  }
  const props = { form, errors, set };
  return (
    <form className="register-form" onSubmit={(e) => void submit(e)} noValidate>
      {message && <p className="climb-notice" role="alert">{message}</p>}
      <p className="climb-muted">Signed in as {account.email}. Fields marked * are required.</p>
      <RegisterFields {...props} />
      <FeeBreakdown {...props} fees={climb.feeItems} />
      <WaiverConsent {...props} activity={[climb.title, climb.dates, climb.location].filter(Boolean).join(' · ')} />
      <button type="submit" className="btn btn-primary" disabled={status === 'saving'}>{status === 'saving' ? 'Registering…' : 'Register'}</button>
    </form>
  );
}

function Signed({ climb, account }: { climb: ClimbDetail; account: Account }) {
  const already = useAlreadyRegistered(climb.id ?? '', account.uid);
  if (already === undefined) return <p role="status">Checking your registrations…</p>;
  if (already) return <><p>You’re already registered for this climb.</p>{climbLink(climb.id ?? '')}</>;
  return <Form climb={climb} account={account} />;
}

function Gate({ climb }: { climb: ClimbDetail }) {
  const state = useAccount();
  if (climb.cancelled || climb.over || climb.status !== 'Open') return <><p>Registration for this climb is closed.</p>{climbLink(climb.id ?? '')}</>;
  if (state.status === 'loading') return <p role="status">Checking your sign-in…</p>;
  if (state.status === 'signedIn') return <Signed climb={climb} account={state.account} />;
  if (state.status === 'error') return <p role="alert">Couldn’t check your sign-in: {state.error}</p>;
  return <><p>Sign in or create a free account to register. Guests welcome: no MMS membership needed.</p><SignInForm /></>;
}

export default function RegisterPage() {
  const { id = '' } = useParams();
  const climb = useClimb(id);
  if (climb === undefined) return <Shell><p role="status">Loading…</p></Shell>;
  if (climb === null) return <Shell><p>This climb isn’t on the schedule.</p><Link className="btn" to="/activities/open-climbs">All open climbs</Link></Shell>;
  if (!registrationEnabled) {
    return <Shell climb={climb}><p>Registration on this site opens soon. For now, send us a message to join this climb.</p><Link className="btn btn-primary" to="/#join">Ask to join</Link> {climbLink(id)}</Shell>;
  }
  return <Shell climb={climb}><Gate climb={climb} /></Shell>;
}
