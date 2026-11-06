// Whether a survey can be taken now: closed by flag or past its close date; 'soon' until a real form link exists.
type SurveyState = 'open' | 'soon' | 'closed';

interface SurveyLike {
  status: string;
  closes?: string;
  formUrl: string;
}

export function surveyState(s: SurveyLike, now: Date): SurveyState {
  const closesAt = s.closes ? Date.parse(`${s.closes} 23:59:59`) : NaN;
  if (s.status === 'Closed' || closesAt < now.getTime()) return 'closed';
  return s.formUrl && s.formUrl !== '#' ? 'open' : 'soon';
}
