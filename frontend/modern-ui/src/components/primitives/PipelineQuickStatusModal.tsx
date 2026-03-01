import { useEffect, useState } from 'react';
import { MutationErrorSurface } from './MutationErrorSurface';
import { InlineModal } from '../../ui-core';

type StatusOption = {
  statusID: number;
  statusLabel: string;
};

type Props = {
  isOpen: boolean;
  title: string;
  currentStatusLabel: string;
  statusOptions: StatusOption[];
  submitPending?: boolean;
  submitError?: string;
  onCancel: () => void;
  onSubmit: (statusID: number) => void;
  onOpenFullForm?: () => void;
};

export function PipelineQuickStatusModal({
  isOpen,
  title,
  currentStatusLabel,
  statusOptions,
  submitPending = false,
  submitError = '',
  onCancel,
  onSubmit,
  onOpenFullForm
}: Props) {
  const [selectedStatusID, setSelectedStatusID] = useState<number>(0);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (statusOptions.length > 0) {
      setSelectedStatusID(statusOptions[0].statusID);
    } else {
      setSelectedStatusID(0);
    }
  }, [isOpen, statusOptions]);

  if (!isOpen) {
    return null;
  }

  return (
    <InlineModal
      isOpen={isOpen}
      ariaLabel={title}
      dialogClassName="modern-inline-modal__dialog--status modern-inline-modal__dialog--compact"
      closeOnBackdrop={!submitPending}
      closeOnEscape={!submitPending}
      onClose={onCancel}
    >
        <div className="modern-inline-modal__header">
          <h3>{title}</h3>
          <p>Current status: {currentStatusLabel}</p>
        </div>
        <div className="modern-inline-modal__body modern-inline-modal__body--form">
          <label className="modern-command-field">
            <span className="modern-command-label">New Status</span>
            <select
              className="avel-form-control"
              value={selectedStatusID > 0 ? String(selectedStatusID) : ''}
              disabled={submitPending}
              onChange={(event) => setSelectedStatusID(Number(event.target.value || 0))}
            >
              {statusOptions.map((option) => (
                <option key={option.statusID} value={String(option.statusID)}>
                  {option.statusLabel}
                </option>
              ))}
            </select>
          </label>
          <MutationErrorSurface message={submitError} />
        </div>
        <div className="modern-inline-modal__actions">
          {onOpenFullForm ? (
            <button type="button" className="modern-btn modern-btn--secondary" onClick={onOpenFullForm} disabled={submitPending}>
              Open Full Form
            </button>
          ) : null}
          <button type="button" className="modern-btn modern-btn--secondary" onClick={onCancel} disabled={submitPending}>
            Cancel
          </button>
          <button
            type="button"
            className="modern-btn modern-btn--emphasis"
            disabled={submitPending || selectedStatusID <= 0 || statusOptions.length === 0}
            onClick={() => onSubmit(selectedStatusID)}
          >
            {submitPending ? 'Applying...' : 'Apply Status'}
          </button>
        </div>
    </InlineModal>
  );
}
