import { PRIVACY_NOTICE_VERSION, privacyNotice } from '../../data/privacyNotice';
import { waiverSections, type TextSection } from '../../data/waiver';
import type { SectionProps } from './RegisterFields';

function Sections({ sections }: { sections: TextSection[] }) {
  return sections.map((s) => (
    <section key={s.heading}>
      <h4>{s.heading}</h4>
      {s.body && <p>{s.body}</p>}
      {s.items && <ul>{s.items.map((i) => <li key={i}>{i}</li>)}</ul>}
    </section>
  ));
}

function Check({ checked, label, error, onChange }: { checked: boolean; label: string; error?: string; onChange: (v: boolean) => void }) {
  return (
    <>
      <label className="consent-check"><input type="checkbox" checked={checked} aria-invalid={Boolean(error)} onChange={(e) => onChange(e.target.checked)} /> {label}</label>
      {error && <small className="field-error">{error}</small>}
    </>
  );
}

const WAIVER_AGREE = 'I have read, understood, and voluntarily agree to all terms of this Waiver and Release of Liability. I confirm that all information in this registration is accurate and complete.';
const PRIVACY_AGREE = 'I agree to the Privacy Notice and to MMS processing my details, including health information, to run this climb.';

// Waiver (typed signature) and Data Privacy Act consent, both recorded on the registration.
export default function WaiverConsent({ activity, form, errors, set }: SectionProps & { activity: string }) {
  return (
    <fieldset className="register-section">
      <legend>Waiver and privacy</legend>
      <div className="legal-box" role="region" tabIndex={0} aria-label="Waiver and Release of Liability"><Sections sections={waiverSections(activity)} /></div>
      <Check checked={form.waiverAgreed} error={errors.waiverAgreed} onChange={(v) => set('waiverAgreed', v)} label={WAIVER_AGREE} />
      <div className="editor-field">
        <label htmlFor="reg-sig">Type your full name to sign *</label>
        <input id="reg-sig" value={form.sigName} aria-invalid={Boolean(errors.sigName)} onChange={(e) => set('sigName', e.target.value)} />
        {errors.sigName && <small className="field-error">{errors.sigName}</small>}
      </div>
      <details className="legal-details">
        <summary>Privacy Notice (version {PRIVACY_NOTICE_VERSION})</summary>
        <div className="legal-box"><Sections sections={privacyNotice} /></div>
      </details>
      <Check checked={form.privacyConsent} error={errors.privacyConsent} onChange={(v) => set('privacyConsent', v)} label={PRIVACY_AGREE} />
    </fieldset>
  );
}
