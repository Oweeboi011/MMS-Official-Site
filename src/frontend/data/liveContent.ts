// Firestore docs (item 22) → the shapes pages already render. Sample content in content.ts stays the fallback.
import type { Doc } from '../lib/firestoreRest';
import { surveyState } from '../lib/survey';
import {
  contactName, contactPhone, membershipEmail, motto, photoAlbumsUrl, previewNotice, socials,
  type Announcement, type NavLink, type Officer, type Survey,
} from './content';
import type { ContentBlock } from './subpages';

const str = (v: unknown) => (typeof v === 'string' ? v : '');
const manilaDate = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'Asia/Manila' });

export function toAnnouncement(d: Doc): Announcement {
  return {
    date: d.publishedAt instanceof Date ? manilaDate.format(d.publishedAt) : '',
    category: str(d.category) as Announcement['category'],
    title: str(d.title),
    summary: str(d.summary),
  };
}

function toSurvey(d: Doc): Survey {
  return {
    title: str(d.title),
    description: str(d.description),
    audience: str(d.audience) as Survey['audience'],
    status: str(d.status) === 'Closed' ? 'Closed' : 'Open',
    formUrl: str(d.formUrl) || '#',
    closes: str(d.closes) || undefined,
  };
}

// Takeable surveys first (same closed rule the page shows), then by title: Firestore auto-ids carry no order.
export function toSurveys(docs: Doc[], now: Date): Survey[] {
  const closed = (s: Survey) => Number(surveyState(s, now) === 'closed');
  return docs.map(toSurvey).sort((a, b) => closed(a) - closed(b) || a.title.localeCompare(b.title));
}

interface OfficerDoc extends Officer { body: string; current: boolean; term: string; order: number }

function toOfficer(d: Doc): OfficerDoc {
  return { body: str(d.body), role: str(d.role), name: str(d.name), current: d.current === true, term: str(d.term), order: Number(d.order) || 0 };
}

const byOrder = (a: OfficerDoc, b: OfficerDoc) => a.order - b.order;
const roleAndName = ({ role, name }: OfficerDoc): Officer => ({ role, name });

function currentOf(docs: Doc[], body: string): Officer[] {
  return docs.map(toOfficer).filter((o) => o.current && o.body === body).sort(byOrder).map(roleAndName);
}

export const currentExecom = (docs: Doc[]) => currentOf(docs, 'execom');

export const leadershipPath = '/about/leadership';
const bodyByEyebrow: Record<string, string> = { 'Executive Committee': 'execom', 'Training Committee': 'tcomm', 'Board of Trustees': 'bot' };
const bodyLabel: Record<string, string> = { execom: 'Execom', tcomm: 'TComm', bot: 'BOT' };

// Leadership page with live officers: every officer list comes from Firestore, never mixed with sample names.
// A body or past-terms table with no live entries is left out ([] = still loading: all left out).
export function leadershipBlocks(blocks: ContentBlock[], docs: Doc[]): ContentBlock[] {
  const past = docs.map(toOfficer).filter((o) => !o.current).sort((a, b) => b.term.localeCompare(a.term) || byOrder(a, b));
  return blocks.flatMap((b): ContentBlock[] => {
    if (b.type === 'people' && b.eyebrow && b.eyebrow in bodyByEyebrow) {
      const items = currentOf(docs, bodyByEyebrow[b.eyebrow]);
      return items.length ? [{ ...b, items }] : [];
    }
    if (b.type === 'table' && b.eyebrow === 'Past presidents') {
      if (!past.length) return [];
      return [{ ...b, eyebrow: 'Past officers', columns: ['Term', 'Body', 'Role', 'Name'], rows: past.map((o) => [o.term, bodyLabel[o.body] ?? o.body, o.role, o.name]) }];
    }
    return [b];
  });
}

export interface SiteSettings {
  previewNotice: string;
  motto: string;
  membershipEmail: string;
  contactName: string;
  contactPhone: string;
  photoAlbumsUrl: string;
  socials: NavLink[];
}

// While Firestore answers: show nothing rather than sample contacts someone might use.
export const pendingSettings: SiteSettings = { previewNotice: '', motto: '', membershipEmail: '', contactName: '', contactPhone: '', photoAlbumsUrl: '', socials: [] };
export const sampleSettings: SiteSettings = { previewNotice, motto, membershipEmail, contactName, contactPhone, photoAlbumsUrl, socials };

const socialLabels: Record<string, string> = { facebook: 'Facebook', instagram: 'Instagram', youtube: 'YouTube', tiktok: 'TikTok' };

// Once siteSettings/site exists it wins field by field: a blank (deleted) field stays blank, never sample text.
export function toSettings(d: Doc): SiteSettings {
  const links = (d.socials && typeof d.socials === 'object' ? d.socials : {}) as Doc;
  return {
    previewNotice: str(d.previewNotice),
    motto: str(d.motto),
    membershipEmail: str(d.membershipEmail),
    contactName: str(d.contactName),
    contactPhone: str(d.contactPhone),
    photoAlbumsUrl: str(d.photoAlbumsUrl),
    socials: Object.entries(socialLabels).filter(([k]) => str(links[k])).map(([k, label]) => ({ label, href: str(links[k]) })),
  };
}
