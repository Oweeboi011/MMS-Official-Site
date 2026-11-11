import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { INTERESTS, emptyInquiry, inquiryProblem, type Interest, type InquiryForm as Form } from '../data/inquiry';
import { inquiriesOpen, sendInquiry } from '../services/inquiry';

// L2: ask the club about membership or a climb; officers read it in Admin. Stays hidden where writes are off (preview).
export default function InquiryForm() {
  const [form, setForm] = useState<Form>(emptyInquiry);
  const [state, setState] = useState<{ busy: boolean; sent: boolean; message: string }>({ busy: false, sent: false, message: '' });
  if (!inquiriesOpen) return null;
  const set = <K extends keyof Form>(key: K, value: Form[K]) => setForm((f) => ({ ...f, [key]: value }));
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const problem = inquiryProblem(form);
    if (problem) return setState({ busy: false, sent: false, message: problem });
    setState({ busy: true, sent: false, message: 'Sending…' });
    try {
      await sendInquiry(form);
      setForm(emptyInquiry);
      setState({ busy: false, sent: true, message: 'Thank you. An officer will reply to your email.' });
    } catch (err) {
      setState({ busy: false, sent: false, message: `Not sent: ${(err as Error).message}` });
    }
  };
  return (
    <section className="shell inquiry" id="inquiry">
      <h2>Ask us a question</h2>
      <form onSubmit={(e) => void submit(e)} noValidate>
        <label htmlFor="inq-name">Name</label>
        <input id="inq-name" maxLength={120} autoComplete="name" value={form.name} onChange={(e) => set('name', e.target.value)} />
        <label htmlFor="inq-email">Email</label>
        <input id="inq-email" type="email" maxLength={200} autoComplete="email" value={form.email} onChange={(e) => set('email', e.target.value)} />
        <label htmlFor="inq-phone">Mobile (optional)</label>
        <input id="inq-phone" type="tel" maxLength={40} autoComplete="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} />
        <label htmlFor="inq-interest">About</label>
        <select id="inq-interest" value={form.interest} onChange={(e) => set('interest', e.target.value as Interest)}>
          {INTERESTS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
        <label htmlFor="inq-message">Message</label>
        <textarea id="inq-message" rows={5} maxLength={2000} value={form.message} onChange={(e) => set('message', e.target.value)} />
        <label className="check"><input type="checkbox" checked={form.consent} onChange={(e) => set('consent', e.target.checked)} /> I agree MMS may use these details to reply (<Link to="/privacy">privacy notice</Link>).</label>
        {state.message && <p role={state.sent ? 'status' : 'alert'}>{state.message}</p>}
        <button type="submit" className="btn btn-primary" disabled={state.busy}>Send</button>
      </form>
    </section>
  );
}
