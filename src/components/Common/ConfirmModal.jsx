import React from "react";

export default function ConfirmModal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
}) {
  if (!isOpen) return null;

  return (
    <div className="ConfirmModal-backdrop" role="dialog" aria-modal="true">
      <div className="ConfirmModal">
        {title && <h3>{title}</h3>}
        <p>{message}</p>
        <div className="ConfirmModal-actions">
          <button type="button" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" onClick={onConfirm}>
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
