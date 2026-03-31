import { MutationErrorSurface } from './MutationErrorSurface';
import { InlineModal } from '../../ui-core';

type Props = {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  pending: boolean;
  error: string;
  confirmationKeyword?: string;
  confirmationLabel?: string;
  confirmationValue?: string;
  confirmationHint?: string;
  onConfirmationValueChange?: (nextValue: string) => void;
  confirmDisabled?: boolean;
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
  confirmationKeyword,
  confirmationLabel,
  confirmationValue = '',
  confirmationHint,
  onConfirmationValueChange,
  confirmDisabled = false,
  onCancel,
  onConfirm
}: Props) {
  if (!isOpen) {
    return null;
  }

  const requiresTypedConfirmation =
    typeof confirmationKeyword === 'string' &&
    confirmationKeyword.trim() !== '' &&
    typeof onConfirmationValueChange === 'function';
  const normalizedKeyword = String(confirmationKeyword || '').trim();
  const isTypedConfirmationSatisfied = !requiresTypedConfirmation || confirmationValue.trim() === normalizedKeyword;
  const isConfirmButtonDisabled = pending || confirmDisabled || !isTypedConfirmationSatisfied;

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
        {error || requiresTypedConfirmation ? (
          <div className="modern-inline-modal__body modern-inline-modal__body--form">
            {error ? <MutationErrorSurface message={error} /> : null}
            {requiresTypedConfirmation ? (
              <label className="modern-command-field">
                <span className="modern-command-label">
                  {confirmationLabel || `Type ${normalizedKeyword} to continue`}
                </span>
                <input
                  className="avel-form-control"
                  type="text"
                  value={confirmationValue}
                  onChange={(event) => onConfirmationValueChange(event.target.value)}
                  placeholder={normalizedKeyword}
                  autoComplete="off"
                  autoCapitalize="characters"
                  spellCheck={false}
                  disabled={pending}
                />
                {confirmationHint ? <span className="modern-field-hint">{confirmationHint}</span> : null}
              </label>
            ) : null}
          </div>
        ) : null}
        <div className="modern-inline-modal__actions">
          <button type="button" className="modern-btn modern-btn--secondary" onClick={onCancel} disabled={pending}>
            Cancel
          </button>
          <button type="button" className="modern-btn modern-btn--danger" onClick={onConfirm} disabled={isConfirmButtonDisabled}>
            {pending ? 'Processing...' : confirmLabel}
          </button>
        </div>
    </InlineModal>
  );
}
