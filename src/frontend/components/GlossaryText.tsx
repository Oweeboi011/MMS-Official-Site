import { Fragment } from 'react';
import { glossary } from '../data/glossary';
import { splitTerms, termPattern } from '../lib/terms';

const names = new Map(glossary.map((g) => [g.term, g.name]));
const pattern = termPattern([...names.keys()]);

// Abbreviations explained on hover, tap/focus (CSS shows the title), and to screen readers. Full list: /about/glossary.
export default function GlossaryText({ text }: { text: string }) {
  return (
    <>
      {splitTerms(text, pattern).map((seg, i) =>
        typeof seg === 'string'
          ? <Fragment key={i}>{seg}</Fragment>
          : <abbr key={i} title={names.get(seg.term)} tabIndex={0}>{seg.term}<span className="sr-only"> ({names.get(seg.term)})</span></abbr>,
      )}
    </>
  );
}
