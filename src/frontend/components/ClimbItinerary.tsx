import type { ItineraryDay } from '../data/climbDetail';

// #137: day-by-day plan. Public here: climb docs are world-readable, so the old app's sign-in gate hid nothing.
export default function ClimbItinerary({ days }: { days: ItineraryDay[] }) {
  if (!days.length) return null;
  return (
    <section className="climb-block" aria-labelledby="climb-itinerary">
      <h2 id="climb-itinerary">Itinerary</h2>
      {days.map((d, i) => (
        <div className="itinerary-day" key={d.day || i}>
          <h3>{d.day || `Day ${i + 1}`}</h3>
          <dl>
            {d.entries.map((e, j) => (
              <div key={`${e.time}-${j}`}><dt>{e.time}</dt><dd>{e.activity}</dd></div>
            ))}
          </dl>
        </div>
      ))}
    </section>
  );
}
