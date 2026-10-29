import { Link } from 'react-router-dom';
import { asset } from '../lib/asset';
import { photoCredits } from '../data/credits';

export default function CreditsPage() {
  return (
    <>
      <header className="simple-header">
      </header>
      <main>
        <section className="section">
          <div className="shell">
            <div className="section-head">
              <div><div className="eyebrow" style={{ color: 'var(--red)' }}>Credits</div><h2>Photo credits.</h2></div>
              <p>Photos are from Wikimedia Commons, resized and cropped for this site. Thank you to the photographers.</p>
            </div>
            <ul className="credits">
              {photoCredits.map((c) => (
                <li key={c.src}>
                  <img src={asset(c.src)} alt="" loading="lazy" />
                  <div>
                    <strong>{c.place}</strong>
                    <span>
                      “<a href={c.source} target="_blank" rel="noopener noreferrer">{c.title}</a>” by {c.author},{' '}
                      {c.licenseUrl ? <a href={c.licenseUrl} target="_blank" rel="noopener noreferrer">{c.license}</a> : c.license}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
        <section className="section">
          <div className="shell">
            <div className="section-head">
              <div><div className="eyebrow" style={{ color: 'var(--red)' }}>Credits</div><h2>Data credits.</h2></div>
              <p>
                Mountain names, elevations, and provinces on the <Link to="/explore/mountains">Mountains</Link> page are adapted from{' '}
                “<a href="https://en.wikipedia.org/wiki/List_of_mountains_in_the_Philippines" target="_blank" rel="noopener noreferrer">List of mountains in the Philippines</a>” by Wikipedia contributors,{' '}
                <a href="https://creativecommons.org/licenses/by-sa/4.0" target="_blank" rel="noopener noreferrer">CC BY-SA 4.0</a>. Trail classes and climb types are estimates pending Climbs Committee review.
              </p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
