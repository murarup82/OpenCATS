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
  if (normalized === '') return '';
  if (normalized.includes('T')) return normalized.slice(0, 19);
  return normalized.replace(' ', 'T').slice(0, 19);
}

function toDateTimeParts(rawValue: string): { date: string; time: string } {
  const normalized = toLocalDateTimeInput(rawValue);
  if (normalized === '' || !normalized.includes('T')) return { date: '', time: '' };
  const [datePart, timePartRaw] = normalized.split('T');
  return { date: datePart || '', time: String(timePartRaw || '').slice(0, 5) };
}

function combineDateTimeParts(datePart: string, timePart: string): string {
  const d = String(datePart || '').trim();
  const t = String(timePart || '').trim();
  if (d === '' || t === '') return '';
  return `${d}T${t}:00`;
}

function pad2(value: number): string {
  return value < 10 ? `0${value}` : String(value);
}

function toTimeLabel(timeValue: string): string {
  const match = String(timeValue || '').trim().match(/^(\d{2}):(\d{2})$/);
  if (!match) return timeValue;
  const hour24 = Number(match[1]);
  const minute = Number(match[2]);
  if (Number.isNaN(hour24) || Number.isNaN(minute)) return timeValue;
  const suffix = hour24 >= 12 ? 'PM' : 'AM';
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return `${pad2(hour12)}:${pad2(minute)} ${suffix}`;
}

const TIME_OPTIONS_15_MIN = Array.from({ length: 24 * 4 }, (_, index) => {
  const hour = Math.floor(index / 4);
  const minute = (index % 4) * 15;
  const value = `${pad2(hour)}:${pad2(minute)}`;
  return { value, label: toTimeLabel(value) };
});

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];
const DAY_NAMES = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function MiniCalendar({ value, onChange }: { value: string; onChange: (date: string) => void }) {
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${pad2(today.getMonth() + 1)}-${pad2(today.getDate())}`;

  const parsedValue = value ? new Date(value + 'T12:00:00') : null;
  const initYear = parsedValue && !Number.isNaN(parsedValue.getTime()) ? parsedValue.getFullYear() : today.getFullYear();
  const initMonth = parsedValue && !Number.isNaN(parsedValue.getTime()) ? parsedValue.getMonth() : today.getMonth();

  const [viewYear, setViewYear] = useState(initYear);
  const [viewMonth, setViewMonth] = useState(initMonth);

  useEffect(() => {
    if (!value) return;
    const p = new Date(value + 'T12:00:00');
    if (!Number.isNaN(p.getTime())) {
      setViewYear(p.getFullYear());
      setViewMonth(p.getMonth());
    }
  }, [value]);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  };

  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

  type Cell = { day: number; month: number; year: number; inMonth: boolean };
  const cells: Cell[] = [];
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const m = viewMonth === 0 ? 11 : viewMonth - 1;
    const y = viewMonth === 0 ? viewYear - 1 : viewYear;
    cells.push({ day: daysInPrevMonth - i, month: m, year: y, inMonth: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, month: viewMonth, year: viewYear, inMonth: true });
  }
  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++) {
    const m = viewMonth === 11 ? 0 : viewMonth + 1;
    const y = viewMonth === 11 ? viewYear + 1 : viewYear;
    cells.push({ day: d, month: m, year: y, inMonth: false });
  }

  return (
    <div className="mpd-calendar">
      <div className="mpd-calendar__nav-row">
        <button type="button" className="mpd-calendar__nav" onClick={prevMonth} aria-label="Previous month">‹</button>
        <span className="mpd-calendar__month-label">{MONTH_NAMES[viewMonth]} {viewYear}</span>
        <button type="button" className="mpd-calendar__nav" onClick={nextMonth} aria-label="Next month">›</button>
      </div>
      <div className="mpd-calendar__grid">
        {DAY_NAMES.map((d) => (
          <span key={d} className="mpd-calendar__day-head">{d}</span>
        ))}
        {cells.map((cell, i) => {
          const cellStr = `${cell.year}-${pad2(cell.month + 1)}-${pad2(cell.day)}`;
          const isSelected = cellStr === value;
          const isToday = cellStr === todayStr;
          return (
            <button
              key={i}
              type="button"
              className={`mpd-calendar__day${cell.inMonth ? '' : ' is-outside'}${isSelected ? ' is-selected' : ''}${isToday && !isSelected ? ' is-today' : ''}`}
              onClick={() => onChange(cellStr)}
            >
              {cell.day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function PipelineDetailsInlineModal({
  isOpen,
  title,
  details,
  loading,
  error,
  onClose,
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
    if (!details || editingHistoryID <= 0) return null;
    return details.history.find((item) => item.historyID === editingHistoryID) || null;
  }, [details, editingHistoryID]);

  const timeOptions = useMemo(() => {
    const normalized = String(draftTimePart || '').trim();
    if (normalized === '') return TIME_OPTIONS_15_MIN;
    const hasCurrent = TIME_OPTIONS_15_MIN.some((option) => option.value === normalized);
    if (hasCurrent) return TIME_OPTIONS_15_MIN;
    return [{ value: normalized, label: `${toTimeLabel(normalized)} (current)` }, ...TIME_OPTIONS_15_MIN];
  }, [draftTimePart]);

  const cancelEdit = () => {
    setEditingHistoryID(0);
    setDraftDatePart('');
    setDraftTimePart('');
    setOriginalDate('');
    setEditNote('');
    setSaveError('');
  };

  if (!isOpen) return null;

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
                      <tr key={entry.historyID} className={isEditing ? 'is-editing' : ''}>
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
                            {isEditing ? (
                              <span className="modern-pipeline-details__editing-badge">Editing…</span>
                            ) : (
                              <button
                                type="button"
                                className="modern-btn modern-btn--mini modern-btn--secondary"
                                disabled={editingHistoryID > 0}
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
              <div className="mpd-edit-panel">
                <div className="mpd-edit-panel__header">
                  <span className="mpd-edit-panel__label">Editing transition:</span>
                  <span className={`modern-status modern-status--${editingEntry.statusFromSlug || 'unknown'}`}>
                    {toDisplayText(editingEntry.statusFrom)}
                  </span>
                  <span className="modern-pipeline-details__status-arrow">→</span>
                  <span className={`modern-status modern-status--${editingEntry.statusToSlug || 'unknown'}`}>
                    {toDisplayText(editingEntry.statusTo)}
                  </span>
                  <span className="mpd-edit-panel__ts">{toDisplayText(editingEntry.dateDisplay)}</span>
                </div>
                <div className="mpd-edit-panel__body">
                  <div className="mpd-edit-panel__pickers">
                    <div className="mpd-edit-panel__date-col">
                      <span className="modern-command-label">Date</span>
                      <MiniCalendar value={draftDatePart} onChange={setDraftDatePart} />
                    </div>
                    <div className="mpd-edit-panel__time-col">
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
                        if (!onSaveHistoryDate || !details) return;
                        setSaving(true);
                        setSaveError('');
                        const result = await onSaveHistoryDate(details, {
                          historyID: editingEntry.historyID,
                          newDate: combineDateTimeParts(draftDatePart, draftTimePart),
                          originalDate,
                          editNote
                        });
                        setSaving(false);
                        if (result) { setSaveError(result); return; }
                        cancelEdit();
                      }}
                    >
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      type="button"
                      className="modern-btn modern-btn--mini modern-btn--secondary"
                      disabled={saving}
                      onClick={cancelEdit}
                    >
                      Cancel
                    </button>
                  </div>
                  {saveError ? <div className="modern-state modern-state--error">{saveError}</div> : null}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </InlineModal>
  );
}
