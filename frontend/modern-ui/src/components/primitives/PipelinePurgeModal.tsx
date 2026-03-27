import { useEffect, useState } from 'react';
import { MutationErrorSurface } from './MutationErrorSurface';
import { InlineModal } from '../../ui-core';

type Props = {
  isOpen: boolean;
  candidateName: string;
  jobOrderTitle: string;
  pending: boolean;
  error: string;
  onCancel: () => void;
  onConfirm: () => void;
};

const CONFIRM_WORD = 'PURGE';

export function PipelinePurgeModal({
  isOpen,
  candidateName,
  jobOrderTitle,
  pending,
  error,
  onCancel,
  onConfirm
}: Props) {
  const [typed, setTyped] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setTyped('');
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const isConfirmed = typed.trim().toUpperCase() === CONFIRM_WORD;

  return (
    <InlineModal
      isOpen={isOpen}
      ariaLabel="Purge candidate from pipeline"
      dialogClassName="modern-inline-modal__dialog--status modern-inline-modal__dialog--compact"
      closeOnBackdrop={!pending}
      closeOnEscape={!pending}
      onClose={onCancel}
    >
      <div className="modern-inline-modal__header">
        <h3>Permanently Purge Pipeline Entry</h3>
        <p>
          This will <strong>permanently erase all history</strong> of{' '}
          <strong>{candidateName}</strong> linked to{' '}
          <strong>{jobOrderTitle}</strong>.
        </p>
      </div>
      <div className="modern-inline-modal__body modern-inline-modal__body--form">
        <div className="avel-purge-warning">
          <strong>This action cannot be undone.</strong> The following will be permanently deleted:
          <ul>
            <li>Pipeline entry and status</li>
            <li>All status change history</li>
            <li>All activity entries for this candidate on this job order</li>
          </ul>
          The candidate will be fully disassociated from this job order and can be assigned again as new.
        </div>
        <label className="modern-command-field">
          <span className="modern-command-label">
            Type <strong>{CONFIRM_WORD}</strong> to confirm
          </span>
          <input
            type="text"
            className="avel-form-control"
            value={typed}
            placeholder={CONFIRM_WORD}
            onChange={(event) => setTyped(event.target.value)}
            autoComplete="off"
            spellCheck={false}
          />
        </label>
        <MutationErrorSurface message={error} />
      </div>
      <div className="modern-inline-modal__actions">
        <button type="button" className="modern-btn modern-btn--secondary" onClick={onCancel} disabled={pending}>
          Cancel
        </button>
        <button
          type="button"
          className="modern-btn modern-btn--danger"
          onClick={onConfirm}
          disabled={pending || !isConfirmed}
        >
          {pending ? 'Purging...' : 'Purge Permanently'}
        </button>
      </div>
    </InlineModal>
  );
}
