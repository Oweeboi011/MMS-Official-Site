// MMS terms shown as tooltips (GlossaryText) and on /about/glossary. Wording to be confirmed by officers.
export interface GlossaryTerm {
  term: string;
  name: string;
  about: string;
}

export const glossary: GlossaryTerm[] = [
  { term: 'BMCM', name: 'Basic Mountaineering Course for Members', about: 'The course every new MMS member takes: lectures plus field sessions, capped by a graduation climb.' },
  { term: 'BMC', name: 'Basic Mountaineering Course', about: 'The core training on safe, responsible climbing that BMCM is built on.' },
  { term: 'AMC', name: 'Advanced Mountaineering Course', about: 'Training for members ready for harder, longer, and multi-day climbs.' },
  { term: 'LNT', name: 'Leave No Trace', about: 'Outdoor ethics for minimal impact: pack out trash, stay on trail, respect wildlife and local communities.' },
  { term: 'SART', name: 'Search and Rescue Team', about: 'Trained MMS members who keep climbs safe and respond to trail emergencies.' },
];
