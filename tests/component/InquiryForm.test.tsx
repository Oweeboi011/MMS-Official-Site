import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import InquiryForm from '../../src/frontend/components/InquiryForm';

const sendInquiry = vi.fn(async () => undefined);
vi.mock('../../src/frontend/services/inquiry', () => ({ inquiriesOpen: true, sendInquiry: (...a: unknown[]) => sendInquiry(...(a as [])) }));

describe('InquiryForm', () => {
  it('asks for what is missing, then sends and confirms', async () => {
    render(<MemoryRouter><InquiryForm /></MemoryRouter>);
    fireEvent.click(screen.getByRole('button', { name: 'Send' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Enter your name');
    expect(sendInquiry).not.toHaveBeenCalled();
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Ana' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'ana@example.com' } });
    fireEvent.change(screen.getByLabelText('Message'), { target: { value: 'How do I join?' } });
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByRole('button', { name: 'Send' }));
    expect(await screen.findByRole('status')).toHaveTextContent('Thank you');
    expect(sendInquiry).toHaveBeenCalledOnce();
  });
});
