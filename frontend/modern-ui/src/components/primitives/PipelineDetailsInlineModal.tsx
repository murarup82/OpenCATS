import { useEffect, useMemo, useState } from 'react';
import type { PipelineStatusDetailsModernDataResponse } from '../../types';

type Props = {
  isOpen: boolean;
  title: string;
  details: PipelineStatusDetailsModernDataResponse | null;
  loading: boolean;
  error: string;
  onClose: () => void;
  onOpenFullDetails?: () => void;
  onSaveHistoryDate?: (
    details: PipelineStatusDetailsModernDataResponse,
    payload: { historyID: number; newDate: string; originalDate: string; editNote: string }
  ) => Promise<string | null>;
};

function toDisplayText(value: unknown, fallback = '--'): string {
  if (typeof value === 'string') {
    const normalized = value.trim();
    return normalized !== '' ? normalized : fallback;
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  return fallback;
}

function toLocalDateTimeInput(rawValue: string): string {
  const normalized = String(rawValue || '').trim();
  if (normalized === '') {
    return '';
  }
  if (normalized.includes('T')) {
    return normalized.slice(0, 19);
  }
  return normalized.replace(' ', 'T').slice(0, 19);
}

export function PipelineDetailsInlineModal({
  isOpen,
  title,
  details,
  loading,
  error,
  onClose,
  onOpenFullDetails,
  onSaveHistoryDate
}: Props) {
  const [editingHistoryID, setEditingHistoryID] = useState<number>(0);
  const [draftDate, setDraftDate] = useState<string>('');
  const [originalDate, setOriginalDate] = useState<string>('');
  const [editNote, setEditNote] = useState<string>('');
  const [saveError, setSaveError] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) {
      setEditingHistoryID(0);
      setDraftDate('');
      setOriginalDate('');
      setEditNote('');
      setSaveError('');
      setSaving(false);
    }
  }, [isOpen]);

  const editingEntry = useMemo(() => {
    if (!details || editingHistoryID <= 0) {
      return null;
    }
    return details.history.find((item) => item.historyID === editingHistoryID) || null;
  }, [details, editingHistoryID]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="modern-inline-modal" role="dialog" aria-modal="true" aria-label={title}>
      <div className="modern-inline-modal__dialog modern-inline-modal__dialog--status">
        <div className="modern-inline-modal__header">
          <h3>{title}</h3>
          <p>Pipeline timeline and transition history</p>
        </div>
        <div className="modern-inline-modal__actions">
          {onOpenFullDetails ? (
            <button type="button" className="modern-btn modern-btn--secondary" onClick={onOpenFullDetails}>
              Open Legacy Details
            </button>
          ) : null}
          <button type="button" className="modern-btn modern-btn--secondary" onClick={onClose}>
            Close
          </button>
        </div>
        <div className="modern-inline-modal__body modern-inline-modal__body--timeline">
          {loading ? <div className="modern-state">Loading pipeline details...</div> : null}
          {!loading && error !== '' ? <div className="modern-state modern-state--error">{error}</div> : null}
          {!loading && error === '' && details ? (
            <div className="modern-pipeline-details">
              <div className="modern-pipeline-details__summary">
                <div className="modern-pipeline-details__summary-card">
                  <span>Total transitions</span>
                  <strong>{details.summary.totalTransitions}</strong>
                </div>
                <div className="modern-pipeline-details__summary-card">
                  <span>Auto transitions</span>
                  <strong>{details.summary.autoTransitions}</strong>
                </div>
                <div className="modern-pipeline-details__summary-card">
                  <span>Edited entries</span>
                  <strong>{details.summary.editedTransitions}</strong>
                </div>
                <div className="modern-pipeline-details__summary-card">
                  <span>Latest transition</span>
                  <strong>{toDisplayText(details.summary.latestTransitionDisplay)}</strong>
                </div>
              </div>

              <table className="modern-pipeline-details__table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>From - To</th>
                    <th>Entered By</th>
                    <th>Comment</th>
                    <th>Origin</th>
                    {details.permissions.canEditHistory ? <th>Edit</th> : null}
                  </tr>
                </thead>
                <tbody>
                  {details.history.length === 0 ? (
                    <tr>
                      <td colSpan={details.permissions.canEditHistory ? 6 : 5}>No status history entries found.</td>
                    </tr>
                  ) : (
                    details.history.map((entry) => {
                      const isEditing = editingHistoryID === entry.historyID;
                      return (
                        <tr key={entry.historyID}>
                          <td>{toDisplayText(entry.dateDisplay)}</td>
                          <td>
                            <div className="modern-pipeline-details__status-flow">
                              <span className={`modern-status modern-status--${entry.statusFromSlug || 'unknown'}`}>
                                {toDisplayText(entry.statusFrom)}
                              </span>
                              <span className="modern-pipeline-details__status-arrow">→</span>
                              <span className={`modern-status modern-status--${entry.statusToSlug || 'unknown'}`}>
                                {toDisplayText(entry.statusTo)}
                              </span>
                            </div>
                          </td>
                          <td>{toDisplayText(entry.enteredByName)}</td>
                          <td>
                            <div>{toDisplayText(entry.commentText, '') || '--'}</div>
                            {entry.rejectionReasons ? (
                              <div className="modern-pipeline-details__comment-meta">
                                Rejection reasons: {toDisplayText(entry.rejectionReasons)}
                              </div>
                            ) : null}
                            {entry.rejectionReasonOther ? (
                              <div className="modern-pipeline-details__comment-meta">
                                Other reason: {toDisplayText(entry.rejectionReasonOther)}
                              </div>
                            ) : null}
                            {entry.editedAtDisplay ? (
                              <div className="modern-pipeline-details__comment-meta">
                                Edited {toDisplayText(entry.editedAtDisplay)} by {toDisplayText(entry.editedByName)}
                                {entry.editNote ? ` (${entry.editNote})` : ''}
                              </div>
                            ) : null}
                          </td>
                          <td>
                            <span className={`modern-chip ${entry.isAutoTransition ? 'modern-chip--success' : 'modern-chip--info'}`}>
                              {entry.isAutoTransition ? 'Auto' : 'Manual'}
                            </span>
                          </td>
                          {details.permissions.canEditHistory ? (
                            <td>
                              {!isEditing ? (
                                <button
                                  type="button"
                                  className="modern-btn modern-btn--mini modern-btn--secondary"
                                  onClick={() => {
                                    setEditingHistoryID(entry.historyID);
                                    setDraftDate(toLocalDateTimeInput(entry.dateEdit || entry.dateRaw));
                                    setOriginalDate(entry.dateEdit || '');
                                    setEditNote(entry.editNote || '');
                                    setSaveError('');
                                  }}
                                >
                                  Edit Date
                                </button>
                              ) : (
                                <div className="modern-pipeline-details__edit">
                                  <input
                                    type="datetime-local"
                                    className="avel-form-control"
                                    value={draftDate}
                                    onChange={(event) => setDraftDate(event.target.value)}
                                  />
                                  <input
                                    type="text"
                                    className="avel-form-control"
                                    value={editNote}
                                    placeholder="Edit note (optional)"
                                    onChange={(event) => setEditNote(event.target.value)}
                                  />
                                  <div className="modern-table-actions">
                                    <button
                                      type="button"
                                      className="modern-btn modern-btn--mini modern-btn--emphasis"
                                      disabled={saving || !onSaveHistoryDate}
                                      onClick={async () => {
                                        if (!onSaveHistoryDate || !details) {
                                          return;
                                        }
                                        setSaving(true);
                                        setSaveError('');
                                        const result = await onSaveHistoryDate(details, {
                                          historyID: entry.historyID,
                                          newDate: draftDate,
                                          originalDate,
                                          editNote
                                        });
                                        setSaving(false);
                                        if (result) {
                                          setSaveError(result);
                                          return;
                                        }
                                        setEditingHistoryID(0);
                                        setDraftDate('');
                                        setOriginalDate('');
                                        setEditNote('');
                                      }}
                                    >
                                      {saving ? 'Saving...' : 'Save'}
                                    </button>
                                    <button
                                      type="button"
                                      className="modern-btn modern-btn--mini modern-btn--secondary"
                                      disabled={saving}
                                      onClick={() => {
                                        setEditingHistoryID(0);
                                        setDraftDate('');
                                        setOriginalDate('');
                                        setEditNote('');
                                        setSaveError('');
                                      }}
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                  {saveError ? <div className="modern-state modern-state--error">{saveError}</div> : null}
                                </div>
                              )}
                            </td>
                          ) : null}
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
              {editingEntry ? (
                <div className="modern-pipeline-details__editing-hint">
                  Editing transition: {toDisplayText(editingEntry.statusFrom)} → {toDisplayText(editingEntry.statusTo)}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
