import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Modal } from 'bootstrap';
import './InfoModal.css';

export function InfoModal({ id, open, onClose, title, children, className = 'modal-abstract', contentClassName = '', bodyClassName = 'pt-2', headerContent = null, labelledBy }) {
    const elRef = useRef(null);
    const onCloseRef = useRef(onClose);
    const generatedId = useId();
    const titleId = labelledBy || generatedId;

    useEffect(() => {
        onCloseRef.current = onClose;
    }, [onClose]);

    useEffect(() => {
        const el = elRef.current;
        const modal = Modal.getOrCreateInstance(el);
        const handleHidden = () => onCloseRef.current?.();
        el.addEventListener('hidden.bs.modal', handleHidden);
        return () => {
            el.removeEventListener('hidden.bs.modal', handleHidden);
            modal.dispose();
            document.body.classList.remove('modal-open');
            document.body.style.removeProperty('overflow');
            document.body.style.removeProperty('padding-right');
            document.querySelectorAll('.modal-backdrop').forEach((b) => b.remove());
        };
    }, []);

    useEffect(() => {
        const modal = Modal.getOrCreateInstance(elRef.current);
        if (open)
            modal.show();
        else
            modal.hide();
    }, [open]);

    return createPortal(
      <div ref={elRef} id={id} className={`modal fade ${className}`} tabIndex={-1} aria-labelledby={titleId} aria-hidden={!open}>
        <div className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
          <div className={`modal-content ${contentClassName}`}>
            <div className="modal-header border-0 pb-0">
              {headerContent ?? <h5 className="modal-title" id={titleId}>{title}</h5>}
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"/>
            </div>
            <div className={`modal-body ${bodyClassName}`}>{children}</div>
          </div>
        </div>
      </div>,
      document.body
    );
}
