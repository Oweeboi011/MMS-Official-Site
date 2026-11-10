import { useEffect, useRef, type ReactNode } from 'react';

// A native <dialog>, opened on mount: focus stays inside, Escape closes, the page behind is inert. Backdrop click closes.
export default function Modal({ title, onClose, children, narrow }: { title: string; onClose: () => void; children: ReactNode; narrow?: boolean }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
  }, []);
  return (
    <dialog ref={ref} className={narrow ? 'modal modal-narrow' : 'modal'} aria-label={title} onClose={onClose} onClick={(e) => { if (e.target === ref.current) ref.current?.close(); }}>
      <header className="modal-head">
        <h2>{title}</h2>
        <button type="button" className="chip" onClick={() => ref.current?.close()}>Close</button>
      </header>
      <div className="modal-body">{children}</div>
    </dialog>
  );
}
