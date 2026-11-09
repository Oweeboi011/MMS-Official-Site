// climbPrivate/{climbId}: registrants and admins only (rules). Meetings + resources set by admins; participants by functions.
import { flatCodec, type Column } from './records';

type Doc = Record<string, unknown>;
const str = (v: unknown) => (typeof v === 'string' ? v : '');
const https = (v: unknown) => (str(v).startsWith('https://') ? str(v) : '');
const list = (v: unknown) => (Array.isArray(v) ? v.map((x) => (x ?? {}) as Doc) : []);

interface Meeting { date: string; time: string; location: string; notes: string; link: string; recordingLink: string }
export interface ClimbPrivate {
  meetings: Meeting[];
  resources: { label: string; url: string }[];
  members: string[];
  guests: string[];
}

export function toClimbPrivate(d: Doc): ClimbPrivate {
  const people = list(d.participants).map((p) => ({ name: str(p.name), member: p.memberType === 'member' })).filter((p) => p.name);
  return {
    meetings: list(d.preClimbMeetings)
      .map((m) => ({ date: str(m.date), time: str(m.time), location: str(m.location), notes: str(m.notes), link: https(m.link), recordingLink: https(m.recordingLink) }))
      .sort((a, b) => a.date.localeCompare(b.date)),
    resources: list(d.resources).map((r) => ({ label: str(r.label), url: https(r.url) })).filter((r) => r.url),
    members: people.filter((p) => p.member).map((p) => p.name),
    guests: people.filter((p) => !p.member).map((p) => p.name),
  };
}

// Admin editor columns (old app shapes).
export const meetingColumns: Column[] = [
  { key: 'date', label: 'Date (YYYY-MM-DD)', required: true, max: 10 },
  { key: 'time', label: 'Time', max: 40 },
  { key: 'location', label: 'Where', max: 200 },
  { key: 'link', label: 'Online link', kind: 'link', max: 500 },
  { key: 'notes', label: 'Notes', max: 500 },
];
export const resourceColumns: Column[] = [
  { key: 'label', label: 'Label', required: true, max: 120 },
  { key: 'url', label: 'Link', kind: 'link', required: true, max: 500 },
];
export const meetingCodec = flatCodec(meetingColumns);
export const resourceCodec = flatCodec(resourceColumns);
