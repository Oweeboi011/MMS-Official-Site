import { toClimbDetail } from '../../src/frontend/data/climbDetail';
import { amountProblem, parseAmount, uploadProblem } from '../../src/frontend/data/requiredDocs';

const file = (name: string, type: string, size = 1000) => ({ name, type, size }) as File;

describe('payments and documents', () => {
  it('accepts photos and PDFs under 10 MB; Word only for documents', () => {
    expect(uploadProblem(file('r.jpg', 'image/jpeg'), 'receipt')).toBeNull();
    expect(uploadProblem(file('r.pdf', 'application/pdf'), 'receipt')).toBeNull();
    expect(uploadProblem(file('r.docx', ''), 'receipt')).toMatch(/photo or PDF/);
    expect(uploadProblem(file('form.docx', ''), 'document')).toBeNull();
    expect(uploadProblem(file('big.pdf', 'application/pdf', 10 * 1024 * 1024), 'receipt')).toMatch(/10 MB/);
    expect(uploadProblem(file('phone.jpg', 'image/jpeg', 12 * 1024 * 1024), 'receipt')).toBeNull(); // shrunk before upload
  });

  it('reads peso amounts', () => {
    expect(amountProblem('₱1,500')).toBeNull();
    expect(parseAmount('₱1,500')).toBe(1500);
    expect(amountProblem('0')).toMatch(/amount/);
    expect(amountProblem('abc')).toMatch(/amount/);
  });

  it('shows GCash details (https QR only) and the required documents a climb asks for', () => {
    const d = toClimbDetail({ title: 'T', gcashName: 'MMS Inc', gcashQrUrl: 'javascript:x', requiresMedicalCert: true, medicalCertSampleUrl: 'https://x/s.pdf' }, new Date())!;
    expect(d.payTo).toEqual({ name: 'MMS Inc', number: '', qrUrl: '' });
    expect(d.requiredDocs.map((t) => [t.key, t.sampleUrl])).toEqual([['medicalCert', 'https://x/s.pdf']]);
    expect(toClimbDetail({ title: 'T' }, new Date())!.payTo).toBeNull();
  });
});
