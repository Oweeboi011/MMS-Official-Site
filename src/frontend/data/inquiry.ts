// L2 membership / climb inquiry: what the public form sends to `inquiries` (rules: text lengths, interest list, consent).
export const INTERESTS = [['membership', 'Becoming a member'], ['climb', 'Joining a climb'], ['other', 'Something else']] as const;
export type Interest = (typeof INTERESTS)[number][0];

export interface InquiryForm { name: string; email: string; phone: string; interest: Interest; message: string; consent: boolean }
export const emptyInquiry: InquiryForm = { name: '', email: '', phone: '', interest: 'membership', message: '', consent: false };

// Same shape the rules check (one @, a dot in the domain, no spaces); string ops avoid a backtracking regex.
function looksLikeEmail(v: string): boolean {
  const [local, domain, ...extra] = v.split('@');
  return Boolean(local) && Boolean(domain) && extra.length === 0 && !/\s/.test(v) && domain.includes('.') && !domain.startsWith('.') && !domain.endsWith('.');
}

// The first problem to tell the sender about, or null when it can be sent.
export function inquiryProblem(f: InquiryForm): string | null {
  if (!f.name.trim()) return 'Enter your name.';
  if (!looksLikeEmail(f.email.trim()) || f.email.length > 200) return 'Enter a valid email so we can reply.';
  if (!f.message.trim()) return 'Write your question or message.';
  if (f.message.length > 2000) return 'Keep the message under 2,000 characters.';
  if (!f.consent) return 'Please agree to the privacy notice so we can contact you.';
  return null;
}

// Firestore REST field values for the create (phone only when given; rules allow it as optional).
export function inquiryFields(f: InquiryForm): Record<string, { stringValue: string } | { booleanValue: boolean }> {
  const text = (v: string, max: number) => ({ stringValue: v.trim().slice(0, max) });
  return {
    name: text(f.name, 120), email: text(f.email, 200), interest: { stringValue: f.interest }, message: text(f.message, 2000), consent: { booleanValue: true },
    ...(f.phone.trim() ? { phone: text(f.phone, 40) } : {}),
  };
}
