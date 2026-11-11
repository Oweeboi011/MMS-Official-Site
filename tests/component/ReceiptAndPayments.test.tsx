import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ClimbPayments from '../../src/frontend/components/admin/ClimbPayments';
import GcashButton from '../../src/frontend/components/GcashModal';
import ReceiptButton from '../../src/frontend/components/ReceiptModal';
import { toAdminReg } from '../../src/frontend/data/adminRegistrations';
import { toMyClimb } from '../../src/frontend/data/myClimbs';

const reg = {
  climbId: 'c1', climbTitle: 'Mt. Pulag', name: 'Ana Cruz', status: 'confirmed', paymentStatus: 'verified', amountPaid: 1000,
  feeBreakdown: [{ label: 'Guide Fee', amount: '1500', selected: true }, { label: 'Van', amount: '800', optional: true, selected: false }],
  payments: [{ amount: 1000, status: 'verified', note: 'GCash' }], refunds: [{ amount: 100 }], verifiedAt: { toMillis: () => 1_700_000_000_000 },
};

describe('official receipt', () => {
  it('shows what was owed, paid, refunded and left, with the payments behind it', () => {
    render(<ReceiptButton row={toMyClimb('reg12345678', reg)} />);
    fireEvent.click(screen.getByRole('button', { name: 'View receipt' }));
    const dialog = screen.getByRole('dialog', { name: 'Official Receipt' });
    expect(within(dialog).getByText('OR-12345678')).toBeInTheDocument();
    expect(within(dialog).getByText('Guide Fee')).toBeInTheDocument();
    expect(within(dialog).queryByText('Van')).not.toBeInTheDocument(); // not availed
    expect(within(dialog).getByText('Refunded').nextSibling).toHaveTextContent('₱100');
    expect(within(dialog).getByText('Balance').nextSibling).toHaveTextContent('₱600');
    expect(within(dialog).getByText(/₱1,000 · Verified · GCash/)).toBeInTheDocument();
  });
});

describe('GCash modal', () => {
  it('shows the account and a large QR, or says the QR is missing', () => {
    const { unmount } = render(<GcashButton payTo={{ name: 'MMS Treasury', number: '0917 000 0000', qrUrl: 'https://x/qr.png' }} />);
    fireEvent.click(screen.getByRole('button', { name: 'View GCash QR' }));
    expect(screen.getByText('MMS Treasury')).toBeInTheDocument();
    expect(screen.getByAltText('GCash QR code')).toHaveAttribute('src', 'https://x/qr.png');
    unmount();
    render(<GcashButton payTo={{ name: 'MMS Treasury', number: '', qrUrl: '' }} />);
    fireEvent.click(screen.getByRole('button', { name: 'View GCash QR' }));
    expect(screen.getByText(/QR code has not been uploaded yet/)).toBeInTheDocument();
  });
});

describe('climb payments panel', () => {
  const climb = { feeItems: [{ label: 'Guide Fee', amount: '1500', note: '', optional: false, isGuestFee: false }], payTo: { name: 'MMS Treasury', number: '0917', qrUrl: 'https://x/qr.png' } };
  const mk = (id: string, d: Record<string, unknown>) => toAdminReg(id, { climbId: 'c1', status: 'confirmed', ...d });
  const regs = [
    mk('a', { name: 'Ana', feeBreakdown: [{ label: 'Guide', amount: '1500', selected: true }], amountPaid: 1500 }),
    mk('b', { name: 'Ben', feeBreakdown: [{ label: 'Guide', amount: '1500', selected: true }], amountPaid: 500 }),
    mk('c', { name: 'Cy', status: 'cancelled', feeBreakdown: [{ label: 'Guide', amount: '1500', selected: true }] }),
  ];

  it('totals the climb and lists only who still owes, with the fee schedule and GCash details', () => {
    render(<MemoryRouter><ClimbPayments climb={climb as never} regs={regs} /></MemoryRouter>);
    expect(screen.getByText('Expected').closest('li')).toHaveTextContent('₱3,000');
    expect(screen.getByText('Collected').closest('li')).toHaveTextContent('₱2,000');
    expect(screen.getByText('Still owed').closest('li')).toHaveTextContent('₱1,000');
    const balances = screen.getByText('Balances due').closest('section')!;
    expect(within(balances).getByText('Ben')).toBeInTheDocument();
    expect(within(balances).queryByText('Ana')).not.toBeInTheDocument();
    expect(within(balances).queryByText('Cy')).not.toBeInTheDocument();
    expect(screen.getByText('Member total').closest('p')).toHaveTextContent('₱1,500');
    expect(screen.getByRole('button', { name: 'View GCash QR' })).toBeInTheDocument();
  });
});
