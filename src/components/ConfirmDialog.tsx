'use client';

import { useEffect } from 'react';

export type ConfirmDialogProps = {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm?: () => void;
  onCancel: () => void;
};

export default function ConfirmDialog({
  title,
  message,
  confirmLabel = 'OK',
  cancelLabel = 'Cancel',
  danger,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onCancel();
      if (e.key === 'Enter') (onConfirm || onCancel)();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onCancel, onConfirm]);

  return (
    <div className="overlay overlay-confirm" onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}>
      <div className="modal confirm-modal">
        <h3>{title}</h3>
        <p className="confirm-message">{message}</p>
        <div className="modal-actions">
          <span />
          <div className="right">
            {onConfirm && <button className="btn-ghost" onClick={onCancel}>{cancelLabel}</button>}
            <button
              className={danger ? 'danger danger-solid' : 'btn-primary'}
              onClick={onConfirm || onCancel}
              autoFocus
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
