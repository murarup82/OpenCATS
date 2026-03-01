import { useEffect, useMemo, useState } from 'react';
import { MutationErrorSurface } from './MutationErrorSurface';

type RejectionReason = {
  reasonID: number;
  label: string;
};

type SubmitPayload = {
  rejectionReasonIDs: number[];
  rejectionReasonOther: string;
  statusComment: string;
};

type Props = {
  isOpen: boolean;
  title: string;
  currentStatusLabel: string;
  rejectionReasons: RejectionReason[];
  otherReasonID: number;
  submitPending?: boolean;
  submitError?: string;
  onCancel: () => void;
  onSubmit: (payload: SubmitPayload) => void;
  onOpenFullForm?: () => void;
};

export function PipelineRejectionModal({
  isOpen,
  title,
  currentStatusLabel,
  rejectionReasons,
  otherReasonID,
  submitPending = false,
  submitError = '',
  onCancel,
  onSubmit,
  onOpenFullForm
}: Props) {
  const [selectedReasonIDs, setSelectedReasonIDs] = useState<number[]>([]);
  const [otherReason, setOtherReason] = useState<string>('');
  const [statusComment, setStatusComment] = useState<string>('');

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    setSelectedReasonIDs([]);
    setOtherReason('');
    setStatusComment('');
  }, [isOpen]);

  const isOtherSelected = useMemo(
    () => otherReasonID > 0 && selectedReasonIDs.includes(otherReasonID),
    [otherReasonID, selectedReasonIDs]
  );

  if (!isOpen) {
    return null;
  }

  const toggleReason = (reasonID: number) => {
    setSelectedReasonIDs((current) => {
      if (current.includes(reasonID)) {
        return current.filter((value) => value !== reasonID);
      }
      return [...current, reasonID];
    });
  };

  const canSubmit =
    rejectionReasons.length > 0 &&
    selectedReasonIDs.length > 0 &&
    (!isOtherSelected || otherReason.trim() !== '');

  return (
    <div className="modern-inline-modal" role="dialog" aria-modal="true" aria-label={title}>
      <div className="modern-inline-modal__dialog modern-inline-modal__dialog--status">
        <div className="modern-inline-modal__header">
          <h3>{title}</h3>
          <p>Current status: {currentStatusLabel}</p>
        </div>

        <div className="modern-inline-modal__body modern-inline-modal__body--form">
          <div className="modern-rejection-modal__section">
            <span className="modern-command-label">Rejection Reasons</span>
            {rejectionReasons.length === 0 ? (
              <div className="modern-state modern-state--warning">
                No rejection reasons configured. Open full form to continue.
              </div>
            ) : (
              <div className="modern-rejection-modal__reasons">
                {rejectionReasons.map((reason) => (
                  <label key={reason.reasonID} className="modern-rejection-modal__reason">
                    <input
                      type="checkbox"
                      checked={selectedReasonIDs.includes(reason.reasonID)}
                      disabled={submitPending}
                      onChange={() => toggleReason(reason.reasonID)}
                    />
                    <span>{reason.label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {isOtherSelected ? (
            <label className="modern-command-field modern-rejection-modal__section">
              <span className="modern-command-label">Other Reason</span>
              <input
                className="avel-form-control"
                type="text"
                value={otherReason}
                disabled={submitPending}
                onChange={(event) => setOtherReason(event.target.value)}
                placeholder="Describe the rejection reason"
              />
            </label>
          ) : null}

          <label className="modern-command-field modern-rejection-modal__section">
            <span className="modern-command-label">Comment (Optional)</span>
            <textarea
              className="avel-form-control"
              value={statusComment}
              disabled={submitPending}
              onChange={(event) => setStatusComment(event.target.value)}
              rows={3}
              placeholder="Add context for the team"
            />
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
            className="modern-btn modern-btn--danger"
            onClick={() =>
              onSubmit({
                rejectionReasonIDs: selectedReasonIDs,
                rejectionReasonOther: otherReason.trim(),
                statusComment: statusComment.trim()
              })
            }
            disabled={submitPending || !canSubmit}
          >
            {submitPending ? 'Applying...' : 'Apply Rejected Status'}
          </button>
        </div>
      </div>
    </div>
  );
}
