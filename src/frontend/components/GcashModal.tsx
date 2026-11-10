import { useState } from 'react';
import type { ClimbDetail } from '../data/climbDetail';
import Modal from './Modal';

// The climb's GCash / QR Ph details, with the QR large enough to scan from another phone (old app GcashQrModal).
export default function GcashButton({ payTo, label = 'View GCash QR' }: { payTo: ClimbDetail['payTo']; label?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" className="chip" onClick={() => setOpen(true)}>{label}</button>
      {open && (
        <Modal title="GCash QR code" narrow onClose={() => setOpen(false)}>
          <div className="gcash">
            {payTo?.name && <p className="gcash-account"><strong>{payTo.name}</strong>{payTo.number && <span>{payTo.number}</span>}</p>}
            {payTo?.qrUrl
              ? <img className="gcash-qr" src={payTo.qrUrl} alt="GCash QR code" />
              : <p className="climb-muted">The QR code has not been uploaded yet. Please contact the climb officers for the GCash number.</p>}
          </div>
        </Modal>
      )}
    </>
  );
}
