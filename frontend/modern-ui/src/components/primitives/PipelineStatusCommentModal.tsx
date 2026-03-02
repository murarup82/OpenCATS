import { useEffect, useState } from 'react';
import { InlineModal } from '../../ui-core';
import { MutationErrorSurface } from './MutationErrorSurface';

type Props = {
  isOpen: boolean;
  title: string;
  currentStatusLabel: string;
  targetStatusLabel: string;
  submitPending?: boolean;
  submitError?: string;
  onCancel: () => void;
  onSubmit: (comment: string) => void;
};

export function PipelineStatusCommentModal({
  isOpen,
  title,
  currentStatusLabel,
  targetStatusLabel,
  submitPending = false,
  submitError = '',
  onCancel,
  onSubmit
}: Props) {
  const [comment, setComment] = useState('');

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    setComment('');
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const trimmedComment = comment.trim();
  const canSubmit = trimmedComment !== '';

  return (
    <InlineModal
      isOpen={isOpen}
      ariaLabel={title}
      dialogClassName="modern-inline-modal__dialog--compact"
      closeOnBackdrop={!submitPending}
      closeOnEscape={!submitPending}
      onClose={onCancel}
    >
      <div className="modern-inline-modal__header">
        <h3>{title}</h3>
        <p>
          {currentStatusLabel} to {targetStatusLabel}
        </p>
      </div>

      <div className="modern-inline-modal__body modern-inline-modal__body--form">
        <label className="modern-command-field modern-rejection-modal__section">
          <span className="modern-command-label">Transition Comment (Required)</span>
          <textarea
            className="avel-form-control"
            value={comment}
            disabled={submitPending}
            rows={4}
            placeholder="Explain why this candidate is moving to the next stage."
            onChange={(event) => setComment(event.target.value)}
          />
        </label>

        <MutationErrorSurface message={submitError} />
      </div>

      <div className="modern-inline-modal__actions">
        <button type="button" className="modern-btn modern-btn--secondary" onClick={onCancel} disabled={submitPending}>
          Cancel
        </button>
        <button
          type="button"
          className="modern-btn modern-btn--emphasis"
          onClick={() => onSubmit(trimmedComment)}
          disabled={submitPending || !canSubmit}
        >
          {submitPending ? 'Applying...' : 'Apply Status'}
        </button>
      </div>
    </InlineModal>
  );
}
