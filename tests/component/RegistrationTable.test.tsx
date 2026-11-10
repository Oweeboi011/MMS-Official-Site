import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import RegistrationTable from '../../src/frontend/components/admin/RegistrationTable';
import { toAdminReg } from '../../src/frontend/data/adminRegistrations';

vi.mock('../../src/frontend/services/useAccount', () => ({ useAccount: () => ({ status: 'signedIn', account: { uid: 'a', email: 'a@x.com', role: 'admin' } }) }));
vi.mock('../../src/frontend/services/adminRegistrations', () => ({}));

const regs = Array.from({ length: 30 }, (_, i) => toAdminReg(`r${i}`, { name: `Person ${i}`, climbId: 'c1', climbTitle: 'Mt. X', status: 'pending', payments: [] }));
const admin = { uid: 'a', email: 'a@x.com', role: 'admin', emailVerified: true };

describe('registration table paging', () => {
  it('shows 25 at a time and pages through the rest', () => {
    render(<MemoryRouter><RegistrationTable regs={regs} admin={admin} run={async () => true} busy={false} /></MemoryRouter>);
    expect(screen.getByText('Person 0')).toBeInTheDocument();
    expect(screen.queryByText('Person 25')).not.toBeInTheDocument();
    expect(screen.getByText('1–25 of 30')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(screen.getByText('Person 25')).toBeInTheDocument();
    expect(screen.getByText('26–30 of 30')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
  });

  it('offers a refund only where money was paid', () => {
    const paid = toAdminReg('p1', { name: 'Paid Pat', climbId: 'c1', status: 'confirmed', amountPaid: 500, payments: [{ amount: 500, status: 'verified' }] });
    render(<MemoryRouter><RegistrationTable regs={[paid, regs[0]]} admin={admin} run={async () => true} busy={false} /></MemoryRouter>);
    expect(screen.getAllByRole('button', { name: 'Record refund' })).toHaveLength(1);
  });
});
