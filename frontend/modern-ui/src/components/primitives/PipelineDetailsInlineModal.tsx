import { useEffect, useMemo, useState } from 'react';
import type { PipelineStatusDetailsModernDataResponse } from '../../types';
import { InlineModal, SelectMenu } from '../../ui-core';

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

function toDateTimeParts(rawValue: string): { date: string; time: string } {
  const normalized = toLocalDateTimeInput(rawValue);
  if (normalized === '' || !normalized.includes('T')) {
    return { date: '', time: '' };
  }

  const [datePart, timePartRaw] = normalized.split('T');
  const timePart = String(timePartRaw || '').slice(0, 5);
  return {
    date: datePart || '',
    time: timePart
  };
}

function combineDateTimeParts(datePart: string, timePart: string): string {
  const normalizedDate = String(datePart || '').trim();
  const normalizedTime = String(timePart || '').trim();
  if (normalizedDate === '' || normalizedTime === '') {
    return '';
  }
  return `${normalizedDate}T${normalizedTime}:00`;
}

function pad2(value: number): string {
  if (value < 10) {
    return `0${value}`;
  }
  return String(value);
}

function toTimeLabel(timeValue: string): string {
  const normalized = String(timeValue || '').trim();
  const match = normalized.match(/^(\d{2}):(\d{2})$/);
  if (!match) {
    return normalized;
  }
  const hour24 = Number(match[1]);
  const minute = Number(match[2]);
  if (Number.isNaN(hour24) || Number.isNaN(minute)) {
    return normalized;
  }
  const suffix = hour24 >= 12 ? 'PM' : 'AM';
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return `${pad2(hour12)}:${pad2(minute)} ${suffix}`;
}

const TIME_OPTIONS_15_MIN = Array.from({ length: 24 * 4 }, (_, index) => {
  const hour = Math.floor(index / 4);
  const minute = (index % 4) * 15;
  const value = `${pad2(hour)}:${pad2(minute)}`;
  return {
    value,
    label: toTimeLabel(value)
  };
});

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
  const [draftDatePart, setDraftDatePart] = useState<string>('');
  const [draftTimePart, setDraftTimePart] = useState<string>('');
  const [originalDate, setOriginalDate] = useState<string>('');
  const [editNote, setEditNote] = useState<string>('');
  const [saveError, setSaveError] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) {
      setEditingHistoryID(0);
      setDraftDatePart('');
      setDraftTimePart('');
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

  const timeOptions = useMemo(() => {
    const normalized = String(draftTimePart || '').trim();
    if (normalized === '') {
      return TIME_OPTIONS_15_MIN;
    }
    const hasCurrent = TIME_OPTIONS_15_MIN.some((option) => option.value === normalized);
    if (hasCurrent) {
      return TIME_OPTIONS_15_MIN;
    }
    return [
      {
        value: normalized,
        label: `${toTimeLabel(normalized)} (current)`
      },
      ...TIME_OPTIONS_15_MIN
    ];
  }, [draftTimePart]);

  if (!isOpen) {
    return null;
  }

  return (
    <InlineModal
      isOpen={isOpen}
      ariaLabel={title}
      dialogClassName="modern-inline-modal__dialog--status"
      onClose={onClose}
    >
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
                              <span className="modern-pipeline-details__status-arrow">-&gt;</span>
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
                                    const dateParts = toDateTimeParts(entry.dateEdit || entry.dateRaw);
                                    setEditingHistoryID(entry.historyID);
                                    setDraftDatePart(dateParts.date);
                                    setDraftTimePart(dateParts.time);
                                    setOriginalDate(entry.dateEdit || entry.dateRaw || '');
                                    setEditNote(entry.editNote || '');
                                    setSaveError('');
                                  }}
                                >
                                  Edit Date
                                </button>
                              ) : (
                                <div className="modern-pipeline-details__edit">
                                  <div className="modern-pipeline-details__date-grid">
                                    <label className="modern-pipeline-details__date-field">
                                      <span className="modern-command-label">Date</span>
                                      <input
                                        type="date"
                                        className="avel-form-control modern-pipeline-details__date-input"
                                        value={draftDatePart}
                                        onChange={(event) => setDraftDatePart(event.target.value)}
                                      />
                                    </label>
                                    <div className="modern-pipeline-details__date-field">
                                      <SelectMenu
                                        label="Time"
                                        value={draftTimePart}
                                        options={timeOptions}
                                        onChange={setDraftTimePart}
                                        className="modern-pipeline-details__time-field"
                                        labelClassName="modern-command-label modern-pipeline-details__time-label"
                                        comboClassName="modern-pipeline-details__time-combo"
                                        triggerClassName="modern-pipeline-details__time-trigger"
                                        triggerValueClassName="modern-pipeline-details__time-trigger-value"
                                        triggerCaretClassName="modern-pipeline-details__time-trigger-caret"
                                        menuClassName="modern-pipeline-details__time-menu"
                                        optionClassName="modern-pipeline-details__time-option"
                                        optionDotClassName="modern-pipeline-details__time-option-dot"
                                        optionToneClassNamePrefix="modern-pipeline-details__time-option--tone-"
                                        emptyLabel="Select time"
                                      />
                                    </div>
                                  </div>
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
                                      disabled={saving || !onSaveHistoryDate || draftDatePart === '' || draftTimePart === ''}
                                      onClick={async () => {
                                        if (!onSaveHistoryDate || !details) {
                                          return;
                                        }
                                        setSaving(true);
                                        setSaveError('');
                                        const result = await onSaveHistoryDate(details, {
                                          historyID: entry.historyID,
                                          newDate: combineDateTimeParts(draftDatePart, draftTimePart),
                                          originalDate,
                                          editNote
                                        });
                                        setSaving(false);
                                        if (result) {
                                          setSaveError(result);
                                          return;
                                        }
                                        setEditingHistoryID(0);
                                        setDraftDatePart('');
                                        setDraftTimePart('');
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
                                        setDraftDatePart('');
                                        setDraftTimePart('');
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
                  Editing transition: {toDisplayText(editingEntry.statusFrom)} -&gt; {toDisplayText(editingEntry.statusTo)}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
    </InlineModal>
  );
}
