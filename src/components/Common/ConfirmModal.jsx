import React from "react";

export default function ConfirmModal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmLabel = "Continue",
  cancelLabel = "Cancel",
}) {
  if (!isOpen) return null;

  return (
    <div className="ConfirmModal-backdrop" role="dialog" aria-modal="true">
      <div className="ConfirmModal">
        {title && <h3>{title}</h3>}
        <p>{message}</p>
        <div className="ConfirmModal-actions">
          <button type="button" className="button-secondary" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button type="button" className="button-primary" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
