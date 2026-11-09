import { fireEvent, screen } from '@testing-library/react';
import { renderAt } from '../helpers';

const saved: unknown[] = [];
vi.mock('../../src/frontend/services/useAccount', () => ({ useAccount: () => ({ status: 'signedIn', account: { uid: 'u1', email: 'a@x.com', role: 'member', emailVerified: true } }) }));
vi.mock('../../src/frontend/services/memberDetails', () => ({
  myDetails: async () => ({ mobile: '0917', dateOfBirth: '', address: '', experienceLevel: 'beginner', medicalConditions: '', ecName: '', ecMobile: '', ecRelationship: '', batch: '', tribe: '' }),
  saveMyDetails: async (uid: string, d: unknown) => { saved.push([uid, d]); },
}));

describe('my details', () => {
  it('loads saved details, nudges for an emergency contact, and saves batch and tribe', async () => {
    renderAt('/account/details');
    expect(await screen.findByDisplayValue('0917', {}, { timeout: 5000 })).toBeInTheDocument();
    expect(screen.getByText(/Add an emergency contact/)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('BMC batch'), { target: { value: 'Pulag 1995' } });
    fireEvent.change(screen.getByLabelText('Sportsfest tribe'), { target: { value: 'mangyan' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save details' }));
    expect(await screen.findByText('Saved.')).toBeInTheDocument();
    expect(saved[0]).toMatchObject(['u1', { batch: 'Pulag 1995', tribe: 'mangyan', mobile: '0917' }]);
  });
});
