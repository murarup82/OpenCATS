import { useEffect, useMemo, useState } from 'react';
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
  onClose: () => void;
  onAssigned: (message: string) => void;
};

export function JobOrderAssignCandidateModal({
  isOpen,
  bootstrap,
  sourceURL,
  subtitle,
  onClose,
  onAssigned
}: Props) {
  const [data, setData] = useState<JobOrderAssignCandidateModernDataResponse | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [appliedSearchTerm, setAppliedSearchTerm] = useState('');
  const [selectedCandidateID, setSelectedCandidateID] = useState<number>(0);
  const [selectedStatusID, setSelectedStatusID] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [confirmRequired, setConfirmRequired] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState('');

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    let isMounted = true;
    setData(null);
    setSearchTerm('');
    setAppliedSearchTerm('');
    setSelectedCandidateID(0);
    setSelectedStatusID(0);
    setLoading(true);
    setPending(false);
    setError('');
    setConfirmRequired(false);
    setConfirmMessage('');

    fetchJobOrderAssignCandidateData(bootstrap, sourceURL, '')
      .then((payload) => {
        if (!isMounted) {
          return;
        }
        setData(payload);
        const defaultStatusID = Number(payload.meta.defaultAssignmentStatusID || 0);
        setSelectedStatusID(defaultStatusID > 0 ? defaultStatusID : 0);
      })
      .catch((err: unknown) => {
        if (!isMounted) {
          return;
        }
        setError(err instanceof Error ? err.message : 'Unable to load candidate search modal.');
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [bootstrap, isOpen, sourceURL]);

  const refreshSearch = async (query: string) => {
    setLoading(true);
    setError('');
    try {
      const payload = await fetchJobOrderAssignCandidateData(bootstrap, sourceURL, query);
      setData(payload);
      setSelectedCandidateID(0);
      setAppliedSearchTerm(query.trim());
      if (selectedStatusID <= 0) {
        const defaultStatusID = Number(payload.meta.defaultAssignmentStatusID || 0);
        setSelectedStatusID(defaultStatusID > 0 ? defaultStatusID : 0);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to search candidates.');
    } finally {
      setLoading(false);
    }
  };

  const visibleRows = useMemo(() => data?.rows || [], [data?.rows]);

  const submitAssign = async (forceConfirm: boolean) => {
    if (!data) {
      return;
    }
    if (selectedCandidateID <= 0) {
      setError('Select a candidate first.');
      return;
    }

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
        onAssigned(result.message || 'Candidate added to job order.');
        onClose();
        return;
      }

      if (result.code === 'requiresConfirm') {
        setConfirmRequired(true);
        setConfirmMessage(result.message || 'Candidate was previously rejected for this role. Re-assign anyway?');
        return;
      }

      setError(result.message || 'Unable to add candidate to job order.');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to add candidate to job order.');
    } finally {
      setPending(false);
    }
  };

  const title = data ? `Assign Candidate: ${data.meta.jobOrderTitle}` : 'Assign Candidate';
  const hasRows = visibleRows.length > 0;
  const canAssign = !loading && !pending && selectedCandidateID > 0;

  return (
    <Modal
      isOpen={isOpen}
      title={title}
      onClose={onClose}
      size="lg"
      closeOnEscape={!pending}
      closeOnBackdrop={!pending}
      footer={
        <>
          <button type="button" className="modern-btn modern-btn--secondary" onClick={onClose} disabled={pending}>
            Close
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
              {pending ? 'Assigning...' : 'Assign Candidate'}
            </button>
          )}
        </>
      }
    >
      <div className="avel-assign-candidate-modal">
        {subtitle ? <p className="avel-assign-candidate-modal__subtitle">{subtitle}</p> : null}
        <p className="avel-assign-candidate-modal__hint">
          Search candidates by name, then assign directly from this modal.
        </p>

        <form
          className="modern-command-search avel-assign-candidate-modal__search"
          onSubmit={(event) => {
            event.preventDefault();
            void refreshSearch(searchTerm);
          }}
        >
          <span className="modern-command-label">Search Candidates</span>
          <span className="modern-command-search__shell">
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Type candidate name"
              disabled={loading || pending}
            />
          </span>
        </form>

        {data?.meta.canSetStatusOnAdd ? (
          <label className="modern-command-field">
            <span className="modern-command-label">Initial Status</span>
            <select
              className="avel-form-control"
              value={selectedStatusID > 0 ? String(selectedStatusID) : ''}
              onChange={(event) => setSelectedStatusID(Number(event.target.value || 0))}
              disabled={loading || pending}
            >
              {data.options.assignmentStatuses.map((statusOption) => (
                <option key={statusOption.statusID} value={String(statusOption.statusID)}>
                  {statusOption.status}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        {loading ? <div className="modern-state">Loading candidates...</div> : null}
        {error !== '' ? (
          <div className="modern-state modern-state--error">
            {error}
            {sourceURL.trim() !== '' ? (
              <a className="modern-link" href={sourceURL}>
                Open legacy assignment
              </a>
            ) : null}
          </div>
        ) : null}
        {confirmRequired && confirmMessage !== '' ? (
          <div className="modern-state modern-state--warning">{confirmMessage}</div>
        ) : null}
        {!loading && appliedSearchTerm !== '' && !hasRows ? (
          <div className="avel-assign-candidate-modal__empty">No candidates found for this search.</div>
        ) : null}
        {!loading && appliedSearchTerm === '' && !hasRows ? (
          <div className="avel-assign-candidate-modal__empty">
            Enter a name and click search to find candidates.
          </div>
        ) : null}

        {hasRows ? (
          <div className="avel-assign-candidate-modal__list" role="listbox" aria-label="Candidate options">
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
                  className={`avel-assign-candidate-modal__item${isSelected ? ' is-selected' : ''}`}
                  onClick={() => setSelectedCandidateID(candidateID)}
                  disabled={pending || isAssigned || candidateID <= 0}
                >
                  <span className="avel-assign-candidate-modal__item-title">{row.fullName || `Candidate #${candidateID}`}</span>
                  <span className="avel-assign-candidate-modal__item-meta">
                    {row.city && row.state ? `${row.city}, ${row.state}` : row.city || row.state || 'Location not set'}
                    {row.ownerName ? ` • ${row.ownerName}` : ''}
                  </span>
                  {row.keySkills ? <span className="avel-assign-candidate-modal__item-skills">{row.keySkills}</span> : null}
                  {isAssigned ? <span className="avel-assign-candidate-modal__badge">Already in pipeline</span> : null}
                </button>
              );
            })}
          </div>
        ) : null}

        {data ? (
          <div className="modern-table-actions">
            <a className="modern-btn modern-btn--mini modern-btn--secondary" href={data.actions.legacyURL}>
              Open Legacy Assignment
            </a>
          </div>
        ) : null}
      </div>
    </Modal>
  );
}
