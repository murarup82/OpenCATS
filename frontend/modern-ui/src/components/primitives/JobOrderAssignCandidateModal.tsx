import { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import {
  assignCandidateToJobOrder,
  fetchJobOrderAssignCandidateData
} from '../../lib/api';
import type {
  JobOrderAssignCandidateModernDataResponse,
  UIModeBootstrap
} from '../../types';
import { Modal } from '../../ui-core';

type Props = {
  isOpen: boolean;
  bootstrap: UIModeBootstrap;
  sourceURL: string;
  subtitle?: string;
  initialSearchTerm?: string;
  onClose: () => void;
  onAssigned: (message: string) => void;
};

function toStr(value: unknown): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return '';
}

export function JobOrderAssignCandidateModal({
  isOpen,
  bootstrap,
  sourceURL,
  subtitle,
  initialSearchTerm,
  onClose,
  onAssigned
}: Props) {
  const [data, setData] = useState<JobOrderAssignCandidateModernDataResponse | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCandidateID, setSelectedCandidateID] = useState(0);
  const [selectedStatusID, setSelectedStatusID] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [confirmRequired, setConfirmRequired] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState('');

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initialSearchDone = useRef(false);

  const searchCandidates = useCallback(
    async (query: string) => {
      setLoading(true);
      setError('');
      try {
        const payload = await fetchJobOrderAssignCandidateData(bootstrap, sourceURL, query);
        setData(payload);
        setSelectedCandidateID(0);
        const defaultStatusID = Number(payload.meta.defaultAssignmentStatusID || 0);
        if (defaultStatusID > 0 && selectedStatusID <= 0) {
          setSelectedStatusID(defaultStatusID);
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Unable to load candidates.');
      } finally {
        setLoading(false);
      }
    },
    [bootstrap, sourceURL, selectedStatusID]
  );

  useEffect(() => {
    if (!isOpen) {
      initialSearchDone.current = false;
      return;
    }

    const initialQuery = String(initialSearchTerm || '').trim();
    setSearchTerm(initialQuery);
    setData(null);
    setSelectedCandidateID(0);
    setSelectedStatusID(0);
    setPending(false);
    setError('');
    setConfirmRequired(false);
    setConfirmMessage('');
    initialSearchDone.current = true;

    void searchCandidates(initialQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, sourceURL]);

  useEffect(() => {
    if (!isOpen || !initialSearchDone.current) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      void searchCandidates(searchTerm);
    }, 350);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchTerm]);

  const visibleRows = useMemo(() => data?.rows || [], [data?.rows]);

  const submitAssign = async (forceConfirm: boolean) => {
    if (!data || selectedCandidateID <= 0) return;

    setPending(true);
    setError('');
    try {
      const result = await assignCandidateToJobOrder(data.actions.addToPipelineURL, {
        candidateID: selectedCandidateID,
        jobOrderID: Number(data.meta.jobOrderID || 0),
        securityToken: data.actions.securityToken || '',
        confirmReapplyRejected: forceConfirm,
        assignmentStatusID: selectedStatusID > 0 ? selectedStatusID : undefined
      });

      if (result.success) {
        onAssigned(result.message || 'Candidate assigned to pipeline.');
        onClose();
        return;
      }

      if (result.code === 'requiresConfirm') {
        setConfirmRequired(true);
        setConfirmMessage(result.message || 'Candidate was previously rejected for this role. Re-assign anyway?');
        return;
      }

      setError(result.message || 'Unable to assign candidate.');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to assign candidate.');
    } finally {
      setPending(false);
    }
  };

  const hasRows = visibleRows.length > 0;
  const canAssign = !loading && !pending && selectedCandidateID > 0;

  return (
    <Modal
      isOpen={isOpen}
      title="Assign Candidate"
      onClose={onClose}
      size="lg"
      closeOnEscape={!pending}
      closeOnBackdrop={!pending}
      footer={
        <>
          <button type="button" className="modern-btn modern-btn--secondary" onClick={onClose} disabled={pending}>
            Cancel
          </button>
          {confirmRequired ? (
            <button
              type="button"
              className="modern-btn modern-btn--emphasis"
              disabled={!canAssign}
              onClick={() => {
                setConfirmRequired(false);
                void submitAssign(true);
              }}
            >
              {pending ? 'Assigning...' : 'Re-Assign Anyway'}
            </button>
          ) : (
            <button
              type="button"
              className="modern-btn modern-btn--emphasis"
              disabled={!canAssign}
              onClick={() => void submitAssign(false)}
            >
              {pending ? 'Assigning...' : 'Assign to Pipeline'}
            </button>
          )}
        </>
      }
    >
      <div className="avel-quick-assign">
        <div className="avel-quick-assign__panel avel-quick-assign__panel--single">
          <div className="avel-quick-assign__panel-head">
            <span className="avel-quick-assign__step-badge">1</span>
            <span className="avel-quick-assign__panel-label">
              {subtitle || (data ? toStr(data.meta.jobOrderTitle) : 'Job Order')}
            </span>
          </div>

          <span className="modern-command-search avel-quick-assign__panel-search">
            <span className="modern-command-search__shell">
              <input
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Filter by name…"
                aria-label="Search candidates"
                disabled={loading || pending}
              />
            </span>
          </span>

          {data?.meta.canSetStatusOnAdd ? (
            <label className="modern-command-field">
              <span className="modern-command-label">Initial Status</span>
              <select
                className="avel-form-control"
                value={selectedStatusID > 0 ? String(selectedStatusID) : ''}
                onChange={(e) => setSelectedStatusID(Number(e.target.value || 0))}
                disabled={loading || pending}
              >
                {data.options.assignmentStatuses.map((opt) => (
                  <option key={opt.statusID} value={String(opt.statusID)}>
                    {opt.status}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          {loading ? <div className="modern-state">Searching candidates…</div> : null}

          {!loading && hasRows ? (
            <>
              <div className="avel-quick-assign__count">
                {visibleRows.length} candidate{visibleRows.length !== 1 ? 's' : ''}
              </div>
              <div className="avel-quick-assign__list" role="listbox" aria-label="Candidates">
                {visibleRows.map((row) => {
                  const candidateID = Number(row.candidateID || 0);
                  const isSelected = candidateID === selectedCandidateID;
                  const isAssigned = !!row.inPipeline;
                  return (
                    <button
                      key={candidateID}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      className={`avel-quick-assign__item${isSelected ? ' is-selected' : ''}${isAssigned ? ' is-assigned' : ''}`}
                      onClick={() => !isAssigned && setSelectedCandidateID(candidateID)}
                      disabled={pending || isAssigned || candidateID <= 0}
                    >
                      <span className="avel-quick-assign__item-title">{row.fullName || `Candidate #${candidateID}`}</span>
                      <span className="avel-quick-assign__item-meta">
                        {row.city && row.state
                          ? `${row.city}, ${row.state}`
                          : row.city || row.state || 'Location not set'}
                        {row.ownerName ? ` · ${row.ownerName}` : ''}
                      </span>
                      {row.keySkills ? (
                        <span className="avel-quick-assign__item-skills">{row.keySkills}</span>
                      ) : null}
                      {isAssigned ? (
                        <span className="avel-quick-assign__badge">Already in pipeline</span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </>
          ) : null}

          {!loading && !hasRows && searchTerm.trim() !== '' ? (
            <div className="avel-quick-assign__empty">No candidates found for this search.</div>
          ) : null}

          {!loading && !hasRows && searchTerm.trim() === '' && data ? (
            <div className="avel-quick-assign__empty">Type a name to search for candidates.</div>
          ) : null}
        </div>

        {error !== '' ? <div className="modern-state modern-state--error">{error}</div> : null}
        {confirmRequired && confirmMessage !== '' ? (
          <div className="modern-state modern-state--warning">{confirmMessage}</div>
        ) : null}
      </div>
    </Modal>
  );
}
