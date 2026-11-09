// Documents a climb can require (mirrors mms-open-climbs requiredDocTypes; storage paths match storage.rules).
export interface DocType {
  key: string;
  requiresField: string; // climb flag
  sampleUrlField: string; // climb: template / sample link
  uploadField: string; // registration: { url, fileName }
  prefix: string; // storage folder
  label: string;
  hint: string;
}

export const REQUIRED_DOCS: DocType[] = [
  { key: 'registrationForm', requiresField: 'requiresRegistrationForm', sampleUrlField: 'registrationFormUrl', uploadField: 'registrationFormUpload', prefix: 'registration-form-uploads', label: 'Signed registration form', hint: 'Download the form, fill it out, then upload your copy.' },
  { key: 'medicalCert', requiresField: 'requiresMedicalCert', sampleUrlField: 'medicalCertSampleUrl', uploadField: 'medicalCertUpload', prefix: 'medical-cert-uploads', label: 'Medical certificate', hint: 'Upload your own medical certificate from a licensed physician.' },
  { key: 'permit', requiresField: 'requiresPermit', sampleUrlField: 'permitSampleUrl', uploadField: 'permitUpload', prefix: 'permit-uploads', label: 'Mountaineering / trekking permit', hint: 'Upload your mountaineering / trekking permit for this climb.' },
  { key: 'waiverDoc', requiresField: 'requiresWaiverDoc', sampleUrlField: 'waiverDocSampleUrl', uploadField: 'waiverDocUpload', prefix: 'waiver-doc-uploads', label: 'Signed waiver of responsibility', hint: 'Download the waiver, sign it, then upload your copy.' },
];

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // storage.rules underLimit()
export const RECEIPT_TYPES = 'image/*,application/pdf';
export const DOC_TYPES = 'image/*,application/pdf,.doc,.docx';

const MAX_PHOTO_BYTES = 30 * 1024 * 1024; // photos are shrunk before upload (lib/compressImage)

export function uploadProblem(file: File, accept: 'receipt' | 'document'): string | null {
  const photo = /^image\/(jpeg|png|webp)$/.test(file.type);
  if (file.size >= (photo ? MAX_PHOTO_BYTES : MAX_UPLOAD_BYTES)) return `That file is ${photo ? 30 : 10} MB or more. Use a smaller file.`;
  const word = /\.(docx?)$/i.test(file.name);
  const ok = file.type.startsWith('image/') || file.type === 'application/pdf' || (accept === 'document' && word);
  if (ok) return null;
  return accept === 'document' ? 'Upload a photo, PDF or Word file.' : 'Upload a photo or PDF.';
}

// Amount typed by the member: pesos, > 0.
export function amountProblem(text: string): string | null {
  const n = Number(text.replace(/[,₱\s]/g, ''));
  return Number.isFinite(n) && n > 0 ? null : 'Enter the amount you paid, in pesos.';
}
export const parseAmount = (text: string) => Number(text.replace(/[,₱\s]/g, ''));
