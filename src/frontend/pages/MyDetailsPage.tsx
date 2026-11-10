import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import PageHero from '../components/PageHero';
import SignInForm from '../components/SignInForm';
import { EMPTY, LEVELS, MAX, TRIBES, missingEmergency, validate, type Details } from '../data/memberDetails';
import { myDetails, saveMyDetails } from '../services/memberDetails';
import { useAccount } from '../services/useAccount';

type Text = Exclude<keyof Details, 'experienceLevel' | 'tribe' | 'medicalConditions'>;
const TEXT_FIELDS: [Text, string][] = [
  ['mobile', 'Mobile number'], ['dateOfBirth', 'Date of birth'], ['address', 'Address'],
  ['ecName', 'Emergency contact name'], ['ecMobile', 'Emergency contact mobile'], ['ecRelationship', 'Emergency contact relationship'],
];

function Choice({ id, label, value, options, onChange }: { id: string; label: string; value: string; options: readonly (readonly [string, string])[]; onChange: (v: string) => void }) {
  return (
    <div className="editor-field">
      <label htmlFor={id}>{label}</label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">Not set</option>
        {options.map(([k, name]) => <option key={k} value={k}>{name}</option>)}
      </select>
    </div>
  );
}

function Form({ uid }: { uid: string }) {
  const [d, setD] = useState<Details | null>(null);
  const [state, setState] = useState({ busy: false, message: '', ok: false });
  useEffect(() => {
    myDetails(uid).then(setD, (e: Error) => { setD(EMPTY); setState({ busy: false, ok: false, message: `Couldn’t load your saved details: ${e.message}` }); });
  }, [uid]);
  if (!d) return <p role="status">Loading…</p>;
  const set = (k: keyof Details) => (v: string) => setD({ ...d, [k]: v });
  const save = async (e: FormEvent) => {
    e.preventDefault();
    const problem = validate(d);
    if (problem) return setState({ busy: false, ok: false, message: problem });
    setState({ busy: true, ok: false, message: '' });
    try {
      await saveMyDetails(uid, d);
      setState({ busy: false, ok: true, message: 'Saved.' });
    } catch (err) {
      setState({ busy: false, ok: false, message: `Not saved: ${(err as Error).message}` });
    }
  };
  const text = (k: Text) => {
    const label = TEXT_FIELDS.find(([key]) => key === k)?.[1] ?? k;
    return (
      <div className="editor-field">
        <label htmlFor={`d-${k}`}>{label}</label>
        <input id={`d-${k}`} maxLength={MAX[k]} value={d[k]} onChange={(e) => set(k)(e.target.value)} />
      </div>
    );
  };
  return (
    <form className="register-form" onSubmit={(e) => void save(e)} noValidate>
      <p className="climb-muted">Only you and the officers running your climbs can see this.</p>
      {missingEmergency(d) && <p className="climb-notice" role="note">Add an emergency contact so officers can reach someone if needed.</p>}
      <fieldset className="register-section"><legend>Contact</legend>
        {text('mobile')}{text('dateOfBirth')}{text('address')}
      </fieldset>
      <fieldset className="register-section"><legend>Emergency contact</legend>
        {text('ecName')}{text('ecMobile')}{text('ecRelationship')}
      </fieldset>
      <fieldset className="register-section"><legend>Climbing and health</legend>
        <Choice id="d-level" label="Climbing experience" value={d.experienceLevel} options={LEVELS} onChange={set('experienceLevel')} />
        <div className="editor-field">
          <label htmlFor="d-medical">Medical conditions or allergies</label>
          <textarea id="d-medical" maxLength={MAX.medicalConditions} value={d.medicalConditions} onChange={(e) => set('medicalConditions')(e.target.value)} />
        </div>
      </fieldset>
      <fieldset className="register-section"><legend>MMS profile (optional)</legend>
        <div className="editor-field">
          <label htmlFor="d-batch">BMC batch</label>
          <input id="d-batch" maxLength={MAX.batch} value={d.batch} onChange={(e) => set('batch')(e.target.value)} />
        </div>
        <Choice id="d-tribe" label="Sportsfest tribe" value={d.tribe} options={TRIBES} onChange={set('tribe')} />
      </fieldset>
      {state.message && <p role={state.ok ? 'status' : 'alert'} className={state.ok ? 'form-saved' : 'field-error'}>{state.message}</p>}
      <div className="editor-actions"><button type="submit" className="btn btn-primary" disabled={state.busy}>Save details</button></div>
    </form>
  );
}

// #78: your contact, emergency and health details, plus optional batch and tribe (memberDetails, private).
export default function MyDetailsPage() {
  const state = useAccount();
  let body = <p role="status">Checking your sign-in…</p>;
  if (state.status === 'signedIn') body = <Form uid={state.account.uid} />;
  else if (state.status !== 'loading') body = <><p>Sign in to edit your details.</p><SignInForm /></>;
  return (
    <>
      <PageHero compact eyebrow="Account" title="My details" intro="Contact, emergency and health details, and your MMS profile." image="/images/page-open-climbs.webp" />
      <main><section className="section page-section"><div className="shell register-shell">{body}<p><Link to="/account/climbs">My Climbs</Link></p></div></section></main>
    </>
  );
}
