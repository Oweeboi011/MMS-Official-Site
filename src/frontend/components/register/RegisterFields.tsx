import { EXPERIENCE_LEVELS, type FormErrors, type RegistrationForm } from '../../data/registration';

export interface SectionProps {
  form: RegistrationForm;
  errors: FormErrors;
  set: <K extends keyof RegistrationForm>(key: K, value: RegistrationForm[K]) => void;
}

type TextKey = 'fullName' | 'mobile' | 'dateOfBirth' | 'address' | 'ecName' | 'ecMobile' | 'ecRelationship';

function Text({ k, label, type = 'text', required, auto, form, errors, set }: SectionProps & { k: TextKey; label: string; type?: string; required?: boolean; auto?: string }) {
  const id = `reg-${k}`;
  return (
    <div className="editor-field">
      <label htmlFor={id}>{label}{required ? ' *' : ''}</label>
      <input id={id} type={type} autoComplete={auto} value={form[k]} aria-invalid={Boolean(errors[k])} aria-describedby={errors[k] ? `${id}-error` : undefined} onChange={(e) => set(k, e.target.value)} />
      {errors[k] && <small id={`${id}-error`} className="field-error">{errors[k]}</small>}
    </div>
  );
}

// You, your emergency contact, health and experience.
export default function RegisterFields(props: SectionProps) {
  const { form, set } = props;
  return (
    <>
      <fieldset className="register-section">
        <legend>About you</legend>
        <Text {...props} k="fullName" label="Full name" required auto="name" />
        <Text {...props} k="mobile" label="Mobile number" type="tel" required auto="tel" />
        <Text {...props} k="dateOfBirth" label="Date of birth" type="date" auto="bday" />
        <Text {...props} k="address" label="Address" auto="street-address" />
        <div className="editor-field">
          <span id="reg-membertype">Joining as *</span>
          <div className="finder-options" role="radiogroup" aria-labelledby="reg-membertype">
            {([['joiner', 'Guest (not an MMS member)'], ['member', 'MMS member']] as const).map(([value, label]) => (
              <label key={value} className={form.memberType === value ? 'is-selected' : undefined}>
                <input type="radio" name="memberType" checked={form.memberType === value} onChange={() => set('memberType', value)} /> {label}
              </label>
            ))}
          </div>
        </div>
        <div className="editor-field">
          <label htmlFor="reg-experience">Climbing experience</label>
          <select id="reg-experience" value={form.experienceLevel} onChange={(e) => set('experienceLevel', e.target.value)}>
            {EXPERIENCE_LEVELS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </div>
      </fieldset>
      <fieldset className="register-section">
        <legend>Emergency contact</legend>
        <Text {...props} k="ecName" label="Name" required />
        <Text {...props} k="ecMobile" label="Mobile number" type="tel" required />
        <Text {...props} k="ecRelationship" label="Relationship to you" required />
      </fieldset>
      <fieldset className="register-section">
        <legend>Health</legend>
        <div className="editor-field">
          <label htmlFor="reg-medical">Medical conditions, allergies, medicines (blank if none)</label>
          <textarea id="reg-medical" rows={3} maxLength={1000} value={form.medicalConditions} onChange={(e) => set('medicalConditions', e.target.value)} />
        </div>
      </fieldset>
    </>
  );
}
