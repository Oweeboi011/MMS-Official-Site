import { useState } from 'react';
import { Link } from 'react-router-dom';

const KEY = 'mms.welcomed';
const seen = () => {
  try {
    return localStorage.getItem(KEY) === '1';
  } catch {
    return true; // storage blocked: don't nag every visit
  }
};

// #149 first-login welcome: three things to know, once per browser.
export default function Welcome() {
  const [show, setShow] = useState(() => !seen());
  if (!show) return null;
  const close = () => {
    try { localStorage.setItem(KEY, '1'); } catch { /* storage blocked */ }
    setShow(false);
  };
  return (
    <section className="register-section welcome" aria-labelledby="welcome-title">
      <h2 id="welcome-title">Welcome to My Climbs</h2>
      <ol>
        <li>Find a climb on <Link to="/activities/open-climbs">Open Climbs</Link> and tap <strong>Register</strong>. Guests welcome.</li>
        <li>Your climbs show here: pay by GCash, upload documents, and see what to do next.</li>
        <li>New to mountaineering? Read the <Link to="/activities/open-climbs/guide">beginner guide</Link>; questions: <Link to="/help">help</Link>.</li>
      </ol>
      <button type="button" className="btn" onClick={close}>Got it</button>
    </section>
  );
}
