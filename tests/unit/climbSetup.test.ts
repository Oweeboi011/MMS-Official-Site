import { setupGaps } from '../../src/frontend/data/climbSetup';
import { detailsProblem, toMyClimb } from '../../src/frontend/data/myClimbs';

describe('climb setup checklist', () => {
  it('lists what a climb still needs, and nothing once it is ready', () => {
    expect(setupGaps({})).toEqual(['Set the climb dates.', 'Set the slots: without a limit there is no waitlist.', 'Add the fees.', 'Add the climb officers.', 'Describe the climb.']);
    const fees = JSON.stringify([{ label: 'Guide', amount: '1500' }]);
    expect(setupGaps({ startDate: '2026-11-20', maxParticipants: '30', fees, description: 'x', officers: JSON.stringify([{ role: 'Team Leader', name: 'Ana' }]) }))
      .toEqual(['Add GCash details so members know where to pay.']);
    expect(setupGaps({ startDate: '2026-11-20', maxParticipants: '30', fees, gcashNumber: '0917', description: 'x', officers: JSON.stringify([{ name: 'Ana' }]) })).toEqual([]);
  });
});

describe('editable registration details', () => {
  it('reads them from the registration and requires mobile + emergency contact', () => {
    const row = toMyClimb('r', { mobile: '0917', emergencyContact: { name: 'B', mobile: '0918', relationship: 'Sister' }, medicalConditions: 'Asthma' });
    expect(row.details).toEqual({ mobile: '0917', ecName: 'B', ecMobile: '0918', ecRelationship: 'Sister', medicalConditions: 'Asthma' });
    expect(detailsProblem(row.details)).toBeNull();
    expect(detailsProblem({ ...row.details, ecMobile: ' ' })).toMatch(/required/);
  });
});
