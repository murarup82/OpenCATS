type Props = {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  pending: boolean;
  error: string;
  onCancel: () => void;
  onConfirm: () => void;
};

export function ConfirmActionModal({
  isOpen,
  title,
  message,
  confirmLabel,
  pending,
  error,
  onCancel,
  onConfirm
}: Props) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="modern-inline-modal" role="dialog" aria-modal="true" aria-label={title}>
      <div className="modern-inline-modal__dialog modern-inline-modal__dialog--status modern-inline-modal__dialog--compact">
        <div className="modern-inline-modal__header">
          <h3>{title}</h3>
          <p>{message}</p>
        </div>
        {error ? (
          <div className="modern-inline-modal__body modern-inline-modal__body--form">
            <div className="modern-state modern-state--error">{error}</div>
          </div>
        ) : null}
        <div className="modern-inline-modal__actions">
          <button type="button" className="modern-btn modern-btn--secondary" onClick={onCancel} disabled={pending}>
            Cancel
          </button>
          <button type="button" className="modern-btn modern-btn--danger" onClick={onConfirm} disabled={pending}>
            {pending ? 'Processing...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
