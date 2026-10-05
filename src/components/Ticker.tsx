import { tickerItems } from '../data/content';

export default function Ticker() {
  // Items are rendered twice so the -50% translate loops seamlessly.
  const items = [...tickerItems, ...tickerItems];
  return (
    <div className="ticker" aria-hidden="true">
      <div className="ticker-track">
        {items.map((item, i) => <span key={i}>{item}</span>)}
      </div>
    </div>
  );
}
