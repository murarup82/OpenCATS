import { MutationErrorSurface } from './MutationErrorSurface';
import { InlineModal } from '../../ui-core';

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
    <InlineModal
      isOpen={isOpen}
      ariaLabel={title}
      dialogClassName="modern-inline-modal__dialog--status modern-inline-modal__dialog--compact"
      closeOnBackdrop={!pending}
      closeOnEscape={!pending}
      onClose={onCancel}
    >
        <div className="modern-inline-modal__header">
          <h3>{title}</h3>
          <p>{message}</p>
        </div>
        {error ? (
          <div className="modern-inline-modal__body modern-inline-modal__body--form">
            <MutationErrorSurface message={error} />
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
    </InlineModal>
  );
}
