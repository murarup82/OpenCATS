import { useEffect, useMemo, useState } from 'react';
import { Modal } from '../../ui-core';

type StatusOption = { statusID: number; statusLabel: string };
type RejectionReason = { reasonID: number; label: string };

export type FullStatusChangePayload = {
  statusID: number;
  statusComment: string;
  rejectionReasonIDs: number[];
  rejectionReasonOther: string;
};

type Props = {
  isOpen: boolean;
  title: string;
  currentStatusLabel: string;
  initialStatusID: number;
  statusOptions: StatusOption[];
  rejectedStatusID: number;
  rejectionReasons: RejectionReason[];
  rejectionOtherReasonID: number;
  legacyFormURL: string;
  pending?: boolean;
  error?: string;
  onClose: () => void;
  onSubmit: (payload: FullStatusChangePayload) => void;
};

export function PipelineStatusChangeModal({
  isOpen,
  title,
  currentStatusLabel,
  initialStatusID,
  statusOptions,
  rejectedStatusID,
  rejectionReasons,
  rejectionOtherReasonID,
  legacyFormURL,
  pending = false,
  error = '',
  onClose,
  onSubmit
}: Props) {
  const [selectedStatusID, setSelectedStatusID] = useState(0);
  const [statusComment, setStatusComment] = useState('');
  const [selectedReasonIDs, setSelectedReasonIDs] = useState<number[]>([]);
  const [otherReason, setOtherReason] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setSelectedStatusID(initialStatusID > 0 ? initialStatusID : (statusOptions[0]?.statusID ?? 0));
    setStatusComment('');
    setSelectedReasonIDs([]);
    setOtherReason('');
  }, [isOpen, initialStatusID, statusOptions]);

  const isRejection = selectedStatusID > 0 && selectedStatusID === rejectedStatusID;

  const isOtherSelected = useMemo(
    () => rejectionOtherReasonID > 0 && selectedReasonIDs.includes(rejectionOtherReasonID),
    [rejectionOtherReasonID, selectedReasonIDs]
  );

  const canSubmit =
    !pending &&
    selectedStatusID > 0 &&
    (!isRejection ||
      (rejectionReasons.length > 0 &&
        selectedReasonIDs.length > 0 &&
        (!isOtherSelected || otherReason.trim() !== '')));

  const toggleReason = (reasonID: number) => {
    setSelectedReasonIDs((current) =>
      current.includes(reasonID) ? current.filter((id) => id !== reasonID) : [...current, reasonID]
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      title={title}
      onClose={onClose}
      size="md"
      closeOnEscape={!pending}
      closeOnBackdrop={!pending}
      footer={
        <>
          <a className="modern-btn modern-btn--secondary modern-btn--mini" href={legacyFormURL}>
            Open Legacy Form
          </a>
          <button type="button" className="modern-btn modern-btn--secondary" onClick={onClose} disabled={pending}>
            Cancel
          </button>
          <button
            type="button"
            className={`modern-btn${isRejection ? ' modern-btn--danger' : ' modern-btn--emphasis'}`}
            disabled={!canSubmit}
            onClick={() =>
              onSubmit({
                statusID: selectedStatusID,
                statusComment: statusComment.trim(),
                rejectionReasonIDs: selectedReasonIDs,
                rejectionReasonOther: otherReason.trim()
              })
            }
          >
            {pending ? 'Applying…' : isRejection ? 'Apply Rejected Status' : 'Apply Status'}
          </button>
        </>
      }
    >
      <div className="avel-pipeline-status-change">
        <div className="avel-pipeline-status-change__row">
          <span className="modern-command-label">Current Status</span>
          <span className="modern-chip">{currentStatusLabel}</span>
        </div>

        <label className="modern-command-field">
          <span className="modern-command-label">New Status</span>
          <select
            className="avel-form-control"
            value={selectedStatusID > 0 ? String(selectedStatusID) : ''}
            onChange={(e) => {
              setSelectedStatusID(Number(e.target.value || 0));
              setSelectedReasonIDs([]);
              setOtherReason('');
            }}
            disabled={pending || statusOptions.length === 0}
          >
            {statusOptions.length === 0 ? (
              <option value="">No transitions available</option>
            ) : null}
            {statusOptions.map((option) => (
              <option key={option.statusID} value={String(option.statusID)}>
                {option.statusLabel}
              </option>
            ))}
          </select>
        </label>

        {isRejection ? (
          <div className="avel-pipeline-status-change__section">
            <span className="modern-command-label">Rejection Reasons</span>
            {rejectionReasons.length === 0 ? (
              <div className="modern-state modern-state--warning">
                No rejection reasons are configured. Use &ldquo;Open Legacy Form&rdquo; to complete this rejection.
              </div>
            ) : (
              <div className="modern-rejection-modal__reasons">
                {rejectionReasons.map((reason) => (
                  <label key={reason.reasonID} className="modern-rejection-modal__reason">
                    <input
                      type="checkbox"
                      checked={selectedReasonIDs.includes(reason.reasonID)}
                      disabled={pending}
                      onChange={() => toggleReason(reason.reasonID)}
                    />
                    <span>{reason.label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        ) : null}

        {isRejection && isOtherSelected ? (
          <label className="modern-command-field">
            <span className="modern-command-label">Other Reason</span>
            <input
              className="avel-form-control"
              type="text"
              value={otherReason}
              disabled={pending}
              onChange={(e) => setOtherReason(e.target.value)}
              placeholder="Describe the rejection reason"
            />
          </label>
        ) : null}

        <label className="modern-command-field">
          <span className="modern-command-label">
            {isRejection ? 'Comment (Required)' : 'Status Comment (Optional)'}
          </span>
          <textarea
            className="avel-form-control"
            value={statusComment}
            disabled={pending}
            onChange={(e) => setStatusComment(e.target.value)}
            rows={3}
            placeholder={
              isRejection
                ? 'Required: explain the rejection reason'
                : 'Optional: add a note about this status change'
            }
          />
        </label>

        {error !== '' ? <div className="modern-state modern-state--error">{error}</div> : null}
      </div>
    </Modal>
  );
}
