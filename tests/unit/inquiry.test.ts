import { emptyInquiry, inquiryFields, inquiryProblem } from '../../src/frontend/data/inquiry';

const ok = { ...emptyInquiry, name: 'Ana', email: 'ana@example.com', message: 'How do I join?', consent: true };

describe('membership inquiry', () => {
  it('accepts a complete form', () => expect(inquiryProblem(ok)).toBeNull());
  it.each([
    [{ name: ' ' }, 'name'], [{ email: 'nope' }, 'email'], [{ message: '' }, 'message'], [{ consent: false }, 'privacy'], [{ message: 'x'.repeat(2001) }, '2,000'],
  ])('rejects %j', (patch, word) => expect(inquiryProblem({ ...ok, ...patch })).toContain(word));
  it('sends phone only when given and always consent', () => {
    expect(Object.keys(inquiryFields(ok)).sort()).toEqual(['consent', 'email', 'interest', 'message', 'name']);
    expect(inquiryFields({ ...ok, phone: ' 0917 ' }).phone).toEqual({ stringValue: '0917' });
  });
});
